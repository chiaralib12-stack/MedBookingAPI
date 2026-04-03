import { useState } from "react";

function Appointments() {
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");

  const handleBooking = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Devi fare il login prima");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          date: date
        })
      });

      const data = await res.json();

      console.log("BOOKING RESPONSE:", data);

      if (!res.ok) {
        alert(data.msg || data.message || "Errore nella prenotazione");
        return;
      }

      alert("✅ " + data.msg);

      setDoctorId("");
      setDate("");

    } catch (error) {
      console.error(error);
      alert("Errore di connessione");
    }
  };

  return (
    <div style={container}>
      <h2>📅 Prenota visita</h2>

      <input
        placeholder="Doctor ID"
        value={doctorId}
        onChange={e => setDoctorId(e.target.value)}
        style={input}
      />

      <input
        placeholder="Data (es: 2026-04-01)"
        value={date}
        onChange={e => setDate(e.target.value)}
        style={input}
      />

      <button onClick={handleBooking} style={button}>
        Prenota
      </button>
    </div>
  );
}

const container = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  width: "300px"
};

const input = {
  width: "100%",
  marginBottom: "10px",
  padding: "8px"
};

const button = {
  width: "100%",
  padding: "10px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "5px"
};

export default Appointments;