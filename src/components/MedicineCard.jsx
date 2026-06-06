import { Link } from "react-router-dom";
import "./MedicineCard.css";

export default function MedicineCard({ medicine, onAddToCart }) {
  const discount = Math.round(((medicine.originalPrice - medicine.price) / medicine.originalPrice) * 100);
  const stars = "★".repeat(Math.floor(medicine.rating)) + (medicine.rating % 1 >= 0.5 ? "½" : "") + "☆".repeat(5 - Math.ceil(medicine.rating));

  return (
    <div className="med-card">
      <div className="med-card-img-wrap">
        <img src={medicine.image} alt={medicine.name} className="med-card-img" />
        <div className="med-card-badges">
          <span className="badge badge-blue">{medicine.category}</span>
          {medicine.prescription && <span className="badge badge-red">Rx</span>}
          {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        </div>
        {medicine.stock < 30 && medicine.stock > 0 && (
          <div className="low-stock-tag">Only {medicine.stock} left!</div>
        )}
        {medicine.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
      </div>
      <div className="med-card-body">
        <div className="med-card-brand">{medicine.brand}</div>
        <h3 className="med-card-name">{medicine.name}</h3>
        <div className="med-card-rating">
          <span className="stars">{stars}</span>
          <span className="rating-text">({medicine.reviews.toLocaleString()} reviews)</span>
        </div>
        <div className="med-card-price">
          <span className="price-current">₹{medicine.price}</span>
          {medicine.originalPrice > medicine.price && (
            <span className="price-original">₹{medicine.originalPrice}</span>
          )}
        </div>
        <div className="med-card-actions">
          <Link to={`/medicines/${medicine._id || medicine.id}`} className="btn btn-outline btn-sm">View Details</Link>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onAddToCart(medicine)}
            disabled={medicine.stock === 0}
          >
            {medicine.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
