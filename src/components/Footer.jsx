import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">🏥 Medi<span>Nest</span></div>
            <p>Your trusted online pharmacy delivering healthcare essentials right to your doorstep. Quality medicines, verified sellers, and expert guidance.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="YouTube">📺</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/medicines">Medicines</Link></li>
              <li><Link to="/prescription">Upload Prescription</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/admin">Admin Panel</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/medicines">Pain Relief</Link></li>
              <li><Link to="/medicines">Antibiotics</Link></li>
              <li><Link to="/medicines">Allergy</Link></li>
              <li><Link to="/medicines">Diabetes</Link></li>
              <li><Link to="/medicines">Vitamins</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Us</h4>
            <div className="contact-info">
              <p>📍 123 Health Street, Mumbai, India</p>
              <p>📞 +91 98765 43210</p>
              <p>✉️ support@medinest.in</p>
              <p>🕐 Mon–Sat: 9AM – 9PM</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 MediNest. All rights reserved.</p>
          <div className="footer-badges">
            <span>🔒 SSL Secured</span>
            <span>✅ CDSCO Approved</span>
            <span>💊 Genuine Medicines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
