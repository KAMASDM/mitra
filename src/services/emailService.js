// src/services/emailService.js
import { doc, collection, addDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getPlatformSettings } from './adminService';

// Email templates
const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to SWEEKAR - Your Safe Space for Professional Services',
    template: 'welcome_email'
  },
  professional_approval: {
    subject: 'Your Professional Application Status - SWEEKAR',
    template: 'professional_approval'
  },
  professional_rejection: {
    subject: 'Professional Application Update - SWEEKAR',
    template: 'professional_rejection'
  },
  booking_confirmation: {
    subject: 'Booking Confirmation - SWEEKAR',
    template: 'booking_confirmation'
  },
  booking_reminder: {
    subject: 'Session Reminder - SWEEKAR',
    template: 'booking_reminder'
  },
  booking_cancellation: {
    subject: 'Booking Cancelled - SWEEKAR',
    template: 'booking_cancellation'
  },
  user_status_change: {
    subject: 'Account Status Update - SWEEKAR',
    template: 'user_status_change'
  },
  password_reset: {
    subject: 'Reset Your SWEEKAR Password',
    template: 'password_reset'
  },
  session_completed: {
    subject: 'Session Completed - SWEEKAR',
    template: 'session_completed'
  },
  review_request: {
    subject: 'Share Your Experience - SWEEKAR',
    template: 'review_request'
  }
};

// Email queue collection
const EMAIL_QUEUE_COLLECTION = 'email_queue';

/**
 * Add email to queue for processing
 * In production, this would be processed by a cloud function or background service
 */
const queueEmail = async (emailData) => {
  try {
    const emailDoc = await addDoc(collection(db, EMAIL_QUEUE_COLLECTION), {
      ...emailData,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
      scheduledFor: emailData.scheduledFor || new Date()
    });
 console.log(`[EMAIL QUEUE] Successfully added email to queue. ID: ${emailDoc.id}, To: ${emailData.to}`); // <-- ADDED LOG
    return { id: emailDoc.id, success: true };
  } catch (error) {
    console.error('Error queuing email:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Generate email content from template
 */
const generateEmailContent = (templateType, data) => {
  const templates = {
    welcome_email: (data) => ({
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #9D84B7; margin-bottom: 10px;">Welcome to SWEEKAR</h1>
            <p style="color: #666; font-size: 16px;">स्वीकार - A Safe Space for Professional Services</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333;">Hello ${data.name},</h2>
            <p style="color: #666; line-height: 1.6;">
              Welcome to SWEEKAR! We're excited to have you join our inclusive community where 
              everyone can access professional services in a safe, judgment-free environment.
            </p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #9D84B7;">What you can do next:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Complete your profile to get personalized recommendations</li>
              <li>Browse our verified professionals across various categories</li>
              <li>Book your first session with a professional of your choice</li>
              <li>Join our supportive community discussions</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}" style="background: #9D84B7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 14px;">
            <p>If you have any questions, reach out to our support team at <a href="mailto:support@sweekar.com">support@sweekar.com</a></p>
            <p style="margin-top: 20px;">
              Best regards,<br>
              The SWEEKAR Team
            </p>
          </div>
        </div>
      `,
      text: `
        Welcome to SWEEKAR!
        
        Hello ${data.name},
        
        Welcome to SWEEKAR! We're excited to have you join our inclusive community.
        
        What you can do next:
        - Complete your profile
        - Browse verified professionals
        - Book your first session
        - Join community discussions
        
        Visit your dashboard: ${data.dashboardUrl}
        
        Questions? Contact us at support@sweekar.com
        
        Best regards,
        The SWEEKAR Team
      `
    }),

    professional_approval: (data) => ({
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4DAA57;">🎉 Congratulations!</h1>
            <h2 style="color: #9D84B7;">Your Professional Application Has Been Approved</h2>
          </div>
          
          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #155724;">Hello ${data.name},</h3>
            <p style="color: #155724; line-height: 1.6;">
              Great news! Your application to become a verified professional on SWEEKAR has been approved. 
              You can now start offering your services to our community.
            </p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #9D84B7;">What's next:</h3>
            <ol style="color: #666; line-height: 1.8;">
              <li>Complete your professional profile with detailed information</li>
              <li>Set your availability and session rates</li>
              <li>Add your specializations and services</li>
              <li>Start receiving booking requests from clients</li>
            </ol>
          </div>
          
          ${data.notes ? `
            <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h4 style="color: #0066cc; margin-top: 0;">Admin Notes:</h4>
              <p style="color: #0066cc; margin-bottom: 0;">${data.notes}</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}" style="background: #4DAA57; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Access Professional Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 14px;">
            <p>Welcome to the SWEEKAR professional community! We're here to support you every step of the way.</p>
            <p style="margin-top: 20px;">
              Best regards,<br>
              The SWEEKAR Team
            </p>
          </div>
        </div>
      `,
      text: `
        Congratulations! Your Professional Application Has Been Approved
        
        Hello ${data.name},
        
        Great news! Your application has been approved. You can now start offering services on SWEEKAR.
        
        Next steps:
        1. Complete your professional profile
        2. Set your availability and rates
        3. Add specializations
        4. Start receiving bookings
        
        ${data.notes ? `Admin Notes: ${data.notes}` : ''}
        
        Access your dashboard: ${data.dashboardUrl}
        
        Welcome to the professional community!
        
        Best regards,
        The SWEEKAR Team
      `
    }),

    professional_rejection: (data) => ({
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #E74C3C;">Application Status Update</h1>
            <h2 style="color: #9D84B7;">Professional Application Review</h2>
          </div>
          
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #721c24;">Hello ${data.name},</h3>
            <p style="color: #721c24; line-height: 1.6;">
              Thank you for your interest in becoming a professional on SWEEKAR. 
              After careful review, we are unable to approve your application at this time.
            </p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="color: #856404; margin-top: 0;">Reason for Review Decision:</h4>
            <p style="color: #856404; margin-bottom: 0;">${data.reason}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #9D84B7;">What you can do:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Review our professional requirements and guidelines</li>
              <li>Address the concerns mentioned above</li>
              <li>Reapply once you meet all requirements</li>
              <li>Contact our support team if you have questions</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.supportUrl}" style="background: #9D84B7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Contact Support
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 14px;">
            <p>We appreciate your interest in SWEEKAR and encourage you to reapply when ready.</p>
            <p style="margin-top: 20px;">
              Best regards,<br>
              The SWEEKAR Team
            </p>
          </div>
        </div>
      `,
      text: `
        Application Status Update
        
        Hello ${data.name},
        
        Thank you for your interest in becoming a professional on SWEEKAR. 
        We are unable to approve your application at this time.
        
        Reason: ${data.reason}
        
        What you can do:
        - Review our requirements
        - Address the concerns mentioned
        - Reapply when ready
        - Contact support with questions
        
        Contact support: ${data.supportUrl}
        
        We encourage you to reapply when ready.
        
        Best regards,
        The SWEEKAR Team
      `
    }),

    booking_confirmation: (data) => ({
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4DAA57;">✅ Booking Confirmed!</h1>
            <p style="color: #666;">Your session has been successfully booked</p>
          </div>
          
          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #155724; margin-top: 0;">Booking Details</h3>
            <table style="width: 100%; color: #155724;">
              <tr><td><strong>Professional:</strong></td><td>${data.professionalName}</td></tr>
              <tr><td><strong>Date:</strong></td><td>${data.appointmentDate}</td></tr>
              <tr><td><strong>Time:</strong></td><td>${data.appointmentTime}</td></tr>
              <tr><td><strong>Duration:</strong></td><td>${data.duration}</td></tr>
              <tr><td><strong>Session Type:</strong></td><td>${data.sessionType}</td></tr>
              <tr><td><strong>Booking ID:</strong></td><td>${data.bookingId}</td></tr>
            </table>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #9D84B7;">Before your session:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>You'll receive a reminder 24 hours before your session</li>
              <li>For video calls, ensure you have a stable internet connection</li>
              <li>Join the session 5 minutes early to test audio/video</li>
              <li>Prepare any questions or topics you'd like to discuss</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.sessionUrl || data.dashboardUrl}" style="background: #9D84B7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Booking Details
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 14px;">
            <p>Need to reschedule or cancel? You can do so up to 24 hours before your session.</p>
            <p style="margin-top: 20px;">
              Best regards,<br>
              The SWEEKAR Team
            </p>
          </div>
        </div>
      `,
      text: `
        Booking Confirmed!
        
        Your session has been successfully booked.
        
        Booking Details:
        Professional: ${data.professionalName}
        Date: ${data.appointmentDate}
        Time: ${data.appointmentTime}
        Duration: ${data.duration}
        Session Type: ${data.sessionType}
        Booking ID: ${data.bookingId}
        
        Before your session:
        - You'll receive a reminder 24 hours before
        - Ensure stable internet for video calls
        - Join 5 minutes early
        - Prepare questions or topics
        
        View booking: ${data.sessionUrl || data.dashboardUrl}
        
        Need to reschedule? You can do so up to 24 hours before.
        
        Best regards,
        The SWEEKAR Team
      `
    }),

    user_status_change: (data) => ({
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #9D84B7;">Account Status Update</h1>
          </div>
          
          <div style="background: ${data.status === 'active' ? '#d4edda' : '#f8d7da'}; border: 1px solid ${data.status === 'active' ? '#c3e6cb' : '#f5c6cb'}; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: ${data.status === 'active' ? '#155724' : '#721c24'};">Hello ${data.name},</h3>
            <p style="color: ${data.status === 'active' ? '#155724' : '#721c24'}; line-height: 1.6;">
              Your SWEEKAR account status has been updated to: <strong>${data.status.toUpperCase()}</strong>
            </p>
            ${data.reason ? `<p style="color: ${data.status === 'active' ? '#155724' : '#721c24'};">Reason: ${data.reason}</p>` : ''}
          </div>
          
          ${data.status === 'suspended' ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #E74C3C;">What this means:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Your account access has been temporarily restricted</li>
                <li>You cannot book new sessions or access platform features</li>
                <li>Existing bookings may be cancelled</li>
                <li>Contact support if you believe this is an error</li>
              </ul>
            </div>
          ` : `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #4DAA57;">Welcome back!</h3>
              <p style="color: #666; line-height: 1.6;">
                Your account is now active and you can access all SWEEKAR features.
              </p>
            </div>
          `}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.supportUrl}" style="background: #9D84B7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Contact Support
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 14px;">
            <p>If you have any questions about this change, please contact our support team.</p>
            <p style="margin-top: 20px;">
              Best regards,<br>
              The SWEEKAR Team
            </p>
          </div>
        </div>
      `,
      text: `
        Account Status Update
        
        Hello ${data.name},
        
        Your SWEEKAR account status has been updated to: ${data.status.toUpperCase()}
        
        ${data.reason ? `Reason: ${data.reason}` : ''}
        
        ${data.status === 'suspended' 
          ? 'Your account access has been temporarily restricted. Contact support if you believe this is an error.'
          : 'Welcome back! Your account is now active.'
        }
        
        Contact support: ${data.supportUrl}
        
        Best regards,
        The SWEEKAR Team
      `
    })
  };

  const template = templates[templateType];
  return template ? template(data) : null;
};

/**
 * Send welcome email to new users
 */
// export const sendWelcomeEmail = async (userEmail, userData) => {
//   try {
//     const settings = await getPlatformSettings();
//     if (!settings.success || !settings.settings.sendWelcomeEmail) {
//       return { success: true, message: 'Welcome emails are disabled' };
//     }

//     const emailContent = generateEmailContent('welcome_email', {
//       name: userData.name || userData.displayName || 'User',
//       dashboardUrl: `${window.location.origin}/${userData.role?.toLowerCase()}/dashboard`
//     });

//     return await queueEmail({
//       to: userEmail,
//       subject: EMAIL_TEMPLATES.welcome.subject,
//       html: emailContent.html,
//       text: emailContent.text,
//       type: 'welcome',
//       priority: 'normal'
//     });
//   } catch (error) {
//     console.error('Error sending welcome email:', error);
//     return { error: error.message, success: false };
//   }
// };

export const sendWelcomeEmail = async (userEmail, userData) => {
  try {
    const settings = await getPlatformSettings();

    // Check if the setting is explicitly enabled
    const isWelcomeEmailEnabled = settings.success && settings.settings && settings.settings.sendWelcomeEmail === true;

    // Log the current setting value for debugging
    console.log(`[EMAIL CHECK] Attempting to send welcome email to ${userEmail}. Setting 'sendWelcomeEmail' is: ${isWelcomeEmailEnabled ? 'ENABLED' : 'DISABLED'}.`);

    if (!isWelcomeEmailEnabled) {
      return { success: true, message: 'Welcome emails are disabled by platform settings' };
    }

    const emailContent = generateEmailContent('welcome_email', {
      name: userData.name || userData.displayName || 'User',
      dashboardUrl: `${window.location.origin}/${userData.role?.toLowerCase()}/dashboard`
    });

    if (!emailContent) {
        console.error('[EMAIL ERROR] Failed to generate email content for welcome_email');
        return { success: false, error: 'Failed to generate email content' };
    }

    // Queue the email
    const queueResult = await queueEmail({
      to: userEmail,
      subject: EMAIL_TEMPLATES.welcome.subject,
      html: emailContent.html,
      text: emailContent.text,
      type: 'welcome',
      priority: 'normal'
    });
    
    if (!queueResult.success) {
        console.error('[EMAIL ERROR] Failed to queue welcome email:', queueResult.error);
    }
    
    return queueResult;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Send professional approval/rejection email
 */
export const sendProfessionalApprovalEmail = async (userEmail, approved, notes = '') => {
  try {
    const templateType = approved ? 'professional_approval' : 'professional_rejection';
    const subject = EMAIL_TEMPLATES[templateType].subject;
    
    const emailContent = generateEmailContent(templateType, {
      name: 'Professional', // You might want to pass actual name
      notes: notes,
      reason: notes, // For rejection emails
      dashboardUrl: `${window.location.origin}/professional/dashboard`,
      supportUrl: `${window.location.origin}/contact`
    });

    return await queueEmail({
      to: userEmail,
      subject: subject,
      html: emailContent.html,
      text: emailContent.text,
      type: templateType,
      priority: 'high'
    });
  } catch (error) {
    console.error('Error sending professional approval email:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = async (userEmail, bookingData) => {
  try {
    const settings = await getPlatformSettings();
    if (!settings.success || !settings.settings.sendBookingConfirmations) {
      return { success: true, message: 'Booking confirmation emails are disabled' };
    }

    const emailContent = generateEmailContent('booking_confirmation', {
      professionalName: bookingData.professionalName,
      appointmentDate: new Date(bookingData.appointmentDate).toLocaleDateString(),
      appointmentTime: bookingData.appointmentTime,
      duration: bookingData.duration || '60 minutes',
      sessionType: bookingData.sessionType,
      bookingId: bookingData.id,
      sessionUrl: bookingData.sessionUrl,
      dashboardUrl: `${window.location.origin}/client/dashboard`
    });

    return await queueEmail({
      to: userEmail,
      subject: EMAIL_TEMPLATES.booking_confirmation.subject,
      html: emailContent.html,
      text: emailContent.text,
      type: 'booking_confirmation',
      priority: 'high',
      bookingId: bookingData.id
    });
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Send booking reminder email
 */
export const sendBookingReminderEmail = async (userEmail, bookingData) => {
  try {
    const settings = await getPlatformSettings();
    if (!settings.success || !settings.settings.sendReminders) {
      return { success: true, message: 'Reminder emails are disabled' };
    }

    // Schedule reminder based on settings
    const reminderTime = new Date(bookingData.appointmentDate);
    reminderTime.setHours(reminderTime.getHours() - (settings.settings.reminderTimeBeforeSession || 24));

    const emailContent = generateEmailContent('booking_reminder', {
      professionalName: bookingData.professionalName,
      appointmentDate: new Date(bookingData.appointmentDate).toLocaleDateString(),
      appointmentTime: bookingData.appointmentTime,
      sessionType: bookingData.sessionType,
      sessionUrl: bookingData.sessionUrl,
      dashboardUrl: `${window.location.origin}/client/dashboard`
    });

    return await queueEmail({
      to: userEmail,
      subject: EMAIL_TEMPLATES.booking_reminder.subject,
      html: emailContent.html,
      text: emailContent.text,
      type: 'booking_reminder',
      priority: 'normal',
      scheduledFor: reminderTime,
      bookingId: bookingData.id
    });
  } catch (error) {
    console.error('Error scheduling booking reminder email:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Send user status change notification email
 */
export const sendUserStatusNotificationEmail = async (userEmail, userData, newStatus, reason) => {
  try {
    const emailContent = generateEmailContent('user_status_change', {
      name: userData.name || userData.displayName || 'User',
      status: newStatus,
      reason: reason,
      supportUrl: `${window.location.origin}/contact`
    });

    return await queueEmail({
      to: userEmail,
      subject: EMAIL_TEMPLATES.user_status_change.subject,
      html: emailContent.html,
      text: emailContent.text,
      type: 'user_status_change',
      priority: 'high'
    });
  } catch (error) {
    console.error('Error sending user status notification email:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Send custom email
 */
export const sendCustomEmail = async (emailData) => {
  try {
    return await queueEmail({
      ...emailData,
      type: 'custom',
      priority: emailData.priority || 'normal'
    });
  } catch (error) {
    console.error('Error sending custom email:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Send bulk emails
 */
export const sendBulkEmail = async (recipients, emailData) => {
  try {
    const emailPromises = recipients.map(recipient => 
      queueEmail({
        ...emailData,
        to: recipient.email,
        type: 'bulk',
        priority: 'low',
        recipientId: recipient.id
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: true,
      results: {
        total: recipients.length,
        successful,
        failed
      }
    };
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Get email queue status
 */
export const getEmailQueueStatus = async () => {
  try {
    // This would typically be handled by a cloud function
    // For now, return mock data
    return {
      success: true,
      status: {
        pending: 0,
        sending: 0,
        sent: 0,
        failed: 0
      }
    };
  } catch (error) {
    console.error('Error getting email queue status:', error);
    return { error: error.message, success: false };
  }
};
export const sendEmail = async ({ to, subject, body }) => {
  // You can replace this with your actual email sending logic
  // For now, we'll reuse sendCustomEmail if available
  if (typeof sendCustomEmail === 'function') {
    return await sendCustomEmail({ to, subject, body });
  }
  throw new Error('sendCustomEmail is not defined. Please implement email sending logic.');
}