import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider
} from "@mui/material";

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const API = "http://127.0.0.1:5000";

  useEffect(() => {
    fetch(`${API}/doctor/appointments`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status !== 200) {
          setError(data.msg || "Errore caricamento appuntamenti");
          setAppointments([]);
          return;
        }

        const safeAppointments = Array.isArray(data) ? data : [];
        setAppointments(safeAppointments);

        const today = formatDateLocal(new Date());
        const todayAppointments = safeAppointments.filter(
          a => getAppointmentDay(a.date) === today
        );
        setSelectedAppointments(todayAppointments);
      })
      .catch(err => {
        console.error(err);
        setError("Errore di connessione");
      });
  }, [token]);

  // formato locale senza bug di timezone
const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

  const getAppointmentDay = (appointmentDate) => {
    if (!appointmentDate) return "";
    return String(appointmentDate).split(" ")[0];
  };

  const formatItalianDate = (date) => {
    return date.toLocaleDateString("it-IT");
  };

  const appointmentsCountByDay = useMemo(() => {
    const map = {};

    appointments.forEach((a) => {
      const day = getAppointmentDay(a.date);
      map[day] = (map[day] || 0) + 1;
    });

    return map;
  }, [appointments]);

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const day = formatDateLocal(date);
    return appointmentsCountByDay[day] ? "highlight-day" : null;
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const day = formatDateLocal(date);
    const count = appointmentsCountByDay[day] || 0;

    if (!count) return null;

    return (
      <div style={tileBadge}>
        {count}
      </div>
    );
  };

  const handleDayClick = (date) => {
    const day = formatDateLocal(date);
    const filtered = appointments.filter(
      a => getAppointmentDay(a.date) === day
    );

    setSelectedDate(date);
    setSelectedAppointments(filtered);
  };

  const deleteAppointment = (id) => {
    fetch(`${API}/appointments/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status !== 200) {
          alert(data.msg || "Errore eliminazione");
          return;
        }

        const updatedAppointments = appointments.filter(a => a.id !== id);
        setAppointments(updatedAppointments);

        const selectedDay = formatDateLocal(selectedDate);
        const filtered = updatedAppointments.filter(
          a => getAppointmentDay(a.date) === selectedDay
        );
        setSelectedAppointments(filtered);
      })
      .catch(err => {
        console.error(err);
        alert("Errore di connessione");
      });
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        👨‍⚕️ Dashboard Dottore
      </Typography>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <Box display="flex" gap={4} alignItems="flex-start" flexWrap="wrap">
        {/* SINISTRA: CALENDARIO */}
        <Box sx={calendarWrapper}>
          <Typography variant="h6" mb={2}>
            Calendario prenotazioni
          </Typography>

          <Calendar
            onClickDay={handleDayClick}
            value={selectedDate}
            tileClassName={tileClassName}
            tileContent={tileContent}
          />

          <Typography variant="body2" mt={2} color="text.secondary">
            Il numero nel giorno indica quante prenotazioni ci sono.
          </Typography>
        </Box>

        {/* DESTRA: DETTAGLIO GIORNO */}
        <Box sx={sidePanel}>
          <Typography variant="h6">
            Appuntamenti del {formatItalianDate(selectedDate)}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {selectedAppointments.length === 0 ? (
            <Typography color="text.secondary">
              Nessuna prenotazione per questo giorno
            </Typography>
          ) : (
            selectedAppointments.map((a) => (
              <Card key={a.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {a.patient}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Orario: {String(a.date).split(" ")[1] || a.date}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Data completa: {a.date}
                  </Typography>

                  <Button
                    color="error"
                    sx={{ mt: 2 }}
                    onClick={() => deleteAppointment(a.id)}
                  >
                    Elimina
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
}

const calendarWrapper = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  minWidth: "350px"
};

const sidePanel = {
  flex: 1,
  minWidth: "320px",
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
};

const tileBadge = {
  marginTop: "4px",
  fontSize: "0.75rem",
  fontWeight: "bold",
  color: "#1976d2"
};

export default DoctorDashboard;