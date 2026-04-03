import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useEffect, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function DoctorCalendar() {
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/doctor/appointments", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(a => ({
          id: a.id,
          title: a.patient_name,
          start: new Date(a.date),
          end: new Date(a.date)
        }));
        setEvents(formatted);
      });
  }, []);

  // 🔥 drag & drop
  const moveEvent = ({ event, start }) => {
    fetch(`/appointments/${event.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ date: start.toISOString().split("T")[0] })
    });

    setEvents(prev =>
      prev.map(e => e.id === event.id ? { ...e, start, end: start } : e)
    );
  };

  return (
    <Calendar
      localizer={localizer}
      events={events}
      draggableAccessor={() => true}
      onEventDrop={moveEvent}
      resizable
      style={{ height: 600 }}
    />
  );
}

export default DoctorCalendar;