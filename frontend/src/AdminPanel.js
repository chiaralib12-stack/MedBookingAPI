import { useEffect, useMemo, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  Collapse,
  Paper
} from "@mui/material";

function AdminPanel() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");

  const [codDoc, setCodDoc] = useState("");
  const [name, setName] = useState("");
  const [spec, setSpec] = useState("");

  const [day, setDay] = useState(0);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [startOff, setStartOff] = useState("");
  const [endOff, setEndOff] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [openCreateDoctor, setOpenCreateDoctor] = useState(false);
  const [openAvailability, setOpenAvailability] = useState(false);
  const [openTimeOff, setOpenTimeOff] = useState(false);

  const token = localStorage.getItem("token");
  const API = "http://127.0.0.1:5000";

  const dayNames = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica"
  ];

  const loadDoctorsSummary = () => {
    setError("");
    fetch(`${API}/admin/doctors/summary`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status !== 200) {
          setError(data.msg || "Errore caricamento medici");
          setDoctors([]);
          return;
        }

        setDoctors(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setError("Errore di connessione");
      });
  };

  useEffect(() => {
    loadDoctorsSummary();
  }, []);

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => String(d.id) === String(doctorId)) || null;
  }, [doctors, doctorId]);

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const createDoctor = () => {
    resetMessages();

    if (!codDoc || !name || !spec) {
      setError("Compila codice dottore, nome e specializzazione");
      return;
    }

    fetch(`${API}/admin/doctors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        codDoc,
        name,
        specialization: spec
      })
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status !== 200 && status !== 201) {
          setError(data.msg || "Errore creazione dottore");
          return;
        }

        setSuccess("Dottore creato con successo");
        setCodDoc("");
        setName("");
        setSpec("");
        setOpenCreateDoctor(false);
        loadDoctorsSummary();
      })
      .catch((err) => {
        console.error(err);
        setError("Errore di connessione");
      });
  };

  const addAvailability = () => {
    resetMessages();

    if (!doctorId || start === "" || end === "") {
      setError("Seleziona un dottore e completa gli orari");
      return;
    }

    fetch(`${API}/admin/availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        doctor_id: Number(doctorId),
        day: Number(day),
        start,
        end
      })
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status !== 200 && status !== 201) {
          setError(data.msg || "Errore salvataggio disponibilità");
          return;
        }

        setSuccess("Disponibilità salvata");
        setDay(0);
        setStart("");
        setEnd("");
        setOpenAvailability(false);
        loadDoctorsSummary();
      })
      .catch((err) => {
        console.error(err);
        setError("Errore di connessione");
      });
  };

  const addTimeOff = () => {
    resetMessages();

    if (!doctorId || !startOff || !endOff) {
      setError("Seleziona un dottore e inserisci intervallo ferie");
      return;
    }

    fetch(`${API}/admin/timeoff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        doctor_id: Number(doctorId),
        start: startOff,
        end: endOff
      })
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status !== 200 && status !== 201) {
          setError(data.msg || "Errore salvataggio ferie");
          return;
        }

        setSuccess("Ferie salvate");
        setStartOff("");
        setEndOff("");
        setOpenTimeOff(false);
        loadDoctorsSummary();
      })
      .catch((err) => {
        console.error(err);
        setError("Errore di connessione");
      });
  };

  const deleteAvailability = (availabilityId) => {
    resetMessages();

    fetch(`${API}/admin/availability/${availabilityId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status !== 200) {
          setError(data.msg || "Errore eliminazione disponibilità");
          return;
        }

        setSuccess("Disponibilità eliminata");
        loadDoctorsSummary();
      })
      .catch((err) => {
        console.error(err);
        setError("Errore di connessione");
      });
  };

  const deleteTimeOff = (timeoffId) => {
    resetMessages();

    fetch(`${API}/admin/timeoff/${timeoffId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status !== 200) {
          setError(data.msg || "Errore eliminazione ferie");
          return;
        }

        setSuccess("Ferie eliminate");
        loadDoctorsSummary();
      })
      .catch((err) => {
        console.error(err);
        setError("Errore di connessione");
      });
  };

  const toggleCreateDoctor = () => {
    resetMessages();
    setOpenCreateDoctor((prev) => !prev);
    setOpenAvailability(false);
    setOpenTimeOff(false);
  };

  const toggleAvailability = () => {
    resetMessages();
    setOpenAvailability((prev) => !prev);
    setOpenCreateDoctor(false);
    setOpenTimeOff(false);
  };

  const toggleTimeOff = () => {
    resetMessages();
    setOpenTimeOff((prev) => !prev);
    setOpenCreateDoctor(false);
    setOpenAvailability(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        👨‍⚕️ Gestione Medici
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={3}>
        Visualizza i medici registrati, le disponibilità e le ferie. Usa i pulsanti
        per aggiungere nuovi dati.
      </Typography>

      {error && (
        <Paper sx={{ p: 2, mb: 2, background: "#fdecea" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {success && (
        <Paper sx={{ p: 2, mb: 2, background: "#edf7ed" }}>
          <Typography sx={{ color: "#2e7d32" }}>{success}</Typography>
        </Paper>
      )}

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap mb={4}>
        <Button variant="contained" onClick={toggleCreateDoctor}>
          {openCreateDoctor ? "Chiudi nuovo dottore" : "Aggiungi dottore"}
        </Button>

        <Button variant="contained" color="secondary" onClick={toggleAvailability}>
          {openAvailability ? "Chiudi disponibilità" : "Aggiungi disponibilità"}
        </Button>

        <Button variant="outlined" color="secondary" onClick={toggleTimeOff}>
          {openTimeOff ? "Chiudi ferie" : "Aggiungi ferie"}
        </Button>
      </Stack>

      <Collapse in={openCreateDoctor}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              ➕ Nuovo dottore
            </Typography>

            <TextField
              label="Codice dottore"
              fullWidth
              sx={{ mb: 2 }}
              value={codDoc}
              onChange={(e) => setCodDoc(e.target.value)}
            />

            <TextField
              label="Nome e cognome"
              fullWidth
              sx={{ mb: 2 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              label="Specializzazione"
              fullWidth
              sx={{ mb: 2 }}
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
            />

            <Button variant="contained" onClick={createDoctor}>
              Salva dottore
            </Button>
          </CardContent>
        </Card>
      </Collapse>

      <Collapse in={openAvailability}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              🕒 Nuova disponibilità
            </Typography>

            <TextField
              select
              label="Seleziona dottore"
              fullWidth
              sx={{ mb: 2 }}
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              {doctors.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name} - {d.specialization}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Giorno"
              fullWidth
              sx={{ mb: 2 }}
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <MenuItem value={0}>Lunedì</MenuItem>
              <MenuItem value={1}>Martedì</MenuItem>
              <MenuItem value={2}>Mercoledì</MenuItem>
              <MenuItem value={3}>Giovedì</MenuItem>
              <MenuItem value={4}>Venerdì</MenuItem>
              <MenuItem value={5}>Sabato</MenuItem>
              <MenuItem value={6}>Domenica</MenuItem>
            </TextField>

            <TextField
              type="time"
              label="Inizio"
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />

            <TextField
              type="time"
              label="Fine"
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />

            <Button variant="contained" onClick={addAvailability}>
              Salva disponibilità
            </Button>
          </CardContent>
        </Card>
      </Collapse>

      <Collapse in={openTimeOff}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              🌴 Nuovo periodo ferie / indisponibilità
            </Typography>

            <TextField
              select
              label="Seleziona dottore"
              fullWidth
              sx={{ mb: 2 }}
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              {doctors.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name} - {d.specialization}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Dal"
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              value={startOff}
              onChange={(e) => setStartOff(e.target.value)}
            />

            <TextField
              type="date"
              label="Al"
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              value={endOff}
              onChange={(e) => setEndOff(e.target.value)}
            />

            <Button variant="contained" color="secondary" onClick={addTimeOff}>
              Salva ferie
            </Button>
          </CardContent>
        </Card>
      </Collapse>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" mb={2}>
        Elenco medici e disponibilità
      </Typography>

      {doctors.length === 0 ? (
        <Typography color="text.secondary">
          Nessun dottore trovato
        </Typography>
      ) : (
        doctors.map((d) => (
          <Card key={d.id} sx={{ mb: 3 }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                flexWrap="wrap"
                gap={2}
              >
                <Box>
                  <Typography variant="h6">{d.name}</Typography>
                  <Typography variant="body2">
                    <b>Codice:</b> {d.codDoc}
                  </Typography>
                  <Typography variant="body2">
                    <b>Specializzazione:</b> {d.specialization}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setDoctorId(String(d.id));
                      setOpenAvailability(true);
                      setOpenCreateDoctor(false);
                      setOpenTimeOff(false);
                      resetMessages();
                    }}
                  >
                    Aggiungi disponibilità
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setDoctorId(String(d.id));
                      setOpenTimeOff(true);
                      setOpenCreateDoctor(false);
                      setOpenAvailability(false);
                      resetMessages();
                    }}
                  >
                    Aggiungi ferie
                  </Button>
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" mb={1}>
                Disponibilità
              </Typography>

              {d.availabilities && d.availabilities.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {d.availabilities
                    .slice()
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((a) => (
                      <Box
                        key={a.id}
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Chip
                          label={`${dayNames[a.day_of_week]} ${a.start_time}-${a.end_time}`}
                          color="primary"
                          variant="outlined"
                        />
                        <Button
                          size="small"
                          color="error"
                          onClick={() => deleteAvailability(a.id)}
                        >
                          Elimina
                        </Button>
                      </Box>
                    ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nessuna disponibilità inserita
                </Typography>
              )}

              <Typography variant="subtitle1" mt={3} mb={1}>
                Ferie / indisponibilità
              </Typography>

              {d.timeoffs && d.timeoffs.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {d.timeoffs.map((t) => (
                    <Box
                      key={t.id}
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Chip
                        label={`Dal ${t.start_date} al ${t.end_date}`}
                        color="secondary"
                        variant="outlined"
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteTimeOff(t.id)}
                      >
                        Elimina
                      </Button>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nessuna ferie impostata
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {selectedDoctor && (
        <Typography variant="body2" color="text.secondary" mt={2}>
          Dottore selezionato nei form: <b>{selectedDoctor.name}</b>
        </Typography>
      )}
    </Box>
  );
}

export default AdminPanel;