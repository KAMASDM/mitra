// src/components/Admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Avatar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Stack,
  Alert,
  Snackbar,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Visibility,
  Download,
  Upload,
  PersonAdd,
  Refresh,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getAllUsers, updateUserStatus, deleteUser, getUserStatistics } from '../../services/adminService';

const MotionCard = motion(Card);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [statistics, setStatistics] = useState({});
  
  // Dialog states
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: null, user: null });
  const [userDetailsDialog, setUserDetailsDialog] = useState(false);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuUser, setMenuUser] = useState(null);
  
  // Notification state
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsers({ limit: 100 });
      
      if (result.success) {
        setUsers(result.users);
      } else {
        showNotification(result.error || 'Failed to fetch users', 'error');
      }
    } catch (error) {
      showNotification('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const result = await getUserStatistics();
      if (result.success) {
        setStatistics(result.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => (user.status || 'active') === filterStatus);
    }

    setFilteredUsers(filtered);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const handleUserAction = (type, user) => {
    setActionDialog({ open: true, type, user });
    handleMenuClose();
  };

  const confirmUserAction = async () => {
    const { type, user } = actionDialog;
    try {
      setLoading(true);
      let result;

      switch (type) {
        case 'suspend':
          result = await updateUserStatus(user.id, 'suspended', 'Suspended by admin');
          if (result.success) {
            setUsers(prev => prev.map(u => u.id === user.id ? {...u, status: 'suspended'} : u));
            showNotification('User suspended successfully');
          }
          break;
          
        case 'activate':
          result = await updateUserStatus(user.id, 'active', 'Activated by admin');
          if (result.success) {
            setUsers(prev => prev.map(u => u.id === user.id ? {...u, status: 'active'} : u));
            showNotification('User activated successfully');
          }
          break;
          
        case 'delete':
          result = await deleteUser(user.id, 'Deleted by admin');
          if (result.success) {
            setUsers(prev => prev.filter(u => u.id !== user.id));
            showNotification('User deleted successfully');
          }
          break;
          
        default:
          result = { error: 'Invalid action' };
      }

      if (!result.success) {
        showNotification(result.error || 'Action failed', 'error');
      }
    } catch (error) {
      showNotification('Action failed', 'error');
    } finally {
      setLoading(false);
      setActionDialog({ open: false, type: null, user: null });
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserDetailsDialog(true);
    handleMenuClose();
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      showNotification('No users selected', 'warning');
      return;
    }
    
    setBulkActionDialog(true);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      sx={{ borderRadius: 3 }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: color, mb: 1 }}>
              {value?.toLocaleString?.() || value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 50, height: 50, borderRadius: '50%',
            background: `${color}20`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: color,
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </MotionCard>
  );

  const UserDetailsDialog = ({ user, open, onClose }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        {user && (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={user.photoURL}
                  sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
                >
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </Avatar>
                <Typography variant="h6">{user.displayName || 'No name'}</Typography>
                <Chip 
                  label={user.role} 
                  color="primary" 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
                
                {user.phone && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{user.phone}</Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={user.status || 'active'} 
                    color={user.status === 'active' ? 'success' : 'warning'} 
                    size="small" 
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Member Since</Typography>
                  <Typography variant="body1">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                
                {user.lastLoginAt && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Last Login</Typography>
                    <Typography variant="body1">
                      {new Date(user.lastLoginAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Email Verified</Typography>
                  <Chip 
                    label={user.emailVerified ? 'Verified' : 'Not Verified'} 
                    color={user.emailVerified ? 'success' : 'warning'} 
                    size="small" 
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={() => {
          // Handle edit user
          onClose();
        }}>
          Edit User
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={statistics.totalUsers}
            icon={<PersonAdd />}
            color="#9D84B7"
            subtitle="All registered users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={statistics.activeUsers}
            icon={<CheckCircle />}
            color="#4DAA57"
            subtitle="Currently active"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Professionals"
            value={statistics.professionalUsers}
            icon={<Work />}
            color="#F4A259"
            subtitle="Service providers"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Suspended"
            value={statistics.suspendedUsers}
            icon={<Block />}
            color="#E74C3C"
            subtitle="Suspended accounts"
          />
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filterRole}
                label="Role"
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="CLIENT">Client</MenuItem>
                <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchUsers}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => console.log('Export users')}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => console.log('Add user')}
              >
                Add User
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  {/* Add select all checkbox */}
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell padding="checkbox">
                      {/* Add checkbox */}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.photoURL}
                          sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}
                        >
                          {user.displayName?.charAt(0) || user.email?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {user.displayName || 'No name'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status || 'active'}
                        size="small"
                        color={user.status === 'active' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewUser(menuUser)}>
          <ListItemIcon><Visibility /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => console.log('Edit user:', menuUser)}>
          <ListItemIcon><Edit /></ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <Divider />
        {menuUser?.status === 'active' ? (
          <MenuItem onClick={() => handleUserAction('suspend', menuUser)}>
            <ListItemIcon><Block /></ListItemIcon>
            <ListItemText>Suspend User</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleUserAction('activate', menuUser)}>
            <ListItemIcon><CheckCircle /></ListItemIcon>
            <ListItemText>Activate User</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleUserAction('delete', menuUser)}>
          <ListItemIcon><Delete /></ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: null, user: null })}>
        <DialogTitle>
          Confirm Action
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionDialog.type} <strong>{actionDialog.user?.displayName || actionDialog.user?.email}</strong>?
          </Typography>
          {actionDialog.type === 'delete' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone. The user's data will be permanently removed.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: null, user: null })}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color={actionDialog.type === 'delete' ? 'error' : 'primary'}
            onClick={confirmUserAction}
            disabled={loading}
          >
            {actionDialog.type === 'delete' ? 'Delete' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <UserDetailsDialog
        user={selectedUser}
        open={userDetailsDialog}
        onClose={() => {
          setUserDetailsDialog(false);
          setSelectedUser(null);
        }}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          severity={notification.severity} 
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;