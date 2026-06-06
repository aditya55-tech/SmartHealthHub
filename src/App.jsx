import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Medicines from "./pages/Medicines";
import MedicineDetail from "./pages/MedicineDetail";
import Cart from "./pages/Cart";
import Prescription from "./pages/Prescription";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import Payment from "./pages/Payment";
import Reminders from "./pages/Reminders";
import Invoice from "./pages/Invoice";
import Profile from "./pages/Profile";
import "./styles/global.css";

// ─── Backend API base URL ────────────────────────────────────────
const API = "http://localhost:7000/api";

// ─── Helper: get token from localStorage ────────────────────────
const getToken = () => localStorage.getItem("token");

function Toast({ message, type, onClose }) {
  return (
    <div className={"toast " + type} onClick={onClose}>
      {type === "success" ? "✅" : "ℹ️"} {message}
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  // ─── Load cart from backend on app start ──────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) return; // not logged in, skip

    fetch(`${API}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.items) setCart(data.items);
      })
      .catch(() => {}); // silently fail if backend is down
  }, []);

  // ─── Add to Cart ───────────────────────────────────────────────
  const addToCart = async (medicine) => {
    const token = getToken();

    if (token) {
      // ✅ User is logged in — save to backend
      try {
        const res = await fetch(`${API}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            medicineId: medicine.id,
            name: medicine.name,
            brand: medicine.brand,
            price: medicine.price,
            image: medicine.image,
            prescription: medicine.prescription,
          }),
        });
        const data = await res.json();
        if (data.items) {
          setCart(data.items);
          showToast(medicine.name + " added to cart!");
        }
      } catch {
        showToast("Could not connect to server", "info");
      }
    } else {
      // ⚠️ Not logged in — save to local state only
      setCart((prev) => {
        const existing = prev.find((item) => item.medicineId === medicine.id);
        if (existing) {
          showToast(medicine.name + " quantity updated!");
          return prev.map((item) =>
            item.medicineId === medicine.id ? { ...item, qty: item.qty + 1 } : item
          );
        }
        showToast(medicine.name + " added to cart!");
        return [...prev, { ...medicine, medicineId: medicine.id, qty: 1 }];
      });
    }
  };

  // ─── Update Quantity ───────────────────────────────────────────
  const updateQty = async (medicineId, qty) => {
    if (qty < 1) return;
    const token = getToken();

    if (token) {
      try {
        const res = await fetch(`${API}/cart/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ medicineId, qty }),
        });
        const data = await res.json();
        if (data.items) setCart(data.items);
      } catch {}
    } else {
      setCart((prev) =>
        prev.map((item) => (item.medicineId === medicineId ? { ...item, qty } : item))
      );
    }
  };

  // ─── Remove Item ───────────────────────────────────────────────
  const removeFromCart = async (medicineId) => {
    const token = getToken();

    if (token) {
      try {
        const res = await fetch(`${API}/cart/remove/${medicineId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.items) setCart(data.items);
        showToast("Item removed from cart", "info");
      } catch {}
    } else {
      setCart((prev) => prev.filter((item) => item.medicineId !== medicineId));
      showToast("Item removed from cart", "info");
    }
  };

  // ─── Clear Cart (after payment) ────────────────────────────────
  const clearCart = async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch(`${API}/cart/clear`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    setCart([]);
  };

  return (
    <BrowserRouter>
      <Navbar cartCount={cart.reduce((a, i) => a + i.qty, 0)} />
      <Routes>
        <Route path="/" element={<Home onAddToCart={addToCart} />} />
        <Route path="/medicines" element={<Medicines onAddToCart={addToCart} />} />
        <Route path="/medicines/:id" element={<MedicineDetail onAddToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} onUpdateQty={updateQty} onRemove={removeFromCart} />} />
        <Route path="/payment" element={<Payment cart={cart} onSuccess={clearCart} />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/invoice/:id" element={<Invoice />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/prescription" element={<Prescription />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </BrowserRouter>
  );
}
