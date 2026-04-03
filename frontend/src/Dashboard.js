import { useEffect, useState } from "react";

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Non sei autenticata");
      return;
    }

    fetch("http://127.0.0.1:5000/appointments", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        console.log("APPOINTMENTS:", data);

        if (status !== 200) {
          setError(data.msg || "Errore nel caricamento");
          setAppointments([]);
          return;
        }

        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          setError("Formato dati non valido");
          setAppointments([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Errore di connessione");
      });
  }, []);

  return (
    <div style={container}>
      <h2>📊 Dashboard Paziente</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={grid}>
        <div style={cardBlue}>
          <h3>Prenotazioni</h3>
          <p>{appointments.length}</p>
        </div>

        <div style={cardGreen}>
          <h3>Prossima visita</h3>
          <p>{appointments[0]?.date || "Nessuna"}</p>
        </div>
      </div>

      <h3>🩺 Le tue visite</h3>

      <div style={list}>
        {Array.isArray(appointments) &&
          appointments.map((a) => (
            <div key={a.id} style={appointment}>
              <div>
                <strong>{a.doctor_name}</strong>
                <p>{a.specialization}</p>
              </div>
              <div>📅 {a.date}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

const container = {
  fontFamily: "Arial",
  padding: "20px"
};

const grid = {
  display: "flex",
  gap: "20px",
  marginBottom: "20px"
};

const cardBlue = {
  flex: 1,
  background: "#1976d2",
  color: "white",
  padding: "20px",
  borderRadius: "10px"
};

const cardGreen = {
  flex: 1,
  background: "#2e7d32",
  color: "white",
  padding: "20px",
  borderRadius: "10px"
};

const list = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const appointment = {
  display: "flex",
  justifyContent: "space-between",
  padding: "15px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  background: "#fff"
};

export default Dashboard;