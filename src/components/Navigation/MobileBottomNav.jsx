// src/components/Navigation/MobileBottomNav.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { 
  Home, 
  Psychology, 
  AccountCircle, 
  Login, 
  Logout,
  Dashboard,
  AdminPanelSettings,
} from "@mui/icons-material";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [value, setValue] = useState("/");
  const user = JSON.parse(localStorage.getItem("loginInfo"));

  useEffect(() => {
    const path = location.pathname;
    setValue(path);
  }, [location]);

  const handleAuthAction = () => {
    if (user) {
      localStorage.clear();
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const handleDashboard = () => {
    if (user?.user_type === "CLIENT") {
      navigate("/client/dashboard");
    } else if (user?.user_type === "PROFESSIONAL") {
      navigate("/professional/dashboard");
    } else if (user?.user_type === "ADMIN" || user?.user_type === "SUPERADMIN") {
      navigate("/admin/dashboard");
    }
  };

  const handleProfile = () => {
    if (user?.user_type === "CLIENT") {
      navigate("/client/profile");
    } else if (user?.user_type === "PROFESSIONAL") {
      navigate("/professional/profile");
    } else if (user?.user_type === "ADMIN" || user?.user_type === "SUPERADMIN") {
      navigate("/admin/dashboard");
    }
  };

  if (!isMobile) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: { xs: "block", sm: "block", md: "none" },
      }}
    >
      <Paper elevation={3}>
        <BottomNavigation
          value={value}
          onChange={(event, newValue) => {
            if (newValue === "auth") {
              handleAuthAction();
              return;
            }
            if (newValue === "dashboard") {
              handleDashboard();
              return;
            }
            if (newValue === "profile") {
              handleProfile();
              return;
            }
            setValue(newValue);
            navigate(newValue);
          }}
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            height: 64,
            "& .Mui-selected": {
              "& .MuiBottomNavigationAction-label": {
                fontSize: "0.75rem",
                color: theme.palette.primary.main,
                fontWeight: 600,
              },
              "& .MuiSvgIcon-root": {
                color: theme.palette.primary.main,
              },
            },
            "& .MuiBottomNavigationAction-root": {
              color: theme.palette.text.secondary,
              "&:hover": {
                color: theme.palette.primary.light,
              },
            },
          }}
        >
          <BottomNavigationAction 
            label="Home" 
            value="/" 
            icon={<Home />} 
            sx={{ minWidth: 'auto' }}
          />
          <BottomNavigationAction
            label="Services"
            value="/services"
            icon={<Psychology />}
            sx={{ minWidth: 'auto' }}
          />
          
          {user?.user ? (
            <>
              <BottomNavigationAction
                label="Dashboard"
                value="dashboard"
                icon={
                  user.user_type === "ADMIN" || user.user_type === "SUPERADMIN" ? 
                  <AdminPanelSettings /> : 
                  <Dashboard />
                }
                sx={{ minWidth: 'auto' }}
              />
              <BottomNavigationAction
                label={
                  user.user_type === "ADMIN" || user.user_type === "SUPERADMIN" ? 
                  "Admin" : 
                  "Profile"
                }
                value="profile"
                icon={
                  user.user_type === "ADMIN" || user.user_type === "SUPERADMIN" ? 
                  <AdminPanelSettings /> : 
                  <AccountCircle />
                }
                sx={{ minWidth: 'auto' }}
              />
              <BottomNavigationAction
                label="Logout"
                value="auth"
                icon={<Logout />}
                sx={{ minWidth: 'auto' }}
              />
            </>
          ) : (
            <BottomNavigationAction
              label="Login"
              value="auth"
              icon={<Login />}
              sx={{ minWidth: 'auto' }}
            />
          )}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MobileBottomNav;