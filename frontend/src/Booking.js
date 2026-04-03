import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent
} from "@mui/material";

function Booking() {
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const API = "http://127.0.0.1:5000";

  useEffect(() => {
    fetch(`${API}/doctors`)
      .then(res => res.json())
      .then(data => {
        setDoctors(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
        setError("Errore caricamento dottori");
      });
  }, []);

  const specializations = useMemo(() => {
    return [...new Set(doctors.map(d => d.specialization))];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialization) return [];
    return doctors.filter(d => d.specialization === selectedSpecialization);
  }, [doctors, selectedSpecialization]);

  const loadSlots = () => {
    setError("");
    setSlots([]);

    if (!selectedSpecialization) {
      alert("Seleziona una specializzazione");
      return;
    }

    if (!selectedDoctor || !date) {
      alert("Seleziona dottore e data");
      return;
    }

    fetch(`${API}/doctor/${selectedDoctor}/slots?date=${date}`)
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status !== 200) {
          setError(data.msg || "Errore caricamento slot");
          return;
        }

        if (!Array.isArray(data) || data.length === 0) {
          setError("Nessuno slot disponibile per la data selezionata");
          setSlots([]);
          return;
        }

        setSlots(data);
      })
      .catch(err => {
        console.error(err);
        setError("Errore di connessione");
      });
  };

  const book = (slot) => {
    fetch(`${API}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        doctor_id: selectedDoctor,
        date: slot
      })
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status !== 200 && status !== 201) {
          alert(data.msg || "Errore prenotazione");
          return;
        }

        alert("Prenotato!");
        loadSlots();
      })
      .catch(err => {
        console.error(err);
        alert("Errore di connessione");
      });
  };

  return (
    <Box p={3}>
      <Typography variant="h4">Prenota visita</Typography>

      <Box mt={3}>
        <Typography variant="h6">1. Scegli specializzazione</Typography>
        <Box mt={1} display="flex" gap={1} flexWrap="wrap">
          {specializations.map(spec => (
            <Button
              key={spec}
              variant={selectedSpecialization === spec ? "contained" : "outlined"}
              onClick={() => {
                setSelectedSpecialization(spec);
                setSelectedDoctor(null);
                setSlots([]);
              }}
            >
              {spec}
            </Button>
          ))}
        </Box>
      </Box>

      <Box mt={3}>
        <Typography variant="h6">2. Scegli dottore</Typography>
        <Box mt={1} display="flex" gap={1} flexWrap="wrap">
          {filteredDoctors.map(d => (
            <Button
              key={d.id}
              variant={selectedDoctor === d.id ? "contained" : "outlined"}
              onClick={() => {
                setSelectedDoctor(d.id);
                setSlots([]);
              }}
            >
              {d.name}
            </Button>
          ))}
        </Box>
      </Box>

      <Box mt={3}>
        <Typography variant="h6">3. Scegli data</Typography>
        <Box mt={1} display="flex" alignItems="center" gap={2}>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <Button variant="contained" onClick={loadSlots}>
            Cerca
          </Button>
        </Box>
      </Box>

      {error && (
        <Typography color="error" mt={3}>
          {error}
        </Typography>
      )}

      <Box mt={3} display="flex" flexWrap="wrap" gap={2}>
        {slots.map(s => (
          <Card key={s}>
            <CardContent>
              <Typography>{s.split(" ")[1]}</Typography>
              <Button onClick={() => book(s)}>Prenota</Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default Booking;