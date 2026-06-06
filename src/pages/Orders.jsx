import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/orderApi";
import "./Orders.css";

const STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

const statusColor = { 
  Delivered: "green", 
  Shipped: "blue", 
  Processing: "yellow", 
  Pending: "red" 
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getOrders()
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load orders:", err);
        setError("Could not load your orders. Please log in or try again.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "120px" }}>
        <h2>Loading orders...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "120px", color: "var(--red)" }}>
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: "20px" }}>Login</Link>
      </div>
    );
  }

  if (selected) {
    const order = orders.find(o => (o._id || o.id) === selected);
    if (!order) return null;

    const stepIdx = STEPS.indexOf(order.status);
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    return (
      <div className="page-wrapper">
        <div className="container orders-container">
          <button className="back-btn" onClick={() => setSelected(null)}>← Back to Orders</button>
          <div className="order-detail-card">
            <div className="order-detail-header">
              <div>
                <h2>Order ID: #{order._id || order.id}</h2>
                <p className="order-meta">Placed on {orderDate} · {order.items.length} item(s)</p>
              </div>
              <span className={"status-pill status-" + statusColor[order.status]}>{order.status}</span>
            </div>

            <div className="tracker">
              <div className="tracker-bar">
                {STEPS.map((step, i) => (
                  <div key={step} className={"tracker-step" + (i <= stepIdx ? " done" : "")}>
                    <div className="tracker-dot">{i <= stepIdx ? "✓" : i + 1}</div>
                    <span>{step}</span>
                    {i < STEPS.length - 1 && <div className={"tracker-line" + (i < stepIdx ? " done" : "")}></div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="order-detail-body">
              <div className="order-items-section">
                <h3>Items Ordered</h3>
                {order.items.map((item, i) => (
                  <div className="order-item-row" key={i}>
                    <div className="order-item-icon">💊</div>
                    <div className="order-item-info">
                      <strong>{item.name}</strong>
                      <span>Brand: {item.brand} | Qty: {item.qty}</span>
                    </div>
                    <div className="order-item-price">₹{item.price * item.qty}</div>
                  </div>
                ))}
                <div className="order-total-row">
                  <span>Subtotal</span><span>₹{order.subtotal}</span>
                </div>
                <div className="order-total-row">
                  <span>Delivery</span><span>{order.delivery === 0 ? "FREE" : "₹" + order.delivery}</span>
                </div>
                <div className="order-total-row">
                  <span>GST (5%)</span><span>₹{order.tax}</span>
                </div>
                <div className="order-total-row grand">
                  <span>Total Paid</span><span>₹{order.total}</span>
                </div>
              </div>
              <div className="order-info-section">
                <div className="info-block">
                  <h4>📍 Delivery Address</h4>
                  <p>{order.shippingAddress || order.address}</p>
                </div>
                <div className="info-block">
                  <h4>💳 Payment Method</h4>
                  <p>{order.paymentMethod || "Online Payment"}</p>
                </div>
                <div className="info-block">
                  <h4>📦 Order Status</h4>
                  <p>{order.status}</p>
                </div>
                <Link
                  to={"/invoice/" + (order._id || order.id)}
                  className="btn btn-outline btn-block"
                  style={{ marginTop: "16px" }}
                >
                  📄 Download Invoice
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="orders-hero">
        <div className="container"><h1>My Orders</h1><p>Track and manage all your medicine orders</p></div>
      </div>
      <div className="container orders-container">
        {orders.length === 0 ? (
          <div className="empty-orders">
            <span>📦</span>
            <h3>No orders yet</h3>
            <p>Looks like you haven't placed any orders yet. Browse our selection and start shopping!</p>
            <Link to="/medicines" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const currentId = order._id || order.id;
              const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              });

              return (
                <div className="order-card" key={currentId} onClick={() => setSelected(currentId)}>
                  <div className="order-card-top">
                    <div>
                      <div className="order-id">#{currentId}</div>
                      <div className="order-date">Placed: {formattedDate}</div>
                    </div>
                    <span className={"status-pill status-" + statusColor[order.status]}>{order.status}</span>
                  </div>
                  <div className="order-card-items">
                    {order.items.map((item, i) => (
                      <span key={i} className="order-item-tag">💊 {item.name} ×{item.qty}</span>
                    ))}
                  </div>
                  <div className="order-card-footer">
                    <span className="order-total-label">Total: <strong>₹{order.total}</strong></span>
                    <span className="view-details-link">View Details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
