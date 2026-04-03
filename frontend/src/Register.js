import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API = "http://127.0.0.1:5000";

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, lastname, username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Errore registrazione");
        return;
      }

      alert("Registrazione completata!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Errore di connessione");
    }
  };

  return (
    <div style={box}>
      <h2>Registrazione</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Lastname"
        value={lastname}
        onChange={(e) => setLastname(e.target.value)}
      />

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Registrati</button>
    </div>
  );
}

const box = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "250px",
  margin: "auto",
  marginTop: "100px"
};

export default Register;