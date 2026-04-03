import { Box, Drawer, List, ListItemButton, ListItemText, Toolbar } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const drawerWidth = 240;

function Layout({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const role =localStorage.getItem("role");

  try {
    if (token) {
      const decoded = jwtDecode(token);
     }
  } catch {
    localStorage.removeItem("token");
    navigate("/");
  }

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const menu = {
    patient: [
      { text: "Dashboard", path: "/dashboard" },
      { text: "Prenota visita", path: "/Booking" }
    ],
    doctor: [
      { text: "Dashboard Dottore", path: "/doctor-dashboard" }
    ],
    admin: [
      { text: "Dashboard Admin", path: "/admin-dashboard" },
      { text: "Gestione Medici", path: "/admin-panel" }
    ]
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: { width: drawerWidth }
        }}
      >
        <Toolbar />
        <List>
          {menu[role]?.map((item, i) => (
            <ListItemButton key={i} component={Link} to={item.path}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}

          <ListItemButton onClick={logout}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default Layout;