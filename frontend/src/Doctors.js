import { useEffect, useState } from "react";

function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/doctors")
      .then(res => res.json())
      .then(data => setDoctors(data));
  }, []);

  return (
    <div>
      <h2>Medici</h2>
      {doctors.map(d => (
        <div key={d.id}>
          {d.name} - {d.specialization}
        </div>
      ))}
    </div>
  );
}

export default Doctors;