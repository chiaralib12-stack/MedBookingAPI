import { useState } from "react";
import { useNavigate } from "react-router-dom";

function DoctorLogin() {
  const [codDoc, setCodDoc] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    fetch("http://127.0.0.1:5000/doctor/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ codDoc, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          navigate("/doctor-dashboard");
        } else {
          alert("Errore login");
        }
      });
  };

  return (
    <div>
      <h2>Login Dottore</h2>
      <input placeholder="Codice" onChange={e => setCodDoc(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default DoctorLogin;