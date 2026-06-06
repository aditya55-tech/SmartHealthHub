import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../services/orderApi";
import "./Invoice.css";

export default function Invoice() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      getOrderById(id)
        .then(data => {
          setOrder(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load invoice details:", err);
          setError("Invoice not found or unauthorized.");
          setLoading(false);
        });
    } else {
      setError("Invalid Invoice ID.");
      setLoading(false);
    }
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "120px" }}>
        <h2>Loading Invoice...</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "120px", color: "var(--red)" }}>
        <h2>Error</h2>
        <p>{error || "Could not retrieve invoice details."}</p>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: "20px" }}>Back to Orders</Link>
      </div>
    );
  }

  const customerName = order.user?.name || "Customer";
  const customerEmail = order.user?.email || "";
  const customerPhone = order.user?.phone || "";
  const customerAddress = order.shippingAddress || order.address || "No address provided";

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="page-wrapper">
      <div className="container invoice-container">
        <div className="invoice-toolbar no-print">
          <Link to="/orders" className="btn btn-outline">← Back to Orders</Link>
          <button className="btn btn-primary" onClick={handlePrint}>🖨️ Download / Print Invoice</button>
        </div>

        <div className="invoice-box" id="invoice">
          <div className="invoice-header">
            <div className="invoice-brand">
              <div className="invoice-logo">🏥 MediNest</div>
              <p>123 Health Street, Bandra, Mumbai – 400050</p>
              <p>support@medinest.in · +91 98765 43210</p>
              <p>GSTIN: 27AABCM1234Z1Z5</p>
            </div>
            <div className="invoice-meta">
              <div className="invoice-title">TAX INVOICE</div>
              <div className="invoice-number">#{order._id || order.id}</div>
              <div className="invoice-date">Date: {orderDate}</div>
              <div className="invoice-date">Status: <strong>{order.status}</strong></div>
            </div>
          </div>

          <div className="invoice-parties">
            <div className="party-block">
              <h4>Bill To:</h4>
              <strong>{customerName}</strong>
              <p>{customerAddress}</p>
              {customerEmail && <p>{customerEmail}</p>}
              {customerPhone && <p>{customerPhone}</p>}
            </div>
            <div className="party-block">
              <h4>Payment Method:</h4>
              <p>{order.paymentMethod || "Online Payment"}</p>
              <div className="invoice-status">✅ PAID</div>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Brand</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.brand || "Generic"}</td>
                  <td>{item.qty}</td>
                  <td>₹{item.price}</td>
                  <td>₹{item.price * item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-totals">
            <div className="totals-spacer"></div>
            <div className="totals-block">
              <div className="total-row"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
              <div className="total-row"><span>Delivery</span><span>{order.delivery === 0 ? "FREE" : "₹"+order.delivery}</span></div>
              <div className="total-row"><span>GST (5%)</span><span>₹{order.tax}</span></div>
              <div className="total-row grand"><span>Total Paid</span><span>₹{order.total}</span></div>
            </div>
          </div>

          <div className="invoice-footer">
            <div className="invoice-note">
              <strong>Note:</strong> This is a computer-generated invoice. No signature required. For queries, contact support@medinest.in
            </div>
            <div className="invoice-thanks">Thank you for choosing MediNest – Your Health, Our Priority 🏥</div>
          </div>
        </div>
      </div>
    </div>
  );
}
