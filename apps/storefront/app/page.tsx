import React from "react";
import { supabase } from "@repo/db";
import { Scissors, ShoppingCart, Info } from "lucide-react";

export const revalidate = 0; // Disable static caching for real-time stock sync

export default async function StorefrontPage() {
  // Fetch variants from database
  let variants: any[] = [];
  try {
    const { data } = await supabase
      .from("ProductVariant")
      .select("id, sku, title, size, color, price, currentStockLevel")
      .order("title", { ascending: true });
    
    variants = data || [];
  } catch (e) {
    console.error("Failed to fetch products:", e);
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      {/* Navbar */}
      <header style={{
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            backgroundColor: "#f59e0b",
            color: "#0f172a",
            padding: "0.4rem",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Scissors style={{ width: "1.2rem", height: "1.2rem" }} />
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: "bold", letterSpacing: "-0.025em" }}>Seyon Storefront</span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
          <span style={{ cursor: "pointer", opacity: 0.9 }}>Catalog</span>
          <span style={{ cursor: "pointer", opacity: 0.7 }}>About</span>
          <span style={{ cursor: "pointer", opacity: 0.7 }}>Support</span>
        </div>
      </header>

      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #f5efe4 0%, #ebe1cf 100%)",
        padding: "4rem 2rem",
        textAlign: "center",
        borderBottom: "1px solid rgba(0,0,0,0.05)"
      }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>Premium Apparel Collection</h1>
        <p style={{ color: "#475569", marginTop: "0.75rem", fontSize: "1.1rem", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
          Direct real-time stock catalog sync powered by Seyon ERP. Discover high-quality fabrics, colors, and sizes.
        </p>
      </div>

      {/* Catalog Grid */}
      <main style={{ maxWidth: "1200px", margin: "3rem auto 0 auto", padding: "0 1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#0f172a", marginBottom: "1.5rem" }}>Available Products</h2>
        
        {variants.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "4rem 2rem",
            backgroundColor: "#fff",
            borderRadius: "0.75rem",
            border: "1px solid #e2e8f0"
          }}>
            <Info style={{ width: "2rem", height: "2rem", color: "#94a3b8", marginBottom: "0.5rem" }} />
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>No products in stock right now. Please seed the database or check back later.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem"
          }}>
            {variants.map((variant) => {
              const inStock = variant.currentStockLevel > 0;
              return (
                <div key={variant.id} style={{
                  backgroundColor: "#fff",
                  borderRadius: "1rem",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}>
                  {/* Mock Image */}
                  <div style={{
                    height: "200px",
                    backgroundColor: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    fontSize: "0.875rem",
                    position: "relative"
                  }}>
                    <img
                      src={`https://picsum.photos/seed/${variant.sku}/300/200`}
                      alt={variant.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      backgroundColor: inStock ? "#dcfce7" : "#fee2e2",
                      color: inStock ? "#15803d" : "#b91c1c",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "1rem",
                      fontSize: "0.75rem",
                      fontWeight: "700"
                    }}>
                      {inStock ? `${variant.currentStockLevel} In Stock` : "Out of Stock"}
                    </span>
                  </div>

                  <div style={{ padding: "1.25rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", margin: "0 0 0.25rem 0" }}>{variant.title}</h3>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 1rem 0" }}>SKU: {variant.sku}</p>
                    
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                      <span style={{ backgroundColor: "#f1f5f9", color: "#475569", fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", fontWeight: "600" }}>Size: {variant.size}</span>
                      <span style={{ backgroundColor: "#f1f5f9", color: "#475569", fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", fontWeight: "600" }}>Color: {variant.color}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>₹{variant.price}</span>
                      <button 
                        disabled={!inStock}
                        style={{
                          backgroundColor: inStock ? "#0f172a" : "#cbd5e1",
                          color: "#fff",
                          border: "none",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.5rem",
                          fontWeight: "650",
                          fontSize: "0.875rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          cursor: inStock ? "pointer" : "not-allowed"
                        }}
                      >
                        <ShoppingCart style={{ width: "1rem", height: "1rem" }} /> Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
