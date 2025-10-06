// src/utils/reportGenerator.js

/**
 * Report Generator Utility
 * Handles data export in various formats (CSV, PDF, Excel)
 */

// CSV Generation
export const generateCSV = (data, filename = 'report') => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data provided for CSV generation');
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = '';
    
    // Add headers
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header] || '';
        
        // Handle different data types
        if (value instanceof Date) {
          value = value.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`; // Wrap in quotes if contains comma
        }
        
        return value;
      });
      csvContent += values.join(',') + '\n';
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    return {
      success: true,
      url: url,
      filename: `${filename}_${new Date().toISOString().split('T')[0]}.csv`,
      blob: blob
    };
  } catch (error) {
    console.error('Error generating CSV:', error);
    return { success: false, error: error.message };
  }
};

// PDF Generation (using browser's built-in functionality)
export const generatePDF = async (htmlContent, filename = 'report') => {
  try {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    
    const htmlToPrint = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${filename}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;           
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #9D84B7;
            padding-bottom: 20px;
          }
          .logo {
            color: #9D84B7;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .report-meta {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #666;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #9D84B7;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px 8px;
            text-align: left;
          }
          th {
            background-color: #9D84B7;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .metric-card {
            display: inline-block;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 10px;
            text-align: center;
            min-width: 150px;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #9D84B7;
          }
          .metric-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          @media print {
            .no-print { display: none; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlToPrint);
    printWindow.document.close();
    
    return {
      success: true,
      message: 'PDF generation initiated'
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

// Generate User Report
export const generateUserReport = (users, format = 'csv') => {
  try {
    // Process user data for reporting
    const processedData = users.map(user => ({
      'User ID': user.id,
      'Name': user.displayName || 'N/A',
      'Email': user.email,
      'Role': user.role,
      'Status': user.status || 'active',
      'Phone': user.phone || 'N/A',
      'Location': user.location || 'N/A',
      'Email Verified': user.emailVerified ? 'Yes' : 'No',
      'Registration Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      'Last Login': user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'
    }));

    if (format === 'csv') {
      return generateCSV(processedData, 'user_report');
    } else if (format === 'pdf') {
      const htmlContent = generateUserReportHTML(users, processedData);
      return generatePDF(htmlContent, 'user_report');
    }
    
    return { success: false, error: 'Unsupported format' };
  } catch (error) {
    console.error('Error generating user report:', error);
    return { success: false, error: error.message };
  }
};

// Generate Professional Report
export const generateProfessionalReport = (professionals, format = 'csv') => {
  try {
    const processedData = professionals.map(prof => ({
      'Professional ID': prof.id,
      'Name': prof.name || prof.displayName || 'N/A',
      'Email': prof.email,
      'Profession': prof.profession || 'N/A',
      'Specialization': prof.specialization || 'N/A',
      'Experience': prof.experience ? `${prof.experience} years` : 'N/A',
      'Location': prof.location || 'N/A',
      'Rating': prof.rating || 'N/A',
      'Total Reviews': prof.reviewCount || 0,
      'Total Sessions': prof.sessionCount || 0,
      'Verification Status': prof.verification_status || prof.professionalStatus || 'pending',
      'Registration Date': prof.createdAt ? new Date(prof.createdAt).toLocaleDateString() : 'N/A',
      'Verification Date': prof.verifiedAt ? new Date(prof.verifiedAt).toLocaleDateString() : 'N/A'
    }));

    if (format === 'csv') {
      return generateCSV(processedData, 'professional_report');
    } else if (format === 'pdf') {
      const htmlContent = generateProfessionalReportHTML(professionals, processedData);
      return generatePDF(htmlContent, 'professional_report');
    }
    
    return { success: false, error: 'Unsupported format' };
  } catch (error) {
    console.error('Error generating professional report:', error);
    return { success: false, error: error.message };
  }
};

// Generate Revenue Report
export const generateRevenueReport = (bookings, payments, format = 'csv') => {
  try {
    // Calculate revenue metrics
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const completedBookings = bookings.filter(booking => booking.status === 'completed');
    const averageBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;
    
    // Process revenue data
    const processedData = payments.map(payment => ({
      'Payment ID': payment.id,
      'Booking ID': payment.bookingId,
      'Amount': payment.amount || 0,
      'Currency': payment.currency || 'INR',
      'Payment Method': payment.paymentMethod || 'N/A',
      'Transaction ID': payment.transactionId || 'N/A',
      'Status': payment.status,
      'Professional Fee': payment.professionalFee || (payment.amount * 0.9),
      'Platform Fee': payment.platformFee || (payment.amount * 0.1),
      'Payment Date': payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A',
      'Processed Date': payment.processedAt ? new Date(payment.processedAt).toLocaleDateString() : 'N/A'
    }));

    if (format === 'csv') {
      return generateCSV(processedData, 'revenue_report');
    } else if (format === 'pdf') {
      const htmlContent = generateRevenueReportHTML(payments, processedData, {
        totalRevenue,
        averageBookingValue,
        totalTransactions: payments.length
      });
      return generatePDF(htmlContent, 'revenue_report');
    }
    
    return { success: false, error: 'Unsupported format' };
  } catch (error) {
    console.error('Error generating revenue report:', error);
    return { success: false, error: error.message };
  }
};

// Generate Booking Report
export const generateBookingReport = (bookings, format = 'csv') => {
  try {
    const processedData = bookings.map(booking => ({
      'Booking ID': booking.id,
      'Client Email': booking.clientEmail || 'N/A',
      'Professional Name': booking.professionalName || 'N/A',
      'Service Type': booking.sessionType || 'N/A',
      'Appointment Date': booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString() : 'N/A',
      'Appointment Time': booking.appointmentTime || 'N/A',
      'Duration': booking.duration || 'N/A',
      'Amount': booking.amount || 0,
      'Status': booking.status,
      'Booking Date': booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A',
      'Completed Date': booking.completedAt ? new Date(booking.completedAt).toLocaleDateString() : 'N/A',
      'Cancellation Reason': booking.cancellationReason || 'N/A'
    }));

    if (format === 'csv') {
      return generateCSV(processedData, 'booking_report');
    } else if (format === 'pdf') {
      const htmlContent = generateBookingReportHTML(bookings, processedData);
      return generatePDF(htmlContent, 'booking_report');
    }
    
    return { success: false, error: 'Unsupported format' };
  } catch (error) {
    console.error('Error generating booking report:', error);
    return { success: false, error: error.message };
  }
};

// HTML Generation for PDF Reports
const generateUserReportHTML = (rawData, processedData) => {
  const totalUsers = rawData.length;
  const activeUsers = rawData.filter(u => u.status !== 'suspended').length;
  const verifiedUsers = rawData.filter(u => u.emailVerified).length;

  return `
    <div class="header">
      <div class="logo">SWEEKAR</div>
      <h1>User Analytics Report</h1>
    </div>
    
    <div class="report-meta">
      <strong>Generated on:</strong> ${new Date().toLocaleString()}<br>
      <strong>Report Period:</strong> All Time<br>
      <strong>Total Records:</strong> ${totalUsers}
    </div>
    
    <div class="section">
      <h2>Summary Metrics</h2>
      <div class="metric-card">
        <div class="metric-value">${totalUsers}</div>
        <div class="metric-label">Total Users</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${activeUsers}</div>
        <div class="metric-label">Active Users</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${verifiedUsers}</div>
        <div class="metric-label">Verified Users</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${((verifiedUsers/totalUsers)*100).toFixed(1)}%</div>
        <div class="metric-label">Verification Rate</div>
      </div>
    </div>
    
    <div class="section">
      <h2>User Details</h2>
      <table>
        <thead>
          <tr>
            ${Object.keys(processedData[0]).map(key => `<th>${key}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${processedData.map(row => 
            `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateProfessionalReportHTML = (rawData, processedData) => {
  const totalProfessionals = rawData.length;
  const verifiedProfessionals = rawData.filter(p => p.verification_status === 'verified').length;
  const avgRating = rawData.reduce((sum, p) => sum + (p.rating || 0), 0) / totalProfessionals;

  return `
    <div class="header">
      <div class="logo">SWEEKAR</div>
      <h1>Professional Analytics Report</h1>
    </div>
    
    <div class="report-meta">
      <strong>Generated on:</strong> ${new Date().toLocaleString()}<br>
      <strong>Report Period:</strong> All Time<br>
      <strong>Total Records:</strong> ${totalProfessionals}
    </div>
    
    <div class="section">
      <h2>Summary Metrics</h2>
      <div class="metric-card">
        <div class="metric-value">${totalProfessionals}</div>
        <div class="metric-label">Total Professionals</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${verifiedProfessionals}</div>
        <div class="metric-label">Verified Professionals</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${avgRating.toFixed(1)}</div>
        <div class="metric-label">Average Rating</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${((verifiedProfessionals/totalProfessionals)*100).toFixed(1)}%</div>
        <div class="metric-label">Verification Rate</div>
      </div>
    </div>
    
    <div class="section">
      <h2>Professional Details</h2>
      <table>
        <thead>
          <tr>
            ${Object.keys(processedData[0]).map(key => `<th>${key}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${processedData.map(row => 
            `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateRevenueReportHTML = (rawData, processedData, metrics) => {
  return `
    <div class="header">
      <div class="logo">SWEEKAR</div>
      <h1>Revenue Analytics Report</h1>
    </div>
    
    <div class="report-meta">
      <strong>Generated on:</strong> ${new Date().toLocaleString()}<br>
      <strong>Report Period:</strong> All Time<br>
      <strong>Total Transactions:</strong> ${metrics.totalTransactions}
    </div>
    
    <div class="section">
      <h2>Revenue Metrics</h2>
      <div class="metric-card">
        <div class="metric-value">₹${metrics.totalRevenue.toLocaleString()}</div>
        <div class="metric-label">Total Revenue</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">₹${metrics.averageBookingValue.toLocaleString()}</div>
        <div class="metric-label">Avg. Booking Value</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.totalTransactions}</div>
        <div class="metric-label">Total Transactions</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">₹${(metrics.totalRevenue * 0.1).toLocaleString()}</div>
        <div class="metric-label">Platform Fees</div>
      </div>
    </div>
    
    <div class="section">
      <h2>Transaction Details</h2>
      <table>
        <thead>
          <tr>
            ${Object.keys(processedData[0]).map(key => `<th>${key}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${processedData.slice(0, 50).map(row => 
            `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
      ${processedData.length > 50 ? `<p><em>Showing first 50 transactions of ${processedData.length} total.</em></p>` : ''}
    </div>
  `;
};

const generateBookingReportHTML = (rawData, processedData) => {
  const totalBookings = rawData.length;
  const completedBookings = rawData.filter(b => b.status === 'completed').length;
  const cancelledBookings = rawData.filter(b => b.status === 'cancelled').length;
  const completionRate = ((completedBookings / totalBookings) * 100).toFixed(1);

  return `
    <div class="header">
      <div class="logo">SWEEKAR</div>
      <h1>Booking Analytics Report</h1>
    </div>
    
    <div class="report-meta">
      <strong>Generated on:</strong> ${new Date().toLocaleString()}<br>
      <strong>Report Period:</strong> All Time<br>
      <strong>Total Bookings:</strong> ${totalBookings}
    </div>
    
    <div class="section">
      <h2>Booking Metrics</h2>
      <div class="metric-card">
        <div class="metric-value">${totalBookings}</div>
        <div class="metric-label">Total Bookings</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${completedBookings}</div>
        <div class="metric-label">Completed</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${cancelledBookings}</div>
        <div class="metric-label">Cancelled</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${completionRate}%</div>
        <div class="metric-label">Completion Rate</div>
      </div>
    </div>
    
    <div class="section">
      <h2>Booking Details</h2>
      <table>
        <thead>
          <tr>
            ${Object.keys(processedData[0]).map(key => `<th>${key}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${processedData.slice(0, 50).map(row => 
            `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
      ${processedData.length > 50 ? `<p><em>Showing first 50 bookings of ${processedData.length} total.</em></p>` : ''}
    </div>
  `;
};

// Main report generation function
export const generateReport = async (data, format, reportType) => {
  try {
    switch (reportType) {
      case 'users':
        return generateUserReport(data, format);
      case 'professionals':
        return generateProfessionalReport(data, format);
      case 'revenue':
        return generateRevenueReport(data.bookings, data.payments, format);
      case 'bookings':
        return generateBookingReport(data, format);
      default:
        throw new Error('Unsupported report type');
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to download generated report
export const downloadReport = (result) => {
  if (!result.success) {
    console.error('Cannot download report:', result.error);
    return;
  }

  const link = document.createElement('a');
  link.href = result.url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up blob URL
  setTimeout(() => {
    URL.revokeObjectURL(result.url);
  }, 1000);
};