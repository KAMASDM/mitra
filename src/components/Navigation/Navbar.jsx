// src/components/Navigation/Navbar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  useScrollTrigger,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Stack,
  ListItemIcon,
  Collapse,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AccountCircle,
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings,
} from "@mui/icons-material";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Experts", path: "/experts" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  
  const user = JSON.parse(localStorage.getItem("loginInfo"));

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDropdownToggle = () => {
    setOpenDropdown(!openDropdown);
  };

  const handleDashboard = () => {
    if (user?.user_type === "CLIENT") {
      navigate("/client/dashboard");
    } else if (user?.user_type === "PROFESSIONAL") {
      navigate("/professional/dashboard");
    } else if (user?.user_type === "ADMIN" || user?.user_type === "SUPERADMIN") {
      navigate("/admin/dashboard");
    }
    handleClose();
  };

  const handleProfile = () => {
    if (user?.user_type === "CLIENT") {
      navigate("/client/profile");
    } else if (user?.user_type === "PROFESSIONAL") {
      navigate("/professional/profile");
    }
    handleClose();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    handleClose();
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: trigger
            ? "rgba(157, 132, 183, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          height: trigger ? "70px" : "80px",
          transition: "all 0.3s ease-in-out",
          backdropFilter: "blur(10px)",
          boxShadow: trigger ? "0 4px 20px rgba(0, 0, 0, 0.1)" : "none",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              padding: "0 !important",
              transition: "all 0.3s ease-in-out",
              minHeight: trigger ? "70px !important" : "80px !important",
            }}
          >
            {isMobile ? (
              <>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={handleDrawerToggle}
                  sx={{ color: trigger ? "white" : "black" }}
                >
                  <MenuIcon />
                </IconButton>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => navigate("/")}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: trigger ? "white" : theme.palette.primary.main,
                      cursor: 'pointer'
                    }}
                  >
                    SWEEKAR
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    minWidth: "200px",
                    alignItems: "center",
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate("/")}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      color: trigger ? "white" : theme.palette.primary.main,
                    }}
                  >
                    SWEEKAR
                  </Typography>
                </Box>
                <Stack
                  spacing={3}
                  direction="row"
                  sx={{
                    flexGrow: 1,
                    justifyContent: "center",
                  }}
                >
                  {navItems.map((item) => (
                    <Button
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      sx={{
                        color: trigger ? "white" : theme.palette.primary.main,
                        textTransform: "none",
                        fontWeight: 600,
                        position: 'relative',
                        '&::after': location.pathname === item.path ? {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '100%',
                          height: '3px',
                          backgroundColor: trigger ? "white" : theme.palette.primary.main,
                          borderRadius: '2px',
                        } : {},
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Stack>
                <Box
                  sx={{
                    gap: 2,
                    display: "flex",
                    minWidth: "200px",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  {user?.user ? (
                    <>
                      <Button
                        variant="contained"
                        onClick={handleDashboard}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          "&:hover": {
                            bgcolor: theme.palette.primary.dark,
                          },
                        }}
                      >
                        Dashboard
                      </Button>

                      <IconButton
                        onClick={handleMenu}
                        sx={{
                          color: "rgba(255, 255, 255, 0.9)",
                          bgcolor: theme.palette.primary.main,
                          "&:hover": {
                            bgcolor: theme.palette.primary.dark,
                          },
                        }}
                      >
                        <AccountCircle />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        PaperProps={{
                          elevation: 3,
                          sx: {
                            mt: 1.5,
                            minWidth: 150,
                            borderRadius: 2,
                          },
                        }}
                      >
                        <MenuItem onClick={handleDashboard}>
                          <ListItemIcon>
                            <DashboardIcon fontSize="small" />
                          </ListItemIcon>
                          Dashboard
                        </MenuItem>
                        {(user?.user_type === "CLIENT" || user?.user_type === "PROFESSIONAL") && (
                          <MenuItem onClick={handleProfile}>
                            <ListItemIcon>
                              <AccountCircleIcon fontSize="small" />
                            </ListItemIcon>
                            Profile
                          </MenuItem>
                        )}
                        {(user?.user_type === "ADMIN" || user?.user_type === "SUPERADMIN") && (
                          <MenuItem onClick={() => navigate("/admin/dashboard")}>
                            <ListItemIcon>
                              <AdminPanelSettings fontSize="small" />
                            </ListItemIcon>
                            Admin Panel
                          </MenuItem>
                        )}
                        <MenuItem onClick={handleLogout}>
                          <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                          </ListItemIcon>
                          Logout
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate("/login")}
                        sx={{
                          borderColor: trigger ? "white" : theme.palette.primary.main,
                          color: trigger ? "white" : theme.palette.primary.main,
                          "&:hover": {
                            borderColor: trigger ? "white" : theme.palette.primary.main,
                            bgcolor: trigger ? "rgba(255,255,255,0.1)" : "rgba(157, 132, 183, 0.1)",
                          },
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => navigate("/register")}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          "&:hover": {
                            bgcolor: theme.palette.primary.dark,
                          },
                        }}
                      >
                        Register
                      </Button>
                    </Stack>
                  )}
                </Box>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: "white",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            SWEEKAR
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          {navItems.map((item) => (
            <ListItem
              key={item.label}
              onClick={() => {
                navigate(item.path);
                handleDrawerToggle();
              }}
              sx={{ 
                py: 1.5,
                cursor: 'pointer',
                bgcolor: location.pathname === item.path ? 'rgba(157, 132, 183, 0.1)' : 'transparent',
                borderLeft: location.pathname === item.path ? `4px solid ${theme.palette.primary.main}` : 'none',
              }}
            >
              <ListItemText
                primary={item.label}
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: "1.1rem",
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                  },
                }}
              />
            </ListItem>
          ))}

          {user?.user ? (
            <>
              <ListItem
                onClick={handleDropdownToggle}
                sx={{
                  borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                  mt: 2,
                  pt: 2,
                  cursor: 'pointer'
                }}
              >
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Account" />
                {openDropdown ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={openDropdown} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    onClick={() => {
                      handleDashboard();
                      handleDrawerToggle();
                    }}
                    sx={{ pl: 4, cursor: 'pointer' }}
                  >
                    <ListItemIcon>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                  </ListItem>
                  {(user?.user_type === "CLIENT" || user?.user_type === "PROFESSIONAL") && (
                    <ListItem
                      onClick={() => {
                        handleProfile();
                        handleDrawerToggle();
                      }}
                      sx={{ pl: 4, cursor: 'pointer' }}
                    >
                      <ListItemIcon>
                        <AccountCircleIcon />
                      </ListItemIcon>
                      <ListItemText primary="Profile" />
                    </ListItem>
                  )}
                  <ListItem
                    onClick={() => {
                      handleLogout();
                      handleDrawerToggle();
                    }}
                    sx={{ pl: 4, cursor: 'pointer' }}
                  >
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItem>
                </List>
              </Collapse>
            </>
          ) : (
            <>
              <ListItem
                onClick={() => {
                  navigate("/login");
                  handleDrawerToggle();
                }}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem
                onClick={() => {
                  navigate("/register");
                  handleDrawerToggle();
                }}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemText primary="Register" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
      
      {/* Spacer for fixed navbar */}
      <Toolbar
        sx={{
          minHeight: trigger ? "70px !important" : "80px !important",
          transition: "all 0.3s ease-in-out",
        }}
      />
    </>
  );
};

export default Navbar;