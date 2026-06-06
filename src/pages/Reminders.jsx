import { useState } from "react";
import "./Reminders.css";

const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function Reminders() {
  const [reminders, setReminders] = useState([
    { id: 1, medicine: "Metformin 500mg", time: "08:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], active: true, note: "Take with breakfast" },
    { id: 2, medicine: "Atorvastatin 10mg", time: "21:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], active: true, note: "Take at night" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ medicine: "", time: "08:00", days: [...daysOfWeek], note: "" });

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day]
    }));
  };

  const addReminder = (e) => {
    e.preventDefault();
    setReminders(r => [...r, { id: Date.now(), ...form, active: true }]);
    setForm({ medicine: "", time: "08:00", days: [...daysOfWeek], note: "" });
    setShowForm(false);
  };

  const toggleActive = (id) => setReminders(r => r.map(rem => rem.id === id ? { ...rem, active: !rem.active } : rem));
  const deleteReminder = (id) => setReminders(r => r.filter(rem => rem.id !== id));

  return (
    <div className="page-wrapper">
      <div className="reminders-hero">
        <div className="container"><h1>Refill Reminders</h1><p>Never miss a dose or run out of medicine</p></div>
      </div>
      <div className="container reminders-container">
        <div className="reminders-header">
          <div className="reminders-stats">
            <div className="reminder-stat"><strong>{reminders.filter(r => r.active).length}</strong><span>Active</span></div>
            <div className="reminder-stat"><strong>{reminders.length}</strong><span>Total</span></div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ Add Reminder"}
          </button>
        </div>

        {showForm && (
          <form className="reminder-form card" onSubmit={addReminder}>
            <h3>New Reminder</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Medicine Name</label>
                <input className="form-input" placeholder="e.g. Metformin 500mg" value={form.medicine} onChange={e => setForm({...form, medicine: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input className="form-input" type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Repeat on Days</label>
              <div className="days-selector">
                {daysOfWeek.map(day => (
                  <button type="button" key={day} className={"day-btn" + (form.days.includes(day) ? " active" : "")} onClick={() => toggleDay(day)}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <input className="form-input" placeholder="e.g. Take with food" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">Save Reminder</button>
          </form>
        )}

        {reminders.length === 0 ? (
          <div className="empty-reminders">
            <span>⏰</span>
            <h3>No reminders yet</h3>
            <p>Add your first medicine reminder to stay on track</p>
          </div>
        ) : (
          <div className="reminders-list">
            {reminders.map(rem => (
              <div key={rem.id} className={"reminder-card" + (!rem.active ? " inactive" : "")}>
                <div className="reminder-left">
                  <div className="reminder-icon">💊</div>
                  <div className="reminder-info">
                    <h4>{rem.medicine}</h4>
                    <div className="reminder-time">🕐 {rem.time}</div>
                    <div className="reminder-days">
                      {daysOfWeek.map(d => (
                        <span key={d} className={"day-chip" + (rem.days.includes(d) ? " on" : " off")}>{d}</span>
                      ))}
                    </div>
                    {rem.note && <p className="reminder-note">📝 {rem.note}</p>}
                  </div>
                </div>
                <div className="reminder-actions">
                  <div className="toggle-switch" onClick={() => toggleActive(rem.id)}>
                    <div className={"toggle-track" + (rem.active ? " on" : "")}>
                      <div className="toggle-thumb"></div>
                    </div>
                    <span>{rem.active ? "ON" : "OFF"}</span>
                  </div>
                  <button className="delete-btn" onClick={() => deleteReminder(rem.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
