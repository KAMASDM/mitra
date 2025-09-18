// src/components/Admin/AnalyticsReports.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download,
  TrendingUp,
  TrendingDown,
  People,
  AttachMoney,
  Schedule,
  Star,
  BarChart,
  PieChart,
  Timeline,
  Refresh,
  DateRange,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getPlatformStatistics, getSystemReports, exportData } from '../../services/adminService';

const MotionCard = motion(Card);

const COLORS = ['#9D84B7', '#F4A259', '#4DAA57', '#5899E2', '#E74C3C', '#8E44AD'];

const AnalyticsReports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [reportType, setReportType] = useState('overview');
  const [statistics, setStatistics] = useState({});
  const [chartData, setChartData] = useState({
    revenue: [],
    users: [],
    sessions: [],
    professionalsByCategory: [],
    monthlyGrowth: []
  });
  const [reports, setReports] = useState({});
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes] = await Promise.all([
        getPlatformStatistics(),
        getSystemReports('all', { days: parseInt(dateRange) })
      ]);

      if (statsRes.success) {
        setStatistics(statsRes.statistics);
        generateChartData(statsRes.statistics);
      }

      if (reportsRes.success) {
        setReports(reportsRes.reports);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (stats) => {
    // Generate sample data - in real app, this would come from the backend
    const days = parseInt(dateRange);
    const revenueData = [];
    const userData = [];
    const sessionData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      revenueData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 50000) + 10000,
        sessions: Math.floor(Math.random() * 100) + 20,
      });
      
      userData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        newUsers: Math.floor(Math.random() * 20) + 5,
        activeUsers: Math.floor(Math.random() * 200) + 100,
      });
    }

    const professionalsByCategory = [
      { name: 'Mental Health', value: 45, count: 156 },
      { name: 'Legal Aid', value: 25, count: 87 },
      { name: 'Medical Services', value: 20, count: 69 },
      { name: 'Career Guidance', value: 10, count: 34 },
    ];

    const monthlyGrowth = [
      { month: 'Jan', users: 1200, revenue: 180000, sessions: 890 },
      { month: 'Feb', users: 1350, revenue: 220000, sessions: 1020 },
      { month: 'Mar', users: 1580, revenue: 280000, sessions: 1250 },
      { month: 'Apr', users: 1820, revenue: 340000, sessions: 1480 },
      { month: 'May', users: 2100, revenue: 420000, sessions: 1750 },
      { month: 'Jun', users: 2450, revenue: 510000, sessions: 2100 },
    ];

    setChartData({
      revenue: revenueData,
      users: userData,
      sessions: revenueData,
      professionalsByCategory,
      monthlyGrowth
    });
  };

  const handleExport = async (type) => {
    try {
      setExportLoading(true);
      const result = await exportData(type, 'csv', { dateRange });
      
      if (result.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.exportUrl;
        link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const MetricCard = ({ title, value, change, changeType, icon, color }) => (
    <MotionCard
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      sx={{ borderRadius: 3, height: '100%' }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          <Box sx={{
            width: 40, height: 40, borderRadius: '50%',
            background: `${color}20`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: color,
          }}>
            {icon}
          </Box>
        </Box>
        
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        
        {change && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {changeType === 'increase' ? (
              <TrendingUp sx={{ color: 'success.main', fontSize: '1rem' }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', fontSize: '1rem' }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: changeType === 'increase' ? 'success.main' : 'error.main',
                fontWeight: 600
              }}
            >
              {change}% vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </MotionCard>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Analytics & Reports
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={dateRange}
              label="Period"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 3 months</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={`₹${(statistics.totalRevenue || 0).toLocaleString()}`}
            change={statistics.revenueGrowthRate}
            changeType="increase"
            icon={<AttachMoney />}
            color="#4DAA57"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={statistics.totalUsers || 0}
            change={statistics.userGrowthRate}
            changeType="increase"
            icon={<People />}
            color="#9D84B7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Sessions"
            value={statistics.totalSessions || 0}
            change="12.5"
            changeType="increase"
            icon={<Schedule />}
            color="#F4A259"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg. Rating"
            value={statistics.averageRating || '0.0'}
            change="2.1"
            changeType="increase"
            icon={<Star />}
            color="#5899E2"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Revenue Trend */}
        <Grid item xs={12} lg={8}>
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{ borderRadius: 3, height: '100%' }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Revenue & Sessions Trend
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label="Revenue" color="primary" size="small" />
                  <Chip label="Sessions" color="secondary" size="small" />
                </Stack>
              </Box>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#9D84B7"
                    fill="#9D84B7"
                    fillOpacity={0.3}
                    name="Revenue (₹)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sessions"
                    stroke="#F4A259"
                    strokeWidth={3}
                    name="Sessions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Professionals by Category */}
        <Grid item xs={12} lg={4}>
          <MotionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{ borderRadius: 3, height: '100%' }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Professionals by Category
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={chartData.professionalsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.professionalsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* User Growth */}
        <Grid item xs={12} lg={6}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ borderRadius: 3 }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                User Registration Trend
              </Typography>
              
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.users}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#4DAA57"
                    strokeWidth={3}
                    name="New Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#9D84B7"
                    strokeWidth={3}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Monthly Growth */}
        <Grid item xs={12} lg={6}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ borderRadius: 3 }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Monthly Growth Overview
              </Typography>
              
              <ResponsiveContainer width="100%" height={250}>
                <RechartsBarChart data={chartData.monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="users" fill="#9D84B7" name="New Users" />
                  <Bar dataKey="sessions" fill="#F4A259" name="Sessions" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Export Reports Section */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ borderRadius: 3 }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Export Reports
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                <People sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>User Report</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Complete user data with registration details
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  onClick={() => handleExport('users')}
                  disabled={exportLoading}
                  fullWidth
                >
                  Export CSV
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                <AttachMoney sx={{ fontSize: '3rem', color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Revenue Report</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Financial data and transaction history
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  onClick={() => handleExport('revenue')}
                  disabled={exportLoading}
                  fullWidth
                >
                  Export CSV
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                <Schedule sx={{ fontSize: '3rem', color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Sessions Report</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Booking and session completion data
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  onClick={() => handleExport('bookings')}
                  disabled={exportLoading}
                  fullWidth
                >
                  Export CSV
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                <BarChart sx={{ fontSize: '3rem', color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Full Analytics</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Comprehensive platform analytics
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  onClick={() => handleExport('analytics')}
                  disabled={exportLoading}
                  fullWidth
                >
                  Export PDF
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </MotionCard>

      {/* Recent Activity Table */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ borderRadius: 3, mt: 4 }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Recent Platform Activity
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Activity</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { activity: 'Session Completed', user: 'Sarah J.', type: 'Booking', amount: '₹2,000', date: '2025-09-18', status: 'Success' },
                  { activity: 'New Registration', user: 'Alex K.', type: 'User', amount: '-', date: '2025-09-18', status: 'Active' },
                  { activity: 'Professional Approved', user: 'Dr. Priya S.', type: 'Professional', amount: '-', date: '2025-09-17', status: 'Verified' },
                  { activity: 'Payment Processed', user: 'Mike R.', type: 'Payment', amount: '₹1,500', date: '2025-09-17', status: 'Success' },
                  { activity: 'Session Cancelled', user: 'Emma W.', type: 'Booking', amount: '₹1,800', date: '2025-09-17', status: 'Refunded' },
                ].map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 600 }}>{activity.activity}</TableCell>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>
                      <Chip label={activity.type} size="small" />
                    </TableCell>
                    <TableCell>{activity.amount}</TableCell>
                    <TableCell>{activity.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={activity.status}
                        size="small"
                        color={
                          activity.status === 'Success' || activity.status === 'Active' || activity.status === 'Verified'
                            ? 'success'
                            : activity.status === 'Refunded'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </MotionCard>
    </Box>
  );
};

export default AnalyticsReports;