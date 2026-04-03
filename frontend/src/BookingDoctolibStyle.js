import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button
} from "@mui/material";

function BookingDoctolibStyle() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");

  useEffect(() => {
    fetch("/doctors")
      .then(res => res.json())
      .then(setDoctors);
  }, []);

  const loadSlots = () => {
    fetch(`/doctor/${selectedDoctor}/slots?date=${date}`)
      .then(res => res.json())
      .then(setSlots);
  };

  return (
    <Box display="flex" height="100vh" bgcolor="#f5f7fa">
      
      {/* LEFT */}
      <Box width="30%" p={2} bgcolor="white">
        <Typography variant="h6">Specialisti</Typography>

        {doctors.map(d => (
          <Card
            key={d.id}
            sx={{
              mt: 2,
              cursor: "pointer",
              border: selectedDoctor === d.id ? "2px solid #1976d2" : ""
            }}
            onClick={() => setSelectedDoctor(d.id)}
          >
            <CardContent>
              <b>{d.name}</b>
              <p>{d.specialization}</p>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* RIGHT */}
      <Box flex={1} p={4}>
        <Typography variant="h5">Seleziona data</Typography>

        <input type="date" onChange={e => setDate(e.target.value)} />

        <Button onClick={loadSlots} sx={{ ml: 2 }}>
          Cerca
        </Button>

        <Box mt={3} display="flex" gap={2} flexWrap="wrap">
          {slots.map(s => (
            <Button variant="contained" key={s}>
              {s.split(" ")[1]}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default BookingDoctolibStyle;