import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider
} from "@mui/material";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    appointments: 0
  });

  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [activeSection, setActiveSection] = useState("appointments");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const API = "http://127.0.0.1:5000";

  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getAppointmentDay = (dateStr) => {
    return String(dateStr).split(" ")[0];
  };

  const today = formatDateLocal(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, usersRes, doctorsRes, appointmentsRes] = await Promise.all([
          fetch(`${API}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API}/admin/doctors`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API}/admin/appointments`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const statsData = await statsRes.json();
        const usersData = await usersRes.json();
        const doctorsData = await doctorsRes.json();
        const appointmentsData = await appointmentsRes.json();

        if (!statsRes.ok) {
          setError(statsData.msg || "Errore caricamento statistiche");
          return;
        }

        if (!usersRes.ok) {
          setError(usersData.msg || "Errore caricamento utenti");
          return;
        }

        if (!doctorsRes.ok) {
          setError(doctorsData.msg || "Errore caricamento dottori");
          return;
        }

        if (!appointmentsRes.ok) {
          setError(appointmentsData.msg || "Errore caricamento appuntamenti");
          return;
        }

        setStats(statsData);
        setUsers(Array.isArray(usersData) ? usersData : []);
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      } catch (err) {
        console.error(err);
        setError("Errore di connessione");
      }
    };

    loadData();
  }, [token]);

  const todayAppointmentsCount = useMemo(() => {
    return appointments.filter(
      (a) => getAppointmentDay(a.date) === today
    ).length;
  }, [appointments, today]);

  const filteredAppointments = useMemo(() => {
    let list = appointments;

    if (selectedDoctor) {
      list = list.filter((a) => a.doctor === selectedDoctor.name);
    }

    if (selectedDate) {
      list = list.filter((a) => getAppointmentDay(a.date) === selectedDate);
    }

    return list;
  }, [appointments, selectedDoctor, selectedDate]);

  const handleOpenUsers = () => {
    setActiveSection("users");
    setSelectedDoctor(null);
  };

  const handleOpenDoctors = () => {
    setActiveSection("doctors");
    setSelectedDoctor(null);
  };

  const handleOpenAppointments = () => {
    setActiveSection("appointments");
    setSelectedDoctor(null);
  };

  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    setActiveSection("appointments");
  };

  return (
    <Box p={3}>
      <Typography variant="h4">🛠 Admin Dashboard</Typography>

      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      <Box display="flex" gap={2} mt={3} flexWrap="wrap">
        <Card sx={clickableCard} onClick={handleOpenUsers}>
          <CardContent>
            <Typography variant="h6">Utenti</Typography>
            <Typography variant="h4">{stats.users}</Typography>
            <Typography variant="body2" color="text.secondary">
              Vedi elenco utenti
            </Typography>
          </CardContent>
        </Card>

        <Card sx={clickableCard} onClick={handleOpenDoctors}>
          <CardContent>
            <Typography variant="h6">Dottori</Typography>
            <Typography variant="h4">{stats.doctors}</Typography>
            <Typography variant="body2" color="text.secondary">
              Vedi elenco dottori
            </Typography>
          </CardContent>
        </Card>

        <Card sx={clickableCard} onClick={handleOpenAppointments}>
          <CardContent>
            <Typography variant="h6">Appuntamenti</Typography>
            <Typography variant="h4">{stats.appointments}</Typography>
            <Typography variant="body2" color="text.secondary">
              Vedi elenco appuntamenti
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={clickableCard}
          onClick={() => {
            setActiveSection("appointments");
            setSelectedDoctor(null);
            setSelectedDate(today);
          }}
        >
          <CardContent>
            <Typography variant="h6">Oggi</Typography>
            <Typography variant="h4">{todayAppointmentsCount}</Typography>
            <Typography variant="body2" color="text.secondary">
              Appuntamenti di oggi
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box display="flex" gap={1} mb={3} flexWrap="wrap">
        <Button
          variant={activeSection === "users" ? "contained" : "outlined"}
          onClick={handleOpenUsers}
        >
          Utenti
        </Button>

        <Button
          variant={activeSection === "doctors" ? "contained" : "outlined"}
          onClick={handleOpenDoctors}
        >
          Dottori
        </Button>

        <Button
          variant={activeSection === "appointments" ? "contained" : "outlined"}
          onClick={handleOpenAppointments}
        >
          Appuntamenti
        </Button>

        {selectedDoctor && (
          <Button
            color="secondary"
            variant="contained"
            onClick={() => setSelectedDoctor(null)}
          >
            Reset filtro dottore
          </Button>
        )}
      </Box>

      {activeSection === "users" && (
        <Box>
          <Typography variant="h5" mb={2}>
            Elenco utenti registrati
          </Typography>

          {users.length === 0 ? (
            <Typography color="text.secondary">Nessun utente trovato</Typography>
          ) : (
            users.map((u) => (
              <Card key={u.id} sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {u.name} {u.lastname}
                  </Typography>
                  <Typography variant="body2">Username: {u.username}</Typography>
                  <Typography variant="body2">Ruolo: {u.role}</Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {activeSection === "doctors" && (
        <Box>
          <Typography variant="h5" mb={2}>
            Elenco dottori registrati
          </Typography>

          {doctors.length === 0 ? (
            <Typography color="text.secondary">Nessun dottore trovato</Typography>
          ) : (
            doctors.map((d) => {
              const doctorAppointmentsCount = appointments.filter(
                (a) => a.doctor === d.name
              ).length;

              return (
                <Card
                  key={d.id}
                  sx={{
                    mt: 2,
                    cursor: "pointer",
                    border:
                      selectedDoctor?.id === d.id
                        ? "2px solid #1976d2"
                        : "1px solid #ddd"
                  }}
                  onClick={() => handleDoctorClick(d)}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {d.name}
                    </Typography>
                    <Typography variant="body2">
                      Specializzazione: {d.specialization}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Prenotazioni: {doctorAppointmentsCount}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                      Clicca per vedere i suoi appuntamenti
                    </Typography>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>
      )}

      {activeSection === "appointments" && (
        <Box>
          <Typography variant="h5" mb={2}>
            {selectedDoctor
              ? `Appuntamenti di ${selectedDoctor.name}`
              : "Elenco appuntamenti"}
          </Typography>

          <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <Button
              variant="outlined"
              onClick={() => setSelectedDate(today)}
            >
              Oggi
            </Button>

            <Button
              variant="outlined"
              onClick={() => setSelectedDate("")}
            >
              Reset data
            </Button>
          </Box>

          {filteredAppointments.length === 0 ? (
            <Typography color="text.secondary">
              Nessun appuntamento trovato
            </Typography>
          ) : (
            filteredAppointments.map((a) => (
              <Card key={a.id} sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {a.doctor}
                  </Typography>
                  <Typography variant="body2">
                    Paziente: {a.patient}
                  </Typography>
                  <Typography variant="body2">
                    Data: {a.date}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}

const clickableCard = {
  minWidth: 220,
  cursor: "pointer",
  transition: "0.2s",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)"
  }
};

export default AdminDashboard;