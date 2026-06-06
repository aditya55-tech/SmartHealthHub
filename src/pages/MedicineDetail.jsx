import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MedicineCard from "../components/MedicineCard";
import { getMedicineById, getMedicines } from "../services/medicineApi";
import "./MedicineDetail.css";

export default function MedicineDetail({ onAddToCart }) {
  const { id } = useParams();
  const [medicines, setMedicines] = useState([]);
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMedicine() {
      try {
        const [allMedicines, selectedMedicine] = await Promise.all([
          getMedicines(),
          getMedicineById(id),
        ]);
        setMedicines(allMedicines);
        setMedicine(selectedMedicine);
      } catch (err) {
        console.error("Failed to load medicine details:", err);
        setMedicine(null);
      } finally {
        setLoading(false);
      }
    }

    loadMedicine();
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "120px" }}>
        <h2>Loading medicine...</h2>
      </div>
    );
  }

  if (!medicine) return (
    <div className="page-wrapper" style={{textAlign:"center",paddingTop:"120px"}}>
      <h2>Medicine not found</h2>
      <Link to="/medicines" className="btn btn-primary" style={{marginTop:"20px"}}>Back to Medicines</Link>
    </div>
  );

  const subs = medicines.filter((m) => medicine.substitutes.includes(m._id) || medicine.substitutes.includes(m.id));
  const stars = "★".repeat(Math.floor(medicine.rating)) + "☆".repeat(5 - Math.floor(medicine.rating));
  const discount = Math.round(((medicine.originalPrice - medicine.price) / medicine.originalPrice) * 100);

  return (
    <div className="page-wrapper">
      <div className="container detail-container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span>
          <Link to="/medicines">Medicines</Link> <span>/</span>
          <span>{medicine.name}</span>
        </nav>

        <div className="detail-grid">
          <div className="detail-img-section">
            <div className="detail-img-wrap">
              <img src={medicine.image} alt={medicine.name} />
              {medicine.prescription && <div className="rx-label">Rx Required</div>}
            </div>
            <div className="detail-badges">
              <span className="badge badge-blue">{medicine.category}</span>
              {discount > 0 && <span className="badge badge-red">{discount}% OFF</span>}
              {medicine.stock < 50 && medicine.stock > 0 && <span className="badge badge-yellow">Only {medicine.stock} left</span>}
            </div>
          </div>

          <div className="detail-info">
            <div className="detail-brand">{medicine.manufacturer}</div>
            <h1 className="detail-name">{medicine.name}</h1>
            <div className="detail-brand-name">by {medicine.brand}</div>

            <div className="detail-rating">
              <span className="stars">{stars}</span>
              <span className="rating-val">{medicine.rating}</span>
              <span className="rating-text">({medicine.reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="detail-price-block">
              <span className="detail-price">₹{medicine.price}</span>
              {medicine.originalPrice > medicine.price && (
                <span className="detail-original">₹{medicine.originalPrice}</span>
              )}
              {discount > 0 && <span className="saving-badge">You save ₹{medicine.originalPrice - medicine.price}</span>}
            </div>

            <p className="detail-desc">{medicine.description}</p>

            <div className="detail-meta">
              <div className="meta-item"><span className="meta-label">Expiry Date</span><span>{medicine.expiryDate}</span></div>
              <div className="meta-item"><span className="meta-label">Manufacturer</span><span>{medicine.manufacturer}</span></div>
              <div className="meta-item"><span className="meta-label">Prescription</span><span>{medicine.prescription ? "Required" : "Not Required"}</span></div>
            </div>

            <div className="detail-actions">
              <button className="btn btn-primary btn-lg" onClick={() => onAddToCart(medicine)} disabled={medicine.stock === 0}>
                {medicine.stock === 0 ? "Out of Stock" : "🛒 Add to Cart"}
              </button>
              <Link to="/cart" className="btn btn-outline btn-lg">View Cart</Link>
            </div>
          </div>
        </div>

        <div className="detail-tabs-section">
          <div className="info-cards">
            <div className="info-card">
              <h3>💊 Dosage</h3>
              <p>{medicine.dosage}</p>
            </div>
            <div className="info-card">
              <h3>⚠️ Side Effects</h3>
              <p>{medicine.sideEffects}</p>
            </div>
          </div>
        </div>

        {subs.length > 0 && (
          <div className="substitutes-section">
            <h2>Substitute Medicines</h2>
            <p className="section-sub">Similar medicines you might consider</p>
            <div className="grid-4">
              {subs.map((m) => <MedicineCard key={m.id} medicine={m} onAddToCart={onAddToCart} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
