"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Truck, CreditCard, RefreshCw } from "lucide-react";

import { applyBrandingStyles } from "../utils/branding";

const RECOMMENDED_ITEMS = [
  {
    id: "rec-1",
    sku: "ACC-CRD-01",
    title: "Premium Leather Card Holder",
    price: 1299,
    size: "One Size",
    color: "Charcoal Black",
    category: "Accessories",
    currentStockLevel: 10
  },
  {
    id: "rec-2",
    sku: "ACC-SCK-02",
    title: "Ribbed Merino Wool Socks",
    price: 499,
    size: "One Size",
    color: "Indigo Blue",
    category: "Accessories",
    currentStockLevel: 25
  }
];

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);

  const addRecommendedItem = (item: any) => {
    const existing = cart.find(
      it => it.product.id === item.id && it.selectedSize === item.size && it.selectedColor === item.color
    );

    let newCart;
    if (existing) {
      newCart = cart.map(it =>
        (it.product.id === item.id && it.selectedSize === item.size && it.selectedColor === item.color)
          ? { ...it, quantity: it.quantity + 1 }
          : it
      );
    } else {
      newCart = [...cart, { product: item, quantity: 1, selectedSize: item.size, selectedColor: item.color }];
    }
    
    setCart(newCart);
    localStorage.setItem("seyon:storefront:cart", JSON.stringify(newCart));
  };

  const [company, setCompany] = useState<any>(null);
  const [step, setStep] = useState<"form" | "loading" | "success">("form");

  // Form Fields
  const [form, setForm] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+919500012345",
    addressLine1: "15 Gandhi Marg",
    addressLine2: "Flat 2B",
    city: "Chennai",
    state: "Tamil Nadu",
    zip: "600002",
    country: "India",
    paymentMethod: "COD"
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [zipResult, setZipResult] = useState<any | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<string>("delhivery");
  const [orderName, setOrderName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

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

  // Calculate simulated courier estimates based on zip input
  useEffect(() => {
    if (form.zip.trim().length === 6) {
      // Mock estimations
      const city = form.city || "your city";
      setZipResult({
        available: true,
        options: [
          { id: "shiprocket", name: "Shiprocket Air Express", days: 2, price: 150 },
          { id: "delhivery", name: "Delhivery Surface", days: 4, price: 0 }
        ]
      });
    } else {
      setZipResult(null);
    }
  }, [form.zip, form.city]);

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Full name is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(form.email)) errors.email = "Please enter a valid email";

    const phoneRegex = /^\+?[0-9]{10,14}$/;
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    else if (!phoneRegex.test(form.phone)) errors.phone = "Enter valid phone number (+91...)";

    if (!form.addressLine1.trim()) errors.addressLine1 = "Shipping address is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.state.trim()) errors.state = "State is required";
    
    if (!form.zip.trim()) errors.zip = "Zip/Pincode is required";
    else if (form.zip.trim().length !== 6) errors.zip = "Pincode must be 6 digits";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingCost = zipResult && selectedCourier ? zipResult.options.find((o: any) => o.id === selectedCourier)?.price || 0 : 0;
  const grandTotal = cartTotal * 1.18 + shippingCost;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setStep("loading");

    const shopifyOrderId = `storefront-${Math.floor(Math.random() * 900000) + 100000}`;
    const generatedOrderName = `#SF-${Math.floor(Math.random() * 9000) + 10000}${form.paymentMethod === "COD" ? "-COD" : ""}`;
    const trackingCode = `AWB-${Math.floor(Math.random() * 90000000) + 10000000}`;

    const webhookUrl = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:3000/api/webhooks/shopify/orders-create"
      : "https://fabricvault.vercel.app/api/webhooks/shopify/orders-create";

    const payload = {
      companyId: company?.id,
      shopifyOrderId,
      orderNumber: generatedOrderName,
      customerName: form.name,
      customerPhone: form.phone,
      customerEmail: form.email,
      totalPrice: cartTotal,
      currency: "INR",
      shippingAddressLine1: form.addressLine1,
      shippingAddressLine2: form.addressLine2,
      shippingCity: form.city,
      shippingState: form.state,
      shippingZip: form.zip,
      shippingCountry: form.country,
      line_items: cart.map(item => ({
        variantId: item.product.id,
        sku: item.product.sku,
        price: item.product.price,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.success) {
        setOrderName(generatedOrderName);
        setTrackingNumber(trackingCode);
        setStep("success");
        // Clear local cart
        localStorage.removeItem("seyon:storefront:cart");
      } else {
        throw new Error(data.error || "Order ingestion failed");
      }
    } catch (e) {
      console.warn("Direct webhook failed/skipped, falling back to mock success state:", e);
      setOrderName(generatedOrderName);
      setTrackingNumber(trackingCode);
      setStep("success");
      localStorage.removeItem("seyon:storefront:cart");
    }
  };

  const getLogoText = () => {
    if (company?.code === "wolfcabin") return "The Wolf Cabin";
    return company?.name || "SEYON STOREFRONT";
  };

  if (step === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Securing Order Session...</h3>
        <p style={{ color: "#71717a", fontSize: "0.8rem", marginTop: "0.25rem" }}>Ingesting order into Seyon ERP registry.</p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--background)" }}>
        <main style={{ flex: 1, maxWidth: "600px", width: "100%", margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}>
          <div style={{ display: "inline-flex", padding: "0.75rem", backgroundColor: "#f0fdf4", borderRadius: "50%", color: "#16a34a", marginBottom: "1.5rem" }}>
            <CheckCircle2 style={{ width: "3.5rem", height: "3.5rem" }} />
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--foreground)", letterSpacing: "-0.03em" }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: "#71717a", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Thank you for shopping. Your order has been registered in the platform database.
          </p>

          <div style={{
            margin: "2.5rem 0",
            padding: "1.5rem",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "#fafafa",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            fontSize: "0.85rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", fontWeight: "700" }}>
              <span>Order Reference</span>
              <span style={{ color: "var(--primary)" }}>{orderName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Delivery Status</span>
              <span style={{ fontWeight: "700", color: "#d97706" }}>Processing</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Assigned Courier AWB</span>
              <span style={{ fontFamily: "monospace", fontWeight: "600" }}>{trackingNumber}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Customer Details</span>
              <span>{form.name} | {form.phone}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--background)" }}>
      {/* Header */}
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
          <Link href="/cart" style={{ textDecoration: "none", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ArrowLeft style={{ width: "1.1rem", height: "1.1rem" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: "700", textTransform: "uppercase" }}>{getLogoText()}</span>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#71717a", fontWeight: "600" }}>
          <ShieldCheck style={{ width: "1.1rem", height: "1.1rem", color: "#16a34a" }} /> Secure Checkout
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: "1050px", width: "100%", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2.5rem" }} className="checkout-grid">
          {/* Shipping Form Panel */}
          <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            
            {/* Step 1: Customer Contact */}
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem", backgroundColor: "#ffffff" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", width: "22px", height: "22px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>1</span>
                Contact & Shipping Details
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "#52525b" }}>Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleInputChange("name", e.target.value)}
                      style={{ padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${formErrors.name ? '#ef4444' : 'var(--border)'}`, fontSize: "0.85rem", outline: "none" }}
                    />
                    {formErrors.name && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{formErrors.name}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "#52525b" }}>Contact Phone</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={e => handleInputChange("phone", e.target.value)}
                      style={{ padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${formErrors.phone ? '#ef4444' : 'var(--border)'}`, fontSize: "0.85rem", outline: "none" }}
                    />
                    {formErrors.phone && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{formErrors.phone}</span>}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "#52525b" }}>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleInputChange("email", e.target.value)}
                    style={{ padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${formErrors.email ? '#ef4444' : 'var(--border)'}`, fontSize: "0.85rem", outline: "none" }}
                  />
                  {formErrors.email && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{formErrors.email}</span>}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "#52525b" }}>Address Line 1</label>
                  <input
                    type="text"
                    value={form.addressLine1}
                    onChange={e => handleInputChange("addressLine1", e.target.value)}
                    style={{ padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${formErrors.addressLine1 ? '#ef4444' : 'var(--border)'}`, fontSize: "0.85rem", outline: "none" }}
                  />
                  {formErrors.addressLine1 && <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>{formErrors.addressLine1}</span>}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "#52525b" }}>Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={form.addressLine2}
                    onChange={e => handleInputChange("addressLine2", e.target.value)}
                    style={{ padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid var(--border)", fontSize: "0.85rem", outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "#52525b" }}>City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => handleInputChange("city", e.target.value)}
                      style={{ padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${formErrors.city ? '#ef4444' : 'var(--border)'}`, fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "#52525b" }}>State</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={e => handleInputChange("state", e.target.value)}
                      style={{ padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${formErrors.state ? '#ef4444' : 'var(--border)'}`, fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "#52525b" }}>Zip / Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={form.zip}
                      onChange={e => handleInputChange("zip", e.target.value)}
                      style={{ padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${formErrors.zip ? '#ef4444' : 'var(--border)'}`, fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                </div>
                {(formErrors.city || formErrors.state || formErrors.zip) && (
                  <span style={{ color: "#ef4444", fontSize: "0.7rem" }}>Please verify Pincode, City, and State.</span>
                )}
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem", backgroundColor: "#ffffff" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", width: "22px", height: "22px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>2</span>
                Shipping Courier Speed
              </h3>

              {!zipResult ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#71717a", fontSize: "0.8rem" }}>
                  <Truck style={{ width: "1.25rem", height: "1.25rem" }} />
                  <span>Enter a valid 6-digit Pincode above to view delivery options.</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {zipResult.options.map((opt: any) => (
                    <label key={opt.id} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.85rem",
                      borderRadius: "0.375rem",
                      border: `1.5px solid ${selectedCourier === opt.id ? 'var(--primary)' : 'var(--border)'}`,
                      cursor: "pointer",
                      backgroundColor: selectedCourier === opt.id ? 'rgba(13, 148, 136, 0.03)' : '#ffffff'
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <input
                          type="radio"
                          name="courier"
                          value={opt.id}
                          checked={selectedCourier === opt.id}
                          onChange={() => setSelectedCourier(opt.id)}
                          style={{ accentColor: "var(--primary)" }}
                        />
                        <div style={{ fontSize: "0.85rem" }}>
                          <span style={{ fontWeight: "700", display: "block" }}>{opt.name}</span>
                          <span style={{ color: "#71717a", fontSize: "0.75rem" }}>Estimated delivery: {opt.days} business days</span>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{opt.price === 0 ? 'FREE' : `+₹${opt.price}`}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem", backgroundColor: "#ffffff" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", width: "22px", height: "22px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>3</span>
                Payment Option
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <label style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  border: `1.5px solid ${form.paymentMethod === 'COD' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  backgroundColor: form.paymentMethod === 'COD' ? 'rgba(13, 148, 136, 0.03)' : '#ffffff'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={form.paymentMethod === "COD"}
                    onChange={() => handleInputChange("paymentMethod", "COD")}
                    className="hidden"
                    style={{ display: "none" }}
                  />
                  <Truck style={{ width: "1.5rem", height: "1.5rem", color: form.paymentMethod === 'COD' ? 'var(--primary)' : '#71717a' }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>Cash on Delivery</span>
                  <span style={{ fontSize: "0.7rem", color: "#71717a", textAlign: "center" }}>Pay when package arrives</span>
                </label>

                <label style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  border: `1.5px solid ${form.paymentMethod === 'CARD' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  backgroundColor: form.paymentMethod === 'CARD' ? 'rgba(13, 148, 136, 0.03)' : '#ffffff',
                  opacity: 0.8
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={form.paymentMethod === "CARD"}
                    onChange={() => handleInputChange("paymentMethod", "CARD")}
                    className="hidden"
                    style={{ display: "none" }}
                  />
                  <CreditCard style={{ width: "1.5rem", height: "1.5rem", color: form.paymentMethod === 'CARD' ? 'var(--primary)' : '#71717a' }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>Debit / Credit Card</span>
                  <span style={{ fontSize: "0.7rem", color: "#71717a", textAlign: "center" }}>Simulated checkout card</span>
                </label>
              </div>
            </div>
          </form>

          {/* Sidebar Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              backgroundColor: "#fafafa",
              alignSelf: "flex-start",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem"
            }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", margin: 0 }}>
                Order Summary
              </h3>

              {/* Cart List Mini */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "180px", overflowY: "auto", paddingRight: "0.25rem" }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "32px", height: "32px", backgroundColor: "#e4e4e7", borderRadius: "0.25rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: "bold", flexShrink: 0 }}>
                      {item.product.title.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product.title}</span>
                      <span style={{ fontSize: "0.65rem", color: "#71717a" }}>Qty: {item.quantity} | Size: {item.selectedSize}</span>
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", flexShrink: 0 }}>₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "0.85rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                fontSize: "0.8rem",
                color: "#52525b"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Cart Subtotal</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Courier Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Taxes & GST (18%)</span>
                  <span>₹{(cartTotal * 0.18).toLocaleString("en-IN")}</span>
                </div>
                <div style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.85rem",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1rem",
                  fontWeight: "800",
                  color: "var(--foreground)"
                }}>
                  <span>Final Total</span>
                  <span>₹{Math.round(grandTotal).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                style={{ width: "100%", padding: "0.75rem" }}
                className="btn btn-primary"
              >
                Place Secure Order (₹{Math.round(grandTotal).toLocaleString("en-IN")})
              </button>
            </div>

            {/* Recommended Items */}
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              backgroundColor: "#ffffff",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", margin: 0, color: "#52525b" }}>
                Add Accessories
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {RECOMMENDED_ITEMS.map((item) => {
                  const inCart = cart.some(it => it.product.id === item.id);
                  return (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "40px", height: "40px", backgroundColor: "#f4f4f5", borderRadius: "0.25rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold", color: "#71717a", flexShrink: 0, border: "1px solid var(--border)" }}>
                        {item.title.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                        <span style={{ fontSize: "0.7rem", color: "#71717a" }}>₹{item.price.toLocaleString("en-IN")}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => !inCart && addRecommendedItem(item)}
                        disabled={inCart}
                        style={{
                          padding: "0.35rem 0.75rem",
                          fontSize: "0.75rem",
                          borderRadius: "var(--radius)",
                          backgroundColor: inCart ? "transparent" : "var(--primary)",
                          color: inCart ? "var(--primary)" : "var(--primary-foreground)",
                          border: inCart ? "1px solid var(--primary)" : "1px solid transparent",
                          cursor: inCart ? "default" : "pointer",
                          fontWeight: "700",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {inCart ? "Added" : "+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
