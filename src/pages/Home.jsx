import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MedicineCard from "../components/MedicineCard";
import { healthTips } from "../data/medicines";
import { getMedicines } from "../services/medicineApi";
import "./Home.css";

export default function Home({ onAddToCart }) {
  const [email, setEmail] = useState("");
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    getMedicines()
      .then(setMedicines)
      .catch((err) => console.error("Failed to load featured medicines:", err));
  }, []);

  const featured = medicines.filter((m) => m.rating >= 4.5).slice(0, 4);

  return (
    <div className="page-wrapper">
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-eyebrow">🏥 India's Trusted Online Pharmacy</span>
            <h1 className="hero-title">
              Your Health,<br />
              <span className="hero-accent">Our Priority</span>
            </h1>
            <p className="hero-desc">
              Order genuine medicines, upload prescriptions, and get expert advice from the comfort of your home. Fast delivery, authentic products.
            </p>
            <div className="hero-actions">
              <Link to="/medicines" className="btn btn-primary btn-lg">Shop Medicines →</Link>
              <Link to="/prescription" className="btn btn-outline-white btn-lg">Upload Prescription</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>50,000+</strong><span>Happy Customers</span></div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat"><strong>10,000+</strong><span>Medicines</span></div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat"><strong>30 min</strong><span>Avg. Delivery</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-circle">
              <div className="hero-circle-inner">
                <span>🏥</span>
                <p>SmartHealthHub</p>
              </div>
            </div>
            <div className="hero-pill hero-pill-1">💊 Pain Relief</div>
            <div className="hero-pill hero-pill-2">🦠 Antibiotics</div>
            <div className="hero-pill hero-pill-3">🌿 Vitamins</div>
            <div className="hero-pill hero-pill-4">🩸 Diabetes Care</div>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            {[
              { icon: "🚚", title: "Free Delivery", sub: "Orders above ₹499" },
              { icon: "🔒", title: "Secure Payments", sub: "100% safe checkout" },
              { icon: "💊", title: "Genuine Medicines", sub: "CDSCO certified" },
              { icon: "📞", title: "24/7 Support", sub: "Expert pharmacists" },
            ].map((t) => (
              <div className="trust-item" key={t.title}>
                <div className="trust-icon">{t.icon}</div>
                <div><strong>{t.title}</strong><p>{t.sub}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Top Rated</p>
              <h2 className="section-title">Featured Medicines</h2>
              <p className="section-sub">Handpicked by our pharmacists for quality and effectiveness</p>
            </div>
            <Link to="/medicines" className="btn btn-outline">View All →</Link>
          </div>
          <div className="grid-4">
            {featured.map((m) => (
              <MedicineCard key={m.id} medicine={m} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-sub">Find medicines organized by health condition</p>
          <div className="cat-grid">
            {[
              { icon: "💊", label: "Pain Relief", color: "#dbeafe", border: "#93c5fd" },
              { icon: "🦠", label: "Antibiotics", color: "#fef9c3", border: "#fde68a" },
              { icon: "🤧", label: "Allergy", color: "#ede9fe", border: "#c4b5fd" },
              { icon: "🩸", label: "Diabetes", color: "#dcfce7", border: "#86efac" },
              { icon: "🫀", label: "Cardiovascular", color: "#fee2e2", border: "#fca5a5" },
              { icon: "🌿", label: "Vitamins", color: "#fef3c7", border: "#fcd34d" },
              { icon: "🧴", label: "Digestive", color: "#e0f2fe", border: "#7dd3fc" },
              { icon: "🧠", label: "Mental Health", color: "#f0fdf4", border: "#86efac" },
            ].map((cat) => (
              <Link to={`/medicines?cat=${cat.label}`} key={cat.label} className="cat-item" style={{ background: cat.color, borderColor: cat.border }}>
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section tips-section">
        <div className="container">
          <h2 className="section-title">Health Tips</h2>
          <p className="section-sub">Simple practices for a healthier, happier life</p>
          <div className="tips-grid">
            {healthTips.map((tip) => (
              <div className="tip-card" key={tip.id}>
                <div className="tip-icon">{tip.icon}</div>
                <h4>{tip.title}</h4>
                <p>{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="container newsletter-inner">
          <div className="newsletter-text">
            <h2>Get Health Tips & Offers</h2>
            <p>Subscribe for exclusive deals and expert health advice.</p>
          </div>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" />
            <button className="btn btn-primary" onClick={() => { alert("Subscribed!"); setEmail(""); }}>Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}
