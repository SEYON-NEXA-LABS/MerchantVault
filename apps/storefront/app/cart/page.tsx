"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { applyBrandingStyles } from "../utils/branding";
import { ArrowLeft, Trash2, ShoppingCart, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("seyon:storefront:cart");
      if (storedCart) {
        try {
          setCart(JSON.parse(storedCart));
        } catch (e) {
          // ignore
        }
      }

      const storedCompany = localStorage.getItem("seyon:storefront:company") || localStorage.getItem("seyon:company");
      let parsedCompany = null;
      if (storedCompany) {
        try {
          parsedCompany = JSON.parse(storedCompany);
          setCompany(parsedCompany);
        } catch (e) {
          // ignore
        }
      }

      const storedBrand = localStorage.getItem("seyon:storefront:activeBrand");
      let parsedBrand = null;
      if (storedBrand) {
        try {
          parsedBrand = JSON.parse(storedBrand);
        } catch (e) {
          // ignore
        }
      }

      applyBrandingStyles(parsedCompany, parsedBrand);
    }
  }, []);

  const updateCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem("seyon:storefront:cart", JSON.stringify(newCart));
  };

  const updateQty = (idx: number, delta: number) => {
    const item = cart[idx];
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      const newCart = cart.filter((_, i) => i !== idx);
      updateCart(newCart);
    } else {
      const newCart = cart.map((it, i) => i === idx ? { ...it, quantity: newQty } : it);
      updateCart(newCart);
    }
  };

  const removeItem = (idx: number) => {
    const newCart = cart.filter((_, i) => i !== idx);
    updateCart(newCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getLogoText = () => {
    if (company?.code === "wolfcabin") return "The Wolf Cabin";
    return company?.name || "SEYON STOREFRONT";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--background)" }}>
      {/* Header bar */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderBottom: "1px solid var(--border)",
        padding: "1rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/" style={{ textDecoration: "none", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ArrowLeft style={{ width: "1.1rem", height: "1.1rem" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: "700", textTransform: "uppercase" }}>{getLogoText()}</span>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShoppingBag style={{ width: "1.25rem", height: "1.25rem" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{totalItems} items</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: "1000px", width: "100%", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
          Your Shopping Cart
        </h2>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
            <ShoppingCart style={{ width: "3.5rem", height: "3.5rem", color: "#a1a1aa", margin: "0 auto 1rem auto" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem" }}>Your cart is empty</h3>
            <p style={{ color: "#71717a", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Explore our premium catalog to add some items.
            </p>
            <Link href="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem" }} className="cart-grid">
            {/* Cart Items List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "1rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  backgroundColor: "#ffffff"
                }}>
                  {/* Image/Fallback Thumbnail */}
                  <div style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#f4f4f5",
                    borderRadius: "0.375rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontWeight: "bold",
                    color: "var(--primary)",
                    fontSize: "0.85rem"
                  }}>
                    {item.product.title.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--foreground)", margin: "0 0 0.25rem 0" }}>
                        {item.product.title}
                      </h4>
                      <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "0 0 0.5rem 0" }}>
                        SKU: {item.product.sku} | Variant: {item.selectedColor} / {item.selectedSize}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {/* Qty Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button
                          onClick={() => updateQty(idx, -1)}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: "1px solid var(--border)",
                            backgroundColor: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.95rem",
                            fontWeight: "bold"
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", width: "20px", textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(idx, 1)}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: "1px solid var(--border)",
                            backgroundColor: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.95rem",
                            fontWeight: "bold"
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--foreground)" }}>
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Remove action */}
                  <button
                    onClick={() => removeItem(idx)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "0.25rem",
                      alignSelf: "flex-start"
                    }}
                    aria-label="Remove item"
                  >
                    <Trash2 style={{ width: "1.1rem", height: "1.1rem" }} />
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              backgroundColor: "#fafafa",
              alignSelf: "flex-start",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem"
            }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", margin: 0 }}>
                Order Summary
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem", color: "#52525b" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Subtotal ({totalItems} items)</span>
                  <span style={{ fontWeight: "600", color: "var(--foreground)" }}>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Estimated Shipping</span>
                  <span style={{ fontWeight: "600", color: "#16a34a" }}>FREE</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Estimated GST/Taxes (18%)</span>
                  <span style={{ fontWeight: "600", color: "var(--foreground)" }}>₹{(cartTotal * 0.18).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "1rem",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "800",
                fontSize: "1rem",
                color: "var(--foreground)"
              }}>
                <span>Total Amount</span>
                <span>₹{(cartTotal * 1.18).toLocaleString("en-IN")}</span>
              </div>

              <Link href="/checkout" className="btn btn-primary" style={{ width: "100%", textAlign: "center", padding: "0.75rem" }}>
                Proceed to Checkout
              </Link>

              <Link href="/" style={{ fontSize: "0.8rem", color: "var(--primary)", textAlign: "center", fontWeight: "600", textDecoration: "none" }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
