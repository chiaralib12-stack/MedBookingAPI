import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div style={nav}>
      <h3>MedBooking</h3>

      <div>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </div>
  );
}

const nav = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px",
  background: "#1976d2",
  color: "white"
};

export default Navbar;