import { useNavigate } from "react-router-dom";
import { Button, Box, Typography } from "@mui/material";

function SelectRole() {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" mt={10}>
      <Typography variant="h4">Accesso</Typography>

      <Box mt={5} display="flex" justifyContent="center" gap={4}>
        <Button variant="contained" size="large" onClick={() => navigate("/login-patient")}>
          👤 Paziente
        </Button>

        <Button variant="contained" size="large" onClick={() => navigate("/login-doctor")}>
          👨‍⚕️ Dottore
        </Button>

        <Button variant="contained" size="large" color="secondary" onClick={() => navigate("/login-admin")}>
          🛠 Admin
        </Button>
      </Box>
    </Box>
  );
}

export default SelectRole;