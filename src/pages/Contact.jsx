import { useState } from "react";
import "./Contact.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const ch = (k) => (e) => setForm({...form, [k]: e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="page-wrapper">
      <div className="contact-hero">
        <div className="container"><h1>Contact Us</h1><p>We're here to help. Reach out anytime!</p></div>
      </div>
      <div className="container contact-container">
        <div className="contact-grid">
          <div className="contact-info-panel">
            <h2>Get In Touch</h2>
            <p>Have questions about medicines, orders, or prescriptions? Our team is ready to assist you.</p>
            {[
              { icon:"📍", label:"Address", val:"123 Health Street, Bandra, Mumbai – 400051" },
              { icon:"📞", label:"Phone", val:"+91 98765 43210" },
              { icon:"✉️", label:"Email", val:"support@medinest.in" },
              { icon:"🕐", label:"Hours", val:"Mon–Sat: 9AM – 9PM" },
            ].map(c => (
              <div className="contact-info-row" key={c.label}>
                <span className="contact-info-icon">{c.icon}</span>
                <div><strong>{c.label}</strong><p>{c.val}</p></div>
              </div>
            ))}
          </div>

          {sent ? (
            <div className="contact-form-card" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"16px",textAlign:"center"}}>
              <span style={{fontSize:"3rem"}}>✅</span>
              <h3>Message Sent!</h3>
              <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
              <button className="btn btn-primary" onClick={() => setSent(false)}>Send Another</button>
            </div>
          ) : (
            <form className="contact-form-card" onSubmit={handleSubmit}>
              <h2>Send a Message</h2>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="Your name" value={form.name} onChange={ch("name")} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={ch("email")} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="form-input" placeholder="How can we help?" value={form.subject} onChange={ch("subject")} required />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input" rows={5} placeholder="Tell us more..." value={form.message} onChange={ch("message")} required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-block">Send Message →</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
