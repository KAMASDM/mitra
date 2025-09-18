// src/services/auditService.js
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  and,
  or,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const AUDIT_LOGS_COLLECTION = 'audit_logs';
const SYSTEM_EVENTS_COLLECTION = 'system_events';

// Audit event types
export const AUDIT_EVENTS = {
  // User Management
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_STATUS_CHANGED: 'USER_STATUS_CHANGED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  
  // Professional Management
  PROFESSIONAL_APPLIED: 'PROFESSIONAL_APPLIED',
  PROFESSIONAL_APPROVED: 'PROFESSIONAL_APPROVED',
  PROFESSIONAL_REJECTED: 'PROFESSIONAL_REJECTED',
  PROFESSIONAL_UPDATED: 'PROFESSIONAL_UPDATED',
  PROFESSIONAL_SUSPENDED: 'PROFESSIONAL_SUSPENDED',
  
  // Booking Management
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_COMPLETED: 'BOOKING_COMPLETED',
  BOOKING_RESCHEDULED: 'BOOKING_RESCHEDULED',
  
  // Payment Events
  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  
  // Admin Actions
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  ADMIN_ACTION: 'ADMIN_ACTION',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  DATA_EXPORTED: 'DATA_EXPORTED',
  BULK_ACTION: 'BULK_ACTION',
  
  // Security Events
  FAILED_LOGIN: 'FAILED_LOGIN',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  SECURITY_BREACH: 'SECURITY_BREACH',
  
  // System Events
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SYSTEM_WARNING: 'SYSTEM_WARNING',
  MAINTENANCE_START: 'MAINTENANCE_START',
  MAINTENANCE_END: 'MAINTENANCE_END',
  BACKUP_CREATED: 'BACKUP_CREATED',
  BACKUP_RESTORED: 'BACKUP_RESTORED'
};

// Risk levels
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Log an audit event
 */
export const logAuditEvent = async (eventData) => {
  try {
    const auditLog = {
      eventType: eventData.eventType,
      eventCategory: getEventCategory(eventData.eventType),
      riskLevel: eventData.riskLevel || getRiskLevel(eventData.eventType),
      userId: eventData.userId || null,
      adminId: eventData.adminId || getCurrentAdminId(),
      targetUserId: eventData.targetUserId || null,
      targetResourceId: eventData.targetResourceId || null,
      targetResourceType: eventData.targetResourceType || null,
      action: eventData.action || '',
      details: eventData.details || {},
      metadata: {
        userAgent: navigator?.userAgent || '',
        ipAddress: eventData.ipAddress || 'unknown',
        sessionId: eventData.sessionId || generateSessionId(),
        timestamp: new Date(),
        platform: 'web'
      },
      changes: eventData.changes || null, // For update events
      previousValues: eventData.previousValues || null,
      newValues: eventData.newValues || null,
      success: eventData.success !== false, // Default to true unless explicitly false
      errorMessage: eventData.errorMessage || null,
      duration: eventData.duration || null, // For performance tracking
      tags: eventData.tags || [],
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, AUDIT_LOGS_COLLECTION), auditLog);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', auditLog.eventType, auditLog);
    }

    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't fail the main operation if audit logging fails
    return { error: error.message, success: false };
  }
};

/**
 * Get audit logs with filtering and pagination
 */
export const getAuditLogs = async (filters = {}) => {
  try {
    let q = collection(db, AUDIT_LOGS_COLLECTION);
    const queryConstraints = [];

    // Apply filters
    if (filters.eventType) {
      queryConstraints.push(where('eventType', '==', filters.eventType));
    }

    if (filters.eventCategory) {
      queryConstraints.push(where('eventCategory', '==', filters.eventCategory));
    }

    if (filters.riskLevel) {
      queryConstraints.push(where('riskLevel', '==', filters.riskLevel));
    }

    if (filters.userId) {
      queryConstraints.push(where('userId', '==', filters.userId));
    }

    if (filters.adminId) {
      queryConstraints.push(where('adminId', '==', filters.adminId));
    }

    if (filters.targetUserId) {
      queryConstraints.push(where('targetUserId', '==', filters.targetUserId));
    }

    if (filters.success !== undefined) {
      queryConstraints.push(where('success', '==', filters.success));
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      queryConstraints.push(
        where('createdAt', '>=', Timestamp.fromDate(new Date(filters.startDate))),
        where('createdAt', '<=', Timestamp.fromDate(new Date(filters.endDate)))
      );
    }

    // Add ordering
    queryConstraints.push(orderBy('createdAt', 'desc'));

    // Add limit
    if (filters.limit) {
      queryConstraints.push(limit(filters.limit));
    }

    // Add pagination
    if (filters.startAfterDoc) {
      queryConstraints.push(startAfter(filters.startAfterDoc));
    }

    q = query(q, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const logs = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        metadata: {
          ...data.metadata,
          timestamp: data.metadata?.timestamp?.toDate?.() || data.metadata?.timestamp
        }
      });
    });

    return {
      logs,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      success: true
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Get audit statistics
 */
export const getAuditStatistics = async (dateRange = {}) => {
  try {
    const { startDate, endDate } = dateRange;
    let q = collection(db, AUDIT_LOGS_COLLECTION);
    const queryConstraints = [];

    if (startDate && endDate) {
      queryConstraints.push(
        where('createdAt', '>=', Timestamp.fromDate(new Date(startDate))),
        where('createdAt', '<=', Timestamp.fromDate(new Date(endDate)))
      );
    }

    if (queryConstraints.length > 0) {
      q = query(q, ...queryConstraints);
    }

    const querySnapshot = await getDocs(q);
    const logs = [];
    
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    // Calculate statistics
    const statistics = {
      totalEvents: logs.length,
      eventsByType: {},
      eventsByCategory: {},
      eventsByRiskLevel: {},
      eventsByUser: {},
      failedEvents: logs.filter(log => !log.success).length,
      successfulEvents: logs.filter(log => log.success).length,
      criticalEvents: logs.filter(log => log.riskLevel === RISK_LEVELS.CRITICAL).length,
      highRiskEvents: logs.filter(log => log.riskLevel === RISK_LEVELS.HIGH).length,
      uniqueUsers: new Set(logs.map(log => log.userId).filter(Boolean)).size,
      uniqueAdmins: new Set(logs.map(log => log.adminId).filter(Boolean)).size,
      eventsToday: logs.filter(log => {
        const logDate = log.createdAt?.toDate?.() || log.createdAt;
        const today = new Date();
        return logDate && 
               logDate.toDateString() === today.toDateString();
      }).length,
      eventsThisWeek: logs.filter(log => {
        const logDate = log.createdAt?.toDate?.() || log.createdAt;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate && logDate >= weekAgo;
      }).length
    };

    // Group by type
    logs.forEach(log => {
      statistics.eventsByType[log.eventType] = (statistics.eventsByType[log.eventType] || 0) + 1;
      statistics.eventsByCategory[log.eventCategory] = (statistics.eventsByCategory[log.eventCategory] || 0) + 1;
      statistics.eventsByRiskLevel[log.riskLevel] = (statistics.eventsByRiskLevel[log.riskLevel] || 0) + 1;
      
      if (log.userId) {
        statistics.eventsByUser[log.userId] = (statistics.eventsByUser[log.userId] || 0) + 1;
      }
    });

    return { statistics, success: true };
  } catch (error) {
    console.error('Error getting audit statistics:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Search audit logs
 */
export const searchAuditLogs = async (searchParams) => {
  try {
    const { query: searchQuery, filters = {} } = searchParams;
    
    // Get logs with filters
    const result = await getAuditLogs({
      ...filters,
      limit: 1000 // Get more for searching
    });

    if (!result.success) {
      return result;
    }

    let filteredLogs = result.logs;

    // Apply text search if provided
    if (searchQuery && searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredLogs = result.logs.filter(log => {
        return (
          log.eventType?.toLowerCase().includes(lowerQuery) ||
          log.action?.toLowerCase().includes(lowerQuery) ||
          log.userId?.toLowerCase().includes(lowerQuery) ||
          log.targetUserId?.toLowerCase().includes(lowerQuery) ||
          JSON.stringify(log.details || {}).toLowerCase().includes(lowerQuery) ||
          log.errorMessage?.toLowerCase().includes(lowerQuery)
        );
      });
    }

    return { logs: filteredLogs, success: true };
  } catch (error) {
    console.error('Error searching audit logs:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Get security events (high/critical risk events)
 */
export const getSecurityEvents = async (dateRange = {}) => {
  try {
    const filters = {
      ...dateRange,
      limit: 100
    };

    // Get high and critical risk events
    const [highRiskResult, criticalRiskResult] = await Promise.all([
      getAuditLogs({ ...filters, riskLevel: RISK_LEVELS.HIGH }),
      getAuditLogs({ ...filters, riskLevel: RISK_LEVELS.CRITICAL })
    ]);

    const securityEvents = [
      ...(highRiskResult.success ? highRiskResult.logs : []),
      ...(criticalRiskResult.success ? criticalRiskResult.logs : [])
    ];

    // Sort by date descending
    securityEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { events: securityEvents, success: true };
  } catch (error) {
    console.error('Error getting security events:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Log user activity
 */
export const logUserActivity = async (userId, activity, details = {}) => {
  return await logAuditEvent({
    eventType: getActivityEventType(activity),
    userId: userId,
    action: activity,
    details: details,
    riskLevel: RISK_LEVELS.LOW
  });
};

/**
 * Log admin action
 */
export const logAdminAction = async (adminId, action, targetData = {}) => {
  return await logAuditEvent({
    eventType: AUDIT_EVENTS.ADMIN_ACTION,
    adminId: adminId,
    action: action,
    targetUserId: targetData.targetUserId,
    targetResourceId: targetData.targetResourceId,
    targetResourceType: targetData.targetResourceType,
    details: targetData.details || {},
    changes: targetData.changes,
    riskLevel: getAdminActionRiskLevel(action)
  });
};

/**
 * Log security event
 */
export const logSecurityEvent = async (eventType, details = {}) => {
  return await logAuditEvent({
    eventType: eventType,
    userId: details.userId,
    action: details.action || eventType,
    details: details,
    riskLevel: RISK_LEVELS.HIGH,
    tags: ['security', ...(details.tags || [])]
  });
};

/**
 * Log system event
 */
export const logSystemEvent = async (eventType, details = {}) => {
  return await logAuditEvent({
    eventType: eventType,
    action: details.action || eventType,
    details: details,
    riskLevel: details.riskLevel || RISK_LEVELS.LOW,
    tags: ['system', ...(details.tags || [])]
  });
};

/**
 * Export audit logs
 */
export const exportAuditLogs = async (filters = {}, format = 'csv') => {
  try {
    const result = await getAuditLogs({
      ...filters,
      limit: 10000 // Large limit for export
    });

    if (!result.success) {
      return result;
    }

    // Process data for export
    const exportData = result.logs.map(log => ({
      'Timestamp': log.createdAt ? new Date(log.createdAt).toISOString() : '',
      'Event Type': log.eventType,
      'Category': log.eventCategory,
      'Risk Level': log.riskLevel,
      'User ID': log.userId || '',
      'Admin ID': log.adminId || '',
      'Target User': log.targetUserId || '',
      'Action': log.action,
      'Success': log.success ? 'Yes' : 'No',
      'Error Message': log.errorMessage || '',
      'IP Address': log.metadata?.ipAddress || '',
      'User Agent': log.metadata?.userAgent || '',
      'Details': JSON.stringify(log.details || {})
    }));

    if (format === 'csv') {
      return generateCSV(exportData, 'audit_logs');
    }

    return { exportData, success: true };
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    return { error: error.message, success: false };
  }
};

// Helper functions
const getEventCategory = (eventType) => {
  if (eventType.includes('USER')) return 'user_management';
  if (eventType.includes('PROFESSIONAL')) return 'professional_management';
  if (eventType.includes('BOOKING')) return 'booking_management';
  if (eventType.includes('PAYMENT')) return 'payment_management';
  if (eventType.includes('ADMIN')) return 'admin_actions';
  if (eventType.includes('SYSTEM')) return 'system_events';
  return 'other';
};

const getRiskLevel = (eventType) => {
  const criticalEvents = [
    AUDIT_EVENTS.SECURITY_BREACH,
    AUDIT_EVENTS.ADMIN_LOGIN,
    AUDIT_EVENTS.USER_DELETED,
    AUDIT_EVENTS.DATA_EXPORTED
  ];

  const highRiskEvents = [
    AUDIT_EVENTS.FAILED_LOGIN,
    AUDIT_EVENTS.ACCOUNT_LOCKED,
    AUDIT_EVENTS.SUSPICIOUS_ACTIVITY,
    AUDIT_EVENTS.USER_STATUS_CHANGED,
    AUDIT_EVENTS.PROFESSIONAL_REJECTED,
    AUDIT_EVENTS.PAYMENT_FAILED
  ];

  const mediumRiskEvents = [
    AUDIT_EVENTS.USER_UPDATED,
    AUDIT_EVENTS.PROFESSIONAL_APPROVED,
    AUDIT_EVENTS.BOOKING_CANCELLED,
    AUDIT_EVENTS.SETTINGS_UPDATED
  ];

  if (criticalEvents.includes(eventType)) return RISK_LEVELS.CRITICAL;
  if (highRiskEvents.includes(eventType)) return RISK_LEVELS.HIGH;
  if (mediumRiskEvents.includes(eventType)) return RISK_LEVELS.MEDIUM;
  return RISK_LEVELS.LOW;
};

const getActivityEventType = (activity) => {
  const activityMap = {
    'login': AUDIT_EVENTS.USER_LOGIN,
    'logout': AUDIT_EVENTS.USER_LOGOUT,
    'profile_update': AUDIT_EVENTS.USER_UPDATED,
    'booking_created': AUDIT_EVENTS.BOOKING_CREATED,
    'payment_completed': AUDIT_EVENTS.PAYMENT_COMPLETED
  };
  return activityMap[activity] || activity;
};

const getAdminActionRiskLevel = (action) => {
  const criticalActions = ['delete_user', 'export_data', 'system_settings'];
  const highRiskActions = ['suspend_user', 'approve_professional', 'bulk_action'];
  
  if (criticalActions.some(a => action.includes(a))) return RISK_LEVELS.CRITICAL;
  if (highRiskActions.some(a => action.includes(a))) return RISK_LEVELS.HIGH;
  return RISK_LEVELS.MEDIUM;
};

const getCurrentAdminId = () => {
  const user = JSON.parse(localStorage.getItem('loginInfo'));
  return user?.user?.id || 'unknown_admin';
};

const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// CSV generation helper (simplified version)
const generateCSV = (data, filename) => {
  const headers = Object.keys(data[0] || {});
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      let value = row[header] || '';
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      return value;
    });
    csvContent += values.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  return {
    success: true,
    url: url,
    filename: `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  };
};