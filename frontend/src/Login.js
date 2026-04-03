import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [mode, setMode] = useState("patient"); // patient | doctor | admin
  const [username, setUsername] = useState("");
  const [codDoc, setCodDoc] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API = "http://127.0.0.1:5000";

  const handleLogin = async () => {
    let url = "";
    let body = {};

    if (mode === "doctor") {
      url = `${API}/doctor/login`;
      body = { codDoc, password };
    } else {
      // admin e patient usano la stessa route /login
      url = `${API}/login`;
      body = { username, password };
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        alert(data.msg || "Errore login");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("Errore connessione");
    }
  };

  return (
    <div style={container}>
      <div style={box}>
        <h2>Login</h2>

        <div style={roleSwitch}>
          <button
            type="button"
            style={mode === "patient" ? activeBtn : btn}
            onClick={() => setMode("patient")}
          >
            Paziente
          </button>

          <button
            type="button"
            style={mode === "doctor" ? activeBtn : btn}
            onClick={() => setMode("doctor")}
          >
            Dottore
          </button>

          <button
            type="button"
            style={mode === "admin" ? activeBtn : btn}
            onClick={() => setMode("admin")}
          >
            Admin
          </button>
        </div>

        {mode === "doctor" ? (
          <input
            placeholder="Codice Dottore"
            value={codDoc}
            onChange={(e) => setCodDoc(e.target.value)}
          />
        ) : (
          <input
            placeholder={mode === "admin" ? "Username admin" : "Username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={loginBtn} onClick={handleLogin}>
          Accedi
        </button>

        {mode === "patient" && (
          <p
            onClick={() => navigate("/register")}
            style={{ cursor: "pointer", color: "#1976d2", margin: 0 }}
          >
            Registrati
          </p>
        )}
      </div>
    </div>
  );
}

const container = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#f5f7fb"
};

const box = {
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  width: "280px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
};

const roleSwitch = {
  display: "flex",
  gap: "5px"
};

const btn = {
  flex: 1,
  padding: "8px",
  border: "1px solid #ccc",
  background: "#eee",
  cursor: "pointer"
};

const activeBtn = {
  ...btn,
  background: "#1976d2",
  color: "white"
};

const loginBtn = {
  padding: "10px",
  background: "#1976d2",
  color: "white",
  border: "none",
  cursor: "pointer",
  borderRadius: "6px"
};

export default Login;