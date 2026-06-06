import { Link } from "react-router-dom";
import "./Cart.css";

export default function Cart({
  cart,
  onUpdateQty,
  onRemove,
}) {
  const subtotal = cart.reduce(
    (acc, item) =>
      acc + item.price * item.qty,
    0
  );

  const delivery =
    subtotal >= 499 ? 0 : 50;

  const total = subtotal + delivery;

  if (cart.length === 0)
    return (
      <div className="page-wrapper empty-cart">
        <div className="empty-cart-inner">
          <span>🛒</span>

          <h2>Your cart is empty</h2>

          <p>
            Looks like you have not added
            any medicines yet.
          </p>

          <Link
            to="/medicines"
            className="btn btn-primary btn-lg"
          >
            Browse Medicines
          </Link>
        </div>
      </div>
    );

  return (
    <div className="page-wrapper">
      <div className="container cart-container">
        <h1 className="cart-title">
          Shopping Cart{" "}
          <span>
            ({cart.length} items)
          </span>
        </h1>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <div
                className="cart-item"
                key={item.medicineId}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <div className="cart-item-brand">
                    {item.brand}
                  </div>

                  <h3 className="cart-item-name">
                    {item.name}
                  </h3>

                  <div className="cart-item-price">
                    ₹{item.price} each
                  </div>

                  {item.prescription && (
                    <span className="badge badge-red">
                      Rx Required
                    </span>
                  )}
                </div>

                <div className="cart-item-controls">
                  <div className="qty-control">
                    <button
                      onClick={() =>
                        onUpdateQty(
                          item.medicineId,
                          item.qty - 1
                        )
                      }
                      disabled={
                        item.qty <= 1
                      }
                    >
                      −
                    </button>

                    <span>{item.qty}</span>

                    <button
                      onClick={() =>
                        onUpdateQty(
                          item.medicineId,
                          item.qty + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-total">
                    ₹
                    {item.price *
                      item.qty}
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      onRemove(
                        item.medicineId
                      )
                    }
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>

            <div className="summary-rows">
              <div className="summary-row">
                <span>
                  Subtotal (
                  {cart.length} items)
                </span>

                <span>
                  ₹{subtotal}
                </span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>

                <span
                  className={
                    delivery === 0
                      ? "free"
                      : ""
                  }
                >
                  {delivery === 0
                    ? "FREE"
                    : "₹" + delivery}
                </span>
              </div>

              {delivery > 0 && (
                <p className="delivery-note">
                  Add ₹
                  {499 - subtotal} more
                  for free delivery
                </p>
              )}

              <div className="summary-row total-row">
                <span>Total</span>

                <span>₹{total}</span>
              </div>
            </div>

            <Link
              to="/payment"
              className="btn btn-primary btn-lg btn-block"
            >
              Proceed to Checkout →
            </Link>

            <Link
              to="/medicines"
              className="btn btn-outline btn-block"
              style={{
                marginTop: "12px",
              }}
            >
              Continue Shopping
            </Link>

            <div className="cart-security">
              🔒 Secure checkout powered
              by MediNest
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}