import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../services/orderApi";
import "./Payment.css";

const METHODS = [
  { id: "razorpay", label: "Pay Online", icon: "💳", desc: "UPI, Cards, Net Banking, Wallets via Razorpay" },
  { id: "cod", label: "Cash on Delivery", icon: "💵", desc: "Pay when delivered" },
];

// Load Razorpay script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payment({ cart, onSuccess, onClearCart }) {
  const [method, setMethod] = useState("razorpay");
  const [shippingAddress, setShippingAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.addresses && user.addresses.length > 0) {
          const defaultAddr = user.addresses.find(a => a.default) || user.addresses[0];
          if (defaultAddr) setShippingAddress(defaultAddr.line);
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Preload Razorpay script
    loadRazorpayScript();
  }, []);

  const subtotal = (cart || []).reduce((a, i) => a + i.price * i.qty, 0);
  const delivery = subtotal >= 499 ? 0 : 50;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  const getToken = () => localStorage.getItem("token");

  const handleCOD = async () => {
    const itemsPayload = (cart || []).map(item => ({
      name: item.name,
      brand: item.brand || "Generic",
      qty: item.qty,
      price: item.price,
      image: item.image
    }));

    const orderData = {
      items: itemsPayload,
      subtotal, delivery, tax, total,
      paymentMethod: "Cash on Delivery",
      shippingAddress
    };

    const res = await createOrder(orderData);
    setOrderId(res._id || res.id);
    setDone(true);
    if (onSuccess) onSuccess();
    if (onClearCart) onClearCart();
  };

  const handleRazorpay = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load Razorpay. Please check your internet connection.");
      setProcessing(false);
      return;
    }

    // Create Razorpay order on backend
    const token = getToken();
    const rpRes = await fetch(
      `${process.env.REACT_APP_API_URL || "http://localhost:7000"}/api/payment/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: total * 100 }), // paise
      }
    );

    if (!rpRes.ok) {
      const errData = await rpRes.json();
      throw new Error(errData.message || "Failed to initiate payment");
    }

    const rpData = await rpRes.json();

    // Get user info for prefill
    let userName = "", userEmail = "", userContact = "";
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      userName = u.name || "";
      userEmail = u.email || "";
      userContact = u.phone || "";
    } catch {}

    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || rpData.keyId,
        amount: rpData.amount,
        currency: rpData.currency,
        name: "MediNest",
        description: "Medicine Order Payment",
        order_id: rpData.orderId,
        prefill: { name: userName, email: userEmail, contact: userContact },
        theme: { color: "#2563eb" },
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await fetch(
              `${process.env.REACT_APP_API_URL || "http://localhost:7000"}/api/payment/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            // Create order in DB
            const itemsPayload = (cart || []).map(item => ({
              name: item.name,
              brand: item.brand || "Generic",
              qty: item.qty,
              price: item.price,
              image: item.image
            }));

            const orderData = {
              items: itemsPayload,
              subtotal, delivery, tax, total,
              paymentMethod: `Razorpay – ${response.razorpay_payment_id}`,
              shippingAddress
            };

            const res = await createOrder(orderData);
            resolve(res._id || res.id);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        reject(new Error(response.error?.description || "Payment failed"));
      });
      rzp.open();
    });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) return alert("Please enter a shipping address.");
    if (!cart || cart.length === 0) return alert("Your cart is empty!");

    setProcessing(true);
    setError("");

    try {
      if (method === "cod") {
        await handleCOD();
      } else {
        const newOrderId = await handleRazorpay();
        setOrderId(newOrderId);
        setDone(true);
        if (onSuccess) onSuccess();
        if (onClearCart) onClearCart();
      }
    } catch (err) {
      if (err.message === "Payment cancelled") {
        setError("Payment was cancelled. Please try again.");
      } else {
        setError(err.message || "Payment processing failed. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  if (done) return (
    <div className="page-wrapper">
      <div className="payment-success">
        <div className="success-circle">✅</div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order ID is <strong>#{orderId}</strong></p>
        <p className="success-sub">You will receive a confirmation shortly. Track your order in My Orders.</p>
        <div className="success-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/orders")}>Track My Order</button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate("/")}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="payment-hero">
        <div className="container"><h1>Secure Checkout</h1><p>Your payment information is encrypted and safe</p></div>
      </div>
      <div className="container payment-container">
        <div className="payment-layout">
          <div className="payment-form-section">
            {error && (
              <div style={{
                background: "#fee2e2", color: "#b91c1c",
                padding: "10px 14px", borderRadius: "8px",
                marginBottom: "16px", fontSize: "14px"
              }}>
                ❌ {error}
              </div>
            )}

            <h2>Delivery Details</h2>
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Shipping Address *</label>
              <textarea
                className="form-input"
                placeholder="Enter your complete home or work shipping address..."
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                rows={3}
                required
              />
            </div>

            <h2>Select Payment Method</h2>
            <div className="method-list">
              {METHODS.map(m => (
                <div key={m.id} className={"method-card" + (method === m.id ? " selected" : "")} onClick={() => setMethod(m.id)}>
                  <div className="method-radio">{method === m.id ? "🔵" : "⚪"}</div>
                  <span className="method-icon">{m.icon}</span>
                  <div className="method-info"><strong>{m.label}</strong><span>{m.desc}</span></div>
                </div>
              ))}
            </div>

            <form className="payment-details" onSubmit={handlePay}>
              {method === "razorpay" && (
                <div className="cod-note" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
                  <span>🔒</span>
                  <p>You will be redirected to Razorpay's secure payment page. Supports UPI, Credit/Debit Cards, Net Banking, and Wallets.</p>
                </div>
              )}
              {method === "cod" && (
                <div className="cod-note">
                  <span>💵</span>
                  <p>Pay ₹{total} in cash when your order is delivered. No extra charges for COD.</p>
                </div>
              )}
              <button
                type="submit"
                className={"btn btn-primary btn-lg btn-block pay-btn" + (processing ? " loading" : "")}
                disabled={processing}
              >
                {processing ? (
                  <span className="processing-text">🔒 Processing Payment...</span>
                ) : method === "razorpay" ? (
                  <span>🔒 Pay ₹{total} via Razorpay</span>
                ) : (
                  <span>✅ Place COD Order – ₹{total}</span>
                )}
              </button>
              <p className="secure-note">🔐 256-bit SSL encrypted · PCI DSS compliant</p>
            </form>
          </div>

          <div className="payment-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {(cart || []).length > 0 ? cart.map(item => (
                <div className="summary-item" key={item.medicineId || item.id}>
                  <span>{item.name} ×{item.qty}</span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              )) : (
                <div className="empty-summary">No items in cart</div>
              )}
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="summary-row"><span>Delivery</span><span className={delivery === 0 ? "free" : ""}>{delivery === 0 ? "FREE" : "₹" + delivery}</span></div>
            <div className="summary-row"><span>GST (5%)</span><span>₹{tax}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>
            <div className="payment-trust">
              <span>🔒 Secure</span>
              <span>✅ Genuine</span>
              <span>🚚 Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
