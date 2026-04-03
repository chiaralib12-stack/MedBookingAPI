import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          navigate("/admin-dashboard");
        } else {
          alert("Credenziali errate");
        }
      });
  };

  return (
    <Box p={3} maxWidth={400} mx="auto">
      <Typography variant="h5">Login Admin</Typography>

      <TextField
        label="Username"
        fullWidth
        sx={{ mt: 2 }}
        onChange={e => setUsername(e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        sx={{ mt: 2 }}
        onChange={e => setPassword(e.target.value)}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3 }}
        onClick={handleLogin}
      >
        Login
      </Button>
    </Box>
  );
}

export default AdminLogin;