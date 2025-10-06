// src/services/adminService.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  and,
  or,
  Timestamp,
  writeBatch,
  increment,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendEmail } from './emailService'; // You'll need to create this
import { generateReport } from '../utils/reportGenerator'; // You'll need to create this
import { uploadProfilePicture } from './userService'; // Import the upload function

// Collections
const USERS_COLLECTION = 'users';
const PROFESSIONALS_COLLECTION = 'professionals';
const BOOKINGS_COLLECTION = 'bookings';
const PAYMENTS_COLLECTION = 'payments';
const REVIEWS_COLLECTION = 'reviews';
const PLATFORM_SETTINGS_COLLECTION = 'platform_settings';
const AUDIT_LOGS_COLLECTION = 'audit_logs';

// =================== USER MANAGEMENT ===================

export const getProfessionalTypes = async () => {
  try {
    const typesSnapshot = await getDocs(collection(db, 'professional_types'));
    const types = typesSnapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
    return { types, success: true };
  } catch (error) {
    console.error('Error getting professional types:', error);
    return { error: error.message, success: false };
  }
};

// Get all users with pagination and filters
// export const getAllUsers = async (filters = {}) => {
//   try {
//     let q = collection(db, USERS_COLLECTION);
//     const queryConstraints = [];

//     if (filters.role) {
//       queryConstraints.push(where('role', '==', filters.role));
//     }

//     q = query(q, ...queryConstraints);
//     const querySnapshot = await getDocs(q);

//     const users = [];
//     querySnapshot.forEach((doc) => {
//       const userData = doc.data();



//       const createdAtTimestamp = userData.created_at || userData.createdAt;
//       const createdAtDate = createdAtTimestamp?.toDate ? createdAtTimestamp.toDate() : null;


//       const lastLoginTimestamp = userData.last_login_at;
//       const lastLoginDate = lastLoginTimestamp?.toDate ? lastLoginTimestamp.toDate() : null;

//       users.push({
//         id: doc.id,
//         ...userData,
//         createdAt: createdAtDate,
//         lastLoginAt: lastLoginDate,
//       });
//     });


//     users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

//     return { users, success: true };
//   } catch (error) {
//     console.error('Error getting all users:', error);
//     return { error: error.message, success: false };
//   }
// };

export const getAllUsers = async (filters = {}) => {
  try {
    const usersCollectionRef = collection(db, 'users');
    const queryConstraints = [];

    if (filters.role) {
      queryConstraints.push(where('role', '==', filters.role));
    }

    const q = query(usersCollectionRef, ...queryConstraints);
    const usersSnapshot = await getDocs(q);

    const usersPromises = usersSnapshot.docs.map(async (userDoc) => {
      const userData = { id: userDoc.id, ...userDoc.data() };
      let profileData = {};
      let profileSnapshot;


      if (userData.role === 'CLIENT') {
        const clientQuery = query(collection(db, 'clients'), where('user_id', '==', userDoc.id), limit(1));
        profileSnapshot = await getDocs(clientQuery);
      } else if (userData.role === 'PROFESSIONAL') {
        const profQuery = query(collection(db, 'professionals'), where('user_id', '==', userDoc.id), limit(1));
        profileSnapshot = await getDocs(profQuery);
      }

      if (profileSnapshot && !profileSnapshot.empty) {
        profileData = profileSnapshot.docs[0].data();
      }


      const createdAtTimestamp = userData.createdAt || userData.created_at;
      const createdAtDate = createdAtTimestamp?.toDate ? createdAtTimestamp.toDate() : (createdAtTimestamp ? new Date(createdAtTimestamp) : null);

      const lastLoginTimestamp = userData.lastLoginAt || userData.last_login_at;
      const lastLoginDate = lastLoginTimestamp?.toDate ? lastLoginTimestamp.toDate() : null;


      return {
        ...userData,
        ...profileData,
        id: userDoc.id,
        createdAt: createdAtDate,
        lastLoginAt: lastLoginDate,
      };
    });

    let users = await Promise.all(usersPromises);


    users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return { users, success: true };
  } catch (error) {
    console.error('Error getting all users:', error);
    return { error: error.message, success: false };
  }
};

// Get user statistics
export const getUserStatistics = async () => {
  try {
    const [usersSnapshot, professionalsSnapshot, bookingsSnapshot] = await Promise.all([
      getDocs(collection(db, USERS_COLLECTION)),
      getDocs(query(collection(db, PROFESSIONALS_COLLECTION), where('verification_status', '==', 'VERIFIED'))),
      getDocs(collection(db, BOOKINGS_COLLECTION))
    ]);

    const users = [];
    usersSnapshot.forEach(doc => users.push({ ...doc.data(), id: doc.id }));

    const professionals = [];
    professionalsSnapshot.forEach(doc => professionals.push({ ...doc.data(), id: doc.id }));

    const bookings = [];
    bookingsSnapshot.forEach(doc => bookings.push({ ...doc.data(), id: doc.id }));

    const stats = {
      totalUsers: users.length,
      clientUsers: users.filter(u => u.role === 'CLIENT').length,
      professionalUsers: users.filter(u => u.role === 'PROFESSIONAL').length,
      adminUsers: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN').length,
      verifiedProfessionals: professionals.length,
      activeUsers: users.filter(u => u.status !== 'suspended').length,
      suspendedUsers: users.filter(u => u.status === 'suspended').length,
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    };

    return { statistics: stats, success: true };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    return { error: error.message, success: false };
  }
};

// Update user status
export const updateUserStatus = async (userId, newStatus, reason = '') => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const batch = writeBatch(db);

    // Update user status
    batch.update(userRef, {
      status: newStatus,
      statusUpdatedAt: new Date(),
      statusUpdateReason: reason,
      updatedAt: new Date()
    });

    // Log the action
    const auditLogRef = doc(collection(db, AUDIT_LOGS_COLLECTION));
    batch.set(auditLogRef, {
      action: 'USER_STATUS_UPDATE',
      targetUserId: userId,
      newStatus: newStatus,
      reason: reason,
      timestamp: new Date(),
      adminId: getCurrentAdminId(), // You'll need to implement this
    });

    await batch.commit();

    // Send notification email to user
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      await sendUserStatusNotification(userData.email, newStatus, reason);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { error: error.message, success: false };
  }
};

// Delete user (soft delete)
export const deleteUser = async (userId, reason = '') => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const batch = writeBatch(db);

    // Soft delete - mark as deleted instead of actually deleting
    batch.update(userRef, {
      status: 'deleted',
      deletedAt: new Date(),
      deletionReason: reason,
      updatedAt: new Date()
    });

    // Log the action
    const auditLogRef = doc(collection(db, AUDIT_LOGS_COLLECTION));
    batch.set(auditLogRef, {
      action: 'USER_DELETE',
      targetUserId: userId,
      reason: reason,
      timestamp: new Date(),
      adminId: getCurrentAdminId(),
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: error.message, success: false };
  }
};

// =================== PROFESSIONAL MANAGEMENT ===================

// Get pending professional approvals
export const getPendingProfessionals = async () => {
  try {
    // 1. Simplified Query: Remove orderBy to avoid needing a composite index.
    const q = query(
      collection(db, PROFESSIONALS_COLLECTION),
      where('verification_status', '==', 'PENDING')
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { professionals: [], success: true };
    }

    // Get user data for each professional
    const professionalPromises = querySnapshot.docs.map(async (docSnap) => {
      const professionalData = { id: docSnap.id, ...docSnap.data() };

      if (professionalData.user_id) {
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, professionalData.user_id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Merge professional data with user data for display
          return {
            ...professionalData,
            displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            email: userData.email,
            submittedDate: professionalData.createdAt, // Use createdAt for submission date
          };
        }
      }

      // Return professional data even if user is not found, with placeholders
      return {
        ...professionalData,
        displayName: 'User Not Found',
        email: 'N/A',
        submittedDate: professionalData.createdAt,
      };
    });

    let resolvedProfessionals = await Promise.all(professionalPromises);

    // 2. Sort in JavaScript: Manually sort the results after fetching.
    resolvedProfessionals.sort((a, b) => {
      const dateA = a.submittedDate?.toDate?.() || a.submittedDate || 0;
      const dateB = b.submittedDate?.toDate?.() || b.submittedDate || 0;
      return new Date(dateB) - new Date(dateA); // Sort descending (newest first)
    });

    return { professionals: resolvedProfessionals, success: true };
  } catch (error) {
    console.error('Error getting pending professionals:', error);
    return { error: error.message, success: false };
  }
};


// Approve professional
export const approveProfessional = async (professionalId, notes = '') => {
  try {
    const professionalRef = doc(db, PROFESSIONALS_COLLECTION, professionalId);
    const professionalDoc = await getDoc(professionalRef);

    if (!professionalDoc.exists()) {
      return { error: 'Professional not found', success: false };
    }

    const professionalData = professionalDoc.data();
    const batch = writeBatch(db);

    // Update professional status
    batch.update(professionalRef, {
      verification_status: 'VERIFIED',
      verifiedAt: new Date(),
      verificationNotes: notes,
      updatedAt: new Date()
    });

    // Update user role if needed
    if (professionalData.user_id) {
      const userRef = doc(db, USERS_COLLECTION, professionalData.user_id);
      batch.update(userRef, {
        role: 'PROFESSIONAL',
        professionalStatus: 'verified',
        updatedAt: new Date()
      });
    }

    // Log the action
    const auditLogRef = doc(collection(db, AUDIT_LOGS_COLLECTION));
    batch.set(auditLogRef, {
      action: 'PROFESSIONAL_APPROVED',
      targetUserId: professionalData.user_id,
      professionalId: professionalId,
      notes: notes,
      timestamp: new Date(),
      adminId: getCurrentAdminId(),
    });

    await batch.commit();

    // Send approval email
    if (professionalData.user_id) {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, professionalData.user_id));
      if (userDoc.exists()) {
        await sendProfessionalApprovalEmail(userDoc.data().email, true, notes);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error approving professional:', error);
    return { error: error.message, success: false };
  }
};

// Reject professional
export const rejectProfessional = async (professionalId, reason = '') => {
  try {
    const professionalRef = doc(db, PROFESSIONALS_COLLECTION, professionalId);
    const professionalDoc = await getDoc(professionalRef);

    if (!professionalDoc.exists()) {
      return { error: 'Professional not found', success: false };
    }

    const professionalData = professionalDoc.data();
    const batch = writeBatch(db);

    // Update professional status
    batch.update(professionalRef, {
      verification_status: 'REJECTED',
      rejectedAt: new Date(),
      rejectionReason: reason,
      updatedAt: new Date()
    });

    // Log the action
    const auditLogRef = doc(collection(db, AUDIT_LOGS_COLLECTION));
    batch.set(auditLogRef, {
      action: 'PROFESSIONAL_REJECTED',
      targetUserId: professionalData.user_id,
      professionalId: professionalId,
      reason: reason,
      timestamp: new Date(),
      adminId: getCurrentAdminId(),
    });

    await batch.commit();

    // Send rejection email
    if (professionalData.user_id) {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, professionalData.user_id));
      if (userDoc.exists()) {
        await sendProfessionalApprovalEmail(userDoc.data().email, false, reason);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error rejecting professional:', error);
    return { error: error.message, success: false };
  }
};

// =================== PLATFORM STATISTICS ===================

// Get comprehensive platform statistics
export const getPlatformStatistics = async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all collections data
    const [
      usersSnapshot,
      professionalsSnapshot,
      bookingsSnapshot,
      paymentsSnapshot,
      reviewsSnapshot
    ] = await Promise.all([
      getDocs(collection(db, USERS_COLLECTION)),
      getDocs(collection(db, PROFESSIONALS_COLLECTION)),
      getDocs(collection(db, BOOKINGS_COLLECTION)),
      getDocs(collection(db, PAYMENTS_COLLECTION)),
      getDocs(collection(db, REVIEWS_COLLECTION))
    ]);

    // Process users data
    const users = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });

    // Process bookings data
    const bookings = [];
    bookingsSnapshot.forEach(doc => {
      const data = doc.data();
      bookings.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        appointmentDate: data.appointmentDate?.toDate?.() || data.appointmentDate
      });
    });

    // Process payments data
    const payments = [];
    paymentsSnapshot.forEach(doc => {
      const data = doc.data();
      payments.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });

    // Calculate statistics
    const statistics = {
      // User statistics
      totalUsers: users.length,
      totalProfessionals: professionalsSnapshot.size,
      newUsersThisMonth: users.filter(u => u.createdAt && u.createdAt >= thirtyDaysAgo).length,
      newUsersThisWeek: users.filter(u => u.createdAt && u.createdAt >= sevenDaysAgo).length,

      // Booking statistics
      totalSessions: bookings.length,
      completedSessions: bookings.filter(b => b.status === 'completed').length,
      cancelledSessions: bookings.filter(b => b.status === 'cancelled').length,
      pendingSessions: bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length,

      // Revenue statistics
      totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      revenueThisMonth: payments.filter(p => p.createdAt && p.createdAt >= thirtyDaysAgo).reduce((sum, p) => sum + (p.amount || 0), 0),
      revenueThisWeek: payments.filter(p => p.createdAt && p.createdAt >= sevenDaysAgo).reduce((sum, p) => sum + (p.amount || 0), 0),

      // Platform metrics
      averageSessionValue: bookings.length > 0 ? payments.reduce((sum, p) => sum + (p.amount || 0), 0) / bookings.filter(b => b.status === 'completed').length : 0,
      conversionRate: users.length > 0 ? (bookings.length / users.length) * 100 : 0,

      // Reviews and ratings
      totalReviews: reviewsSnapshot.size,
      averageRating: calculateAverageRating(reviewsSnapshot),

      // Growth metrics
      userGrowthRate: calculateGrowthRate(users, thirtyDaysAgo),
      revenueGrowthRate: calculateRevenueGrowthRate(payments, thirtyDaysAgo),
    };

    return { statistics, success: true };
  } catch (error) {
    console.error('Error getting platform statistics:', error);
    return { error: error.message, success: false };
  }
};

// =================== SYSTEM REPORTS ===================

// Generate system reports
export const getSystemReports = async (reportType = 'all', dateRange = {}) => {
  try {
    const reports = {};

    if (reportType === 'all' || reportType === 'users') {
      reports.userReport = await generateUserReport(dateRange);
    }

    if (reportType === 'all' || reportType === 'revenue') {
      reports.revenueReport = await generateRevenueReport(dateRange);
    }

    if (reportType === 'all' || reportType === 'sessions') {
      reports.sessionReport = await generateSessionReport(dateRange);
    }

    if (reportType === 'all' || reportType === 'professionals') {
      reports.professionalReport = await generateProfessionalReport(dateRange);
    }

    return { reports, success: true };
  } catch (error) {
    console.error('Error generating system reports:', error);
    return { error: error.message, success: false };
  }
};

// Export data in various formats
export const exportData = async (dataType, format = 'csv', filters = {}) => {
  try {
    let data = [];

    switch (dataType) {
      case 'users':
        const usersResult = await getAllUsers(filters);
        if (usersResult.success) {
          data = usersResult.users;
        }
        break;

      case 'bookings':
        const bookingsQuery = await getDocs(collection(db, BOOKINGS_COLLECTION));
        bookingsQuery.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() });
        });
        break;

      case 'professionals':
        const professionalsQuery = await getDocs(collection(db, PROFESSIONALS_COLLECTION));
        professionalsQuery.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() });
        });
        break;

      default:
        throw new Error('Invalid data type');
    }

    // Generate the export file
    const exportResult = await generateReport(data, format, dataType);

    return { exportUrl: exportResult.url, success: true };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { error: error.message, success: false };
  }
};

// =================== PLATFORM SETTINGS ===================

// Get platform settings
export const getPlatformSettings = async () => {
  try {
    const settingsDoc = await getDoc(doc(db, PLATFORM_SETTINGS_COLLECTION, 'general'));

    if (settingsDoc.exists()) {
      return { settings: settingsDoc.data(), success: true };
    } else {
      // Return default settings
      const defaultSettings = {
        platformName: 'SWEEKAR',
        supportEmail: 'support@sweekar.com',
        platformCommission: 10,
        defaultCurrency: 'INR',
        minimumBookingNotice: 24,
        defaultSessionDuration: 60,
        allowCancellation: true,
        cancellationDeadline: 24,
        emailNotifications: true,
        smsNotifications: false,
        maintenanceMode: false,
      };

      return { settings: defaultSettings, success: true };
    }
  } catch (error) {
    console.error('Error getting platform settings:', error);
    return { error: error.message, success: false };
  }
};

// Update platform settings
export const updatePlatformSettings = async (settings) => {
  try {
    const settingsRef = doc(db, PLATFORM_SETTINGS_COLLECTION, 'general');

    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date(),
      updatedBy: getCurrentAdminId(),
    }, { merge: true });

    // Log the action
    const auditLogRef = doc(collection(db, AUDIT_LOGS_COLLECTION));
    await setDoc(auditLogRef, {
      action: 'SETTINGS_UPDATE',
      settings: settings,
      timestamp: new Date(),
      adminId: getCurrentAdminId(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating platform settings:', error);
    return { error: error.message, success: false };
  }
};

// =================== HELPER FUNCTIONS ===================

// Get current admin ID (implement based on your auth system)
const getCurrentAdminId = () => {
  const user = JSON.parse(localStorage.getItem('loginInfo'));
  return user?.user?.id || 'unknown_admin';
};

// Calculate average rating
const calculateAverageRating = (reviewsSnapshot) => {
  let totalRating = 0;
  let count = 0;

  reviewsSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.rating) {
      totalRating += data.rating;
      count++;
    }
  });

  return count > 0 ? (totalRating / count).toFixed(1) : 0;
};

// Calculate user growth rate
const calculateGrowthRate = (users, fromDate) => {
  const oldUsers = users.filter(u => u.createdAt && u.createdAt < fromDate).length;
  const newUsers = users.filter(u => u.createdAt && u.createdAt >= fromDate).length;

  return oldUsers > 0 ? ((newUsers / oldUsers) * 100).toFixed(1) : 0;
};

// Calculate revenue growth rate
const calculateRevenueGrowthRate = (payments, fromDate) => {
  const oldRevenue = payments
    .filter(p => p.createdAt && p.createdAt < fromDate)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const newRevenue = payments
    .filter(p => p.createdAt && p.createdAt >= fromDate)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return oldRevenue > 0 ? ((newRevenue / oldRevenue) * 100).toFixed(1) : 0;
};

// Generate specific reports
const generateUserReport = async (dateRange) => {
  // Implementation for user report generation
  return { type: 'user', data: [], generatedAt: new Date() };
};

const generateRevenueReport = async (dateRange) => {
  // Implementation for revenue report generation  
  return { type: 'revenue', data: [], generatedAt: new Date() };
};

const generateSessionReport = async (dateRange) => {
  // Implementation for session report generation
  return { type: 'session', data: [], generatedAt: new Date() };
};

const generateProfessionalReport = async (dateRange) => {
  // Implementation for professional report generation
  return { type: 'professional', data: [], generatedAt: new Date() };
};

// Send user status notification email
const sendUserStatusNotification = async (email, newStatus, reason) => {
  // Implementation for sending email notifications
  console.log(`Sending status notification to ${email}: ${newStatus} - ${reason}`);
};

// Send professional approval/rejection email
const sendProfessionalApprovalEmail = async (email, approved, notes) => {
  // Implementation for sending approval/rejection emails
  console.log(`Sending ${approved ? 'approval' : 'rejection'} email to ${email}: ${notes}`);
};

export const getPlatformMetrics = async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const sixtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60);

    // --- User Growth ---
    const usersQuery = query(collection(db, USERS_COLLECTION), where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)));
    const prevUsersQuery = query(collection(db, USERS_COLLECTION), where('createdAt', '>=', Timestamp.fromDate(sixtyDaysAgo)), where('createdAt', '<', Timestamp.fromDate(thirtyDaysAgo)));
    const recentUsersSnap = await getDocs(usersQuery);
    const prevUsersSnap = await getDocs(prevUsersQuery);
    const userGrowth = prevUsersSnap.size > 0 ? ((recentUsersSnap.size - prevUsersSnap.size) / prevUsersSnap.size) * 100 : recentUsersSnap.size > 0 ? 100 : 0;

    // --- Professional Growth ---
    const profsQuery = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'PROFESSIONAL'),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
    );
    const prevProfsQuery = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'PROFESSIONAL'),
      where('createdAt', '>=', Timestamp.fromDate(sixtyDaysAgo)),
      where('createdAt', '<', Timestamp.fromDate(thirtyDaysAgo))
    );
    const recentProfsSnap = await getDocs(profsQuery);
    const prevProfsSnap = await getDocs(prevProfsQuery);
    const professionalGrowth = prevProfsSnap.size > 0 ? ((recentProfsSnap.size - prevProfsSnap.size) / prevProfsSnap.size) * 100 : recentProfsSnap.size > 0 ? 100 : 0;

    // --- Revenue & Session Growth ---
    const recentBookingsQuery = query(collection(db, BOOKINGS_COLLECTION), where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)), where('status', '==', 'completed'));
    const prevBookingsQuery = query(collection(db, BOOKINGS_COLLECTION), where('createdAt', '>=', Timestamp.fromDate(sixtyDaysAgo)), where('createdAt', '<', Timestamp.fromDate(thirtyDaysAgo)), where('status', '==', 'completed'));

    const recentBookingsSnap = await getDocs(recentBookingsQuery);
    const prevBookingsSnap = await getDocs(prevBookingsQuery);

    let recentRevenue = 0;
    recentBookingsSnap.forEach(doc => recentRevenue += doc.data().amount || 0);

    let prevRevenue = 0;
    prevBookingsSnap.forEach(doc => prevRevenue += doc.data().amount || 0);

    const revenueGrowth = prevRevenue > 0 ? ((recentRevenue - prevRevenue) / prevRevenue) * 100 : recentRevenue > 0 ? 100 : 0;

    // FIX: Added session growth calculation
    const recentSessionsCount = recentBookingsSnap.size;
    const prevSessionsCount = prevBookingsSnap.size;
    const sessionGrowth = prevSessionsCount > 0 ? ((recentSessionsCount - prevSessionsCount) / prevSessionsCount) * 100 : recentSessionsCount > 0 ? 100 : 0;

    const satisfactionRate = 96; // Placeholder

    return {
      metrics: {
        userGrowth: Math.round(userGrowth),
        professionalGrowth: Math.round(professionalGrowth),
        revenueGrowth: Math.round(revenueGrowth),
        sessionGrowth: Math.round(sessionGrowth),
        satisfactionRate,
      },
      success: true,
    };

  } catch (error) {
    console.error("Error getting platform metrics:", error);
    return { error: error.message, success: false };
  }
};

// NEW: Get the most recent users
export const getRecentUsers = async (count = 5) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { users, success: true };
  } catch (error) {
    console.error('Error getting recent users:', error);
    return { error: error.message, success: false };
  }
};

export const getAnalyticsDataForCharts = async (days = 30) => {
  try {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);

    // 1. Fetch completed bookings within the date range for revenue
    const bookingsQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where('status', '==', 'completed'),
      where('createdAt', '>=', Timestamp.fromDate(startDate))
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);

    // 2. Fetch new users within the date range
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      where('createdAt', '>=', Timestamp.fromDate(startDate))
    );
    const usersSnapshot = await getDocs(usersQuery);

    // 3. Process the data into daily aggregates
    const dailyData = {};

    // Initialize daily data object for the last 'days'
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dailyData[formattedDate] = {
        revenue: 0,
        newUsers: 0,
      };
    }

    // Aggregate revenue from bookings
    bookingsSnapshot.forEach(doc => {
      const booking = doc.data();
      const bookingDate = (booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt)).toISOString().split('T')[0];
      if (dailyData[bookingDate]) {
        dailyData[bookingDate].revenue += booking.amount || 0;
      }
    });

    // Aggregate new users
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      const userDate = (user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt)).toISOString().split('T')[0];
      if (dailyData[userDate]) {
        dailyData[userDate].newUsers += 1;
      }
    });

    // 4. Format the data for the Recharts library
    const chartData = Object.keys(dailyData)
      .map(date => ({
        // Format date for display on the chart axis (e.g., "Sep 26")
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dailyData[date].revenue,
        newUsers: dailyData[date].newUsers,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

    return {
      success: true,
      chartData: {
        revenue: chartData.map(d => ({ date: d.date, revenue: d.revenue })),
        users: chartData.map(d => ({ date: d.date, newUsers: d.newUsers })),
      }
    };

  } catch (error) {
    console.error("Error fetching analytics chart data:", error);
    return { error: error.message, success: false };
  }
};

export const getAllProfessionalsWithUserDetails = async () => {
  try {
    const professionalsQuery = query(collection(db, PROFESSIONALS_COLLECTION));
    const professionalsSnapshot = await getDocs(professionalsQuery);

    if (professionalsSnapshot.empty) {
      return { professionals: [], success: true };
    }

    const mergedDataPromises = professionalsSnapshot.docs.map(async (profDoc) => {
      const profData = { ...profDoc.data(), id: profDoc.id };

      if (profData.user_id) {
        const userRef = doc(db, USERS_COLLECTION, profData.user_id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          return {
            ...userData, // User details (name, email)
            ...profData, // Professional details (status, experience)
            // Standardize the status field for filtering
            professionalStatus: profData.verification_status?.toLowerCase() || 'pending',
          };
        }
      }
      // Fallback if user is not found, but professional document exists
      return {
        ...profData,
        displayName: 'User data not found',
        email: 'N/A',
        professionalStatus: profData.verification_status?.toLowerCase() || 'pending',
      };
    });

    const professionals = await Promise.all(mergedDataPromises);
    return { professionals, success: true };

  } catch (error) {
    console.error('Error getting all professionals with user details:', error);
    return { error: error.message, success: false };
  }
};

export const updateProfessionalDetails = async (professionalId, userId, data, newProfilePic = null) => {
  try {
    // If a new profile picture is provided, upload it first.
    if (newProfilePic && userId) {
      const uploadResult = await uploadProfilePicture(userId, newProfilePic);
      if (uploadResult.success) {
        // Add the new URL to the data object to be saved.
        data.photoURL = uploadResult.photoURL;
        data.profile_picture = uploadResult.photoURL;
      } else {
        // If the upload fails, return an error.
        throw new Error(uploadResult.error || 'Profile picture upload failed.');
      }
    }


    const batch = writeBatch(db);

    const professionalRef = doc(db, PROFESSIONALS_COLLECTION, professionalId);
    const professionalUpdatePayload = {
      first_name: data.first_name ?? '',
      last_name: data.last_name ?? '',
      professional_type_id: data.professional_type_id ?? null,
      years_of_experience: data.years_of_experience ?? 0,
      location: data.location ?? '',
    };

    // Conditionally add profile picture URL if it exists
    if (data.profile_picture) {
      professionalUpdatePayload.profile_picture = data.profile_picture;
    }

    batch.update(professionalRef, professionalUpdatePayload);

    if (userId) {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userUpdatePayload = {
        displayName: data.displayName ?? '',
        email: data.email ?? '',
      };

      // Conditionally add photo URL if it exists
      if (data.photoURL) {
        userUpdatePayload.photoURL = data.photoURL;
      }

      if (Object.keys(userUpdatePayload).length > 0) {
        batch.update(userRef, userUpdatePayload);
      }
    }

    await batch.commit();
    return { success: true };

  } catch (error) {
    console.error("Error updating professional details:", error);
    return { error: error.message, success: false };
  }
};