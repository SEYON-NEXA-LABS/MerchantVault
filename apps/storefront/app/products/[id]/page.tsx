"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Scissors, 
  ShoppingCart, 
  X, 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  Heart,
  Grid,
  WifiOff,
  ArrowLeft,
  Star,
  Check,
  Shirt,
  Gem,
  Watch,
  Glasses,
  Footprints,
  Crown,
  Palette,
  Sparkles,
  Zap
} from "lucide-react";

function ProductImage({ prod, style, showGallery = true }: { prod: any; style?: React.CSSProperties; showGallery?: boolean }) {
  const [activeIdx, setActiveIdx] = React.useState(0);

  let config: any = null;
  if (prod.thumbnailConfig) {
    try {
      config = JSON.parse(prod.thumbnailConfig);
    } catch (e) {
      // ignore
    }
  }

  const imagesList = config && config.images && Array.isArray(config.images) && config.images.length > 0
    ? config.images
    : config && config.imageUrl
      ? [config.imageUrl]
      : [];

  const PRODUCT_ICONS = [
    Shirt, ShoppingBag, Gem, Watch, Glasses, Footprints,
    Crown, Scissors, Palette, Sparkles, Star, Zap
  ];

  if (imagesList.length > 0) {
    const activeUrl = imagesList[activeIdx] || imagesList[0];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", height: "100%" }}>
        <div style={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: "0.5rem" }}>
          <img
            src={activeUrl}
            alt={prod.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
          />
        </div>
        {showGallery && imagesList.length > 1 && (
          <div style={{ display: "flex", gap: "0.375rem", overflowX: "auto", paddingBottom: "0.15rem" }}>
            {imagesList.map((imgUrl: string, idx: number) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(idx);
                }}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "0.25rem",
                  overflow: "hidden",
                  border: activeIdx === idx ? "2px solid #1c1917" : "1px solid #e7e5e4",
                  padding: 0,
                  cursor: "pointer",
                  flexShrink: 0
                }}
              >
                <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (config) {
    const bgColor = config.color === "green" ? "#ecfdf5" : 
                    config.color === "black" ? "#f3f4f6" : 
                    config.color === "white" ? "#ffffff" : 
                    config.color === "olive" ? "#f0fdf4" :
                    config.color === "grey" ? "#f9fafb" :
                    config.color === "navy" ? "#f0f9ff" :
                    `#fbfbfa`;
    
    const shapeColor = config.color === "black" ? "#4b5563" :
                       config.color === "white" ? "#cbd5e1" :
                       config.color === "green" ? "#10b981" :
                       config.color === "olive" ? "#84cc16" :
                       config.color === "grey" ? "#9ca3af" :
                       config.color === "navy" ? "#0284c7" :
                       "#4f46e5";
                        
    const textAndIconColor = config.color === "black" ? "#111827" :
                             config.color === "white" ? "#475569" :
                             config.color === "green" ? "#047857" :
                             config.color === "olive" ? "#4d7c0f" :
                             config.color === "grey" ? "#374151" :
                             config.color === "navy" ? "#0369a1" :
                             "#4338ca";

    const initials = prod.title
      ? prod.title.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()
      : "PV";

    const hash = prod.title ? prod.title.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 0;
    const IconComponent = PRODUCT_ICONS[hash % PRODUCT_ICONS.length] || Shirt;
                        
    return (
      <div style={{ 
        width: "100%", 
        height: "100%", 
        backgroundColor: bgColor, 
        position: "relative", 
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...style 
      }}>
        <IconComponent
          style={{
            position: "absolute",
            width: "60%",
            height: "60%",
            color: shapeColor,
            opacity: 0.15,
            pointerEvents: "none"
          }}
          strokeWidth={1.2}
        />
        <span style={{
          position: "relative",
          zIndex: 5,
          fontWeight: "800",
          fontSize: "2rem",
          color: textAndIconColor,
          opacity: 0.9,
          letterSpacing: "0.05em"
        }}>
          {initials}
        </span>
      </div>
    );
  }

  const initials = prod.title
    ? prod.title.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()
    : "PV";

  const hash = prod.title ? prod.title.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 0;
  const IconComponent = PRODUCT_ICONS[hash % PRODUCT_ICONS.length] || Shirt;

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      backgroundColor: "#f3f4f6", 
      position: "relative", 
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "300px",
      ...style 
    }}>
      <IconComponent
        style={{
          position: "absolute",
          width: "60%",
          height: "60%",
          color: "#9ca3af",
          opacity: 0.15,
          pointerEvents: "none"
        }}
        strokeWidth={1.2}
      />
      <span style={{
        position: "relative",
        zIndex: 5,
        fontWeight: "800",
        fontSize: "2rem",
        color: "#374151",
        opacity: 0.9,
        letterSpacing: "0.05em"
      }}>
        {initials}
      </span>
    </div>
  );
}

export default function ProductDetailPage() {
  const [erpAdminUrl, setErpAdminUrl] = useState("https://fabricvault.vercel.app/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (isLocal) {
        setErpAdminUrl("http://localhost:3000/dashboard");
      }
    }
  }, []);

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<any | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  // Cart & interactive states
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Indigo Blue");
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Load cart
      const storedCart = localStorage.getItem("seyon:storefront:cart");
      if (storedCart) {
        try {
          setCart(JSON.parse(storedCart));
        } catch (e) {
          // ignore
        }
      }

      // Load favorites
      const storedFavs = localStorage.getItem("seyon:storefront:favorites");
      if (storedFavs) {
        try {
          const favs = JSON.parse(storedFavs);
          if (Array.isArray(favs)) {
            setIsFavorite(favs.includes(id));
          }
        } catch (e) {
          // ignore
        }
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("seyon:storefront:cart", JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          throw new Error("Product not found");
        }
        const data = await res.json();
        setProduct(data.product);
        if (data.company) {
          setCompany(data.company);
        }
        if (data.product) {
          setSelectedSize(data.product.size || "M");
          setSelectedColor(data.product.color || "Indigo Blue");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (typeof window !== "undefined") {
      const storedFavs = localStorage.getItem("seyon:storefront:favorites");
      let favs: string[] = [];
      if (storedFavs) {
        try {
          favs = JSON.parse(storedFavs);
        } catch (e) {
          // ignore
        }
      }
      if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
      } else {
        favs.push(id);
      }
      localStorage.setItem("seyon:storefront:favorites", JSON.stringify(favs));
    }
  };

  const addToCart = (prod: any, size: string, color: string) => {
    const existing = cart.find(
      item => item.product.id === prod.id && item.selectedSize === size && item.selectedColor === color
    );

    if (existing) {
      setCart(prev => prev.map(item => 
        (item.product.id === prod.id && item.selectedSize === size && item.selectedColor === color)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart(prev => [...prev, { product: prod, quantity: 1, selectedSize: size, selectedColor: color }]);
    }

    setToastMessage({
      title: "Added to Shopping Bag",
      subtitle: `${prod.title} (${size} / ${color})`
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleBuyNow = (prod: any, size: string, color: string) => {
    addToCart(prod, size, color);
    router.push("/?checkout=true");
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart(prev => {
      const item = prev[idx];
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== idx);
      }
      return prev.map((it, i) => i === idx ? { ...it, quantity: newQty } : it);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#fbfbfa" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "2.5rem",
            height: "2.5rem",
            border: "3px solid #e7e5e4",
            borderTopColor: "#1c1917",
            borderRadius: "50%",
            margin: "0 auto 1rem auto",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ color: "#78716c", fontSize: "0.9rem", fontWeight: "600" }}>Loading product specifications...</p>
        </div>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div style={{ display: "flex", height: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#fbfbfa", gap: "1rem" }}>
        <AlertCircle style={{ width: "3rem", height: "3rem", color: "#dc2626" }} />
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#1c1917" }}>Product Not Found</h3>
        <p style={{ color: "#78716c", fontSize: "0.9rem" }}>{errorMsg || "The requested item could not be retrieved."}</p>
        <Link href="/" style={{
          backgroundColor: "#1c1917",
          color: "#fff",
          textDecoration: "none",
          padding: "0.6rem 1.2rem",
          borderRadius: "0.5rem",
          fontWeight: "700",
          fontSize: "0.85rem"
        }}>
          Return to Catalog
        </Link>
      </div>
    );
  }

  const inStock = product.currentStockLevel > 0;
  const sizes = ["S", "M", "L", "XL"];
  const colors = [product.color || "Indigo Blue", "Off-White", "Sage Green", "Charcoal Black"];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#fbfbfa" }}>
      {/* Header */}
      <header style={{
        position: "sticky",
        top: 0,
        backgroundColor: "rgba(251, 251, 250, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e7e5e4",
        zIndex: 40,
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none", color: "#1c1917" }}>
          <div style={{
            backgroundColor: "#1c1917",
            color: "#fff",
            width: "2.25rem",
            height: "2.25rem",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "900"
          }}>{(company?.name ? company.name[0] : "S").toUpperCase()}</div>
          <div>
            <span style={{ fontSize: "1.25rem", fontWeight: "900", letterSpacing: "-0.025em", textTransform: "uppercase" }}>
              {company?.name || "SEYON"}
            </span>
            <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#4f46e5", marginLeft: "0.5rem", border: "1px solid #e0e7ff", backgroundColor: "#f5f7ff", padding: "0.1rem 0.4rem", borderRadius: "0.4rem", textTransform: "uppercase" }}>
              Storefront
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <a 
            href={erpAdminUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#44403c", fontSize: "0.75rem", fontWeight: "700", textDecoration: "none" }}
          >
            ERP Admin Panel ↗
          </a>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              position: "relative",
              color: "#1c1917",
              padding: "0.5rem"
            }}
          >
            <ShoppingCart style={{ width: "1.35rem", height: "1.35rem" }} />
            {cartCount > 0 && (
              <span style={{
                position: "absolute",
                top: "0px",
                right: "0px",
                backgroundColor: "#dc2626",
                color: "#fff",
                fontSize: "0.65rem",
                fontWeight: "900",
                width: "1.1rem",
                height: "1.1rem",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main product area */}
      <main style={{ flex: 1, maxWidth: "1100px", margin: "2rem auto", padding: "0 1.5rem", width: "100%" }}>
        <Link href="/" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          textDecoration: "none",
          color: "#78716c",
          fontSize: "0.85rem",
          fontWeight: "600",
          marginBottom: "1.5rem",
          transition: "color 0.2s"
        }} className="back-link">
          <ArrowLeft style={{ width: "1rem", height: "1rem" }} /> Back to Catalog
        </Link>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "3rem",
          backgroundColor: "#fff",
          borderRadius: "1.5rem",
          border: "1px solid #e7e5e4",
          padding: "2.5rem",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
        }} className="product-layout-grid">
          
          {/* Left Column: Product Image Preview */}
          <div style={{ 
            borderRadius: "1rem", 
            overflow: "hidden", 
            border: "1px solid #e7e5e4", 
            aspectRatio: "1",
            maxHeight: "500px",
            backgroundColor: "#f5f5f4"
          }}>
            <ProductImage prod={product} />
          </div>

          {/* Right Column: Specifications Form */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ 
                backgroundColor: "#f5f5f4", 
                border: "1px solid #e7e5e4", 
                color: "#78716c", 
                fontSize: "0.7rem", 
                padding: "0.25rem 0.6rem", 
                borderRadius: "0.375rem", 
                fontWeight: "700",
                textTransform: "uppercase"
              }}>
                {product.category || "Apparel"}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#a8a29e", fontWeight: "700" }}>
                SKU: {product.sku}
              </span>
            </div>

            <h1 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#1c1917", margin: "0.75rem 0 0.5rem 0", lineHeight: "1.2" }}>
              {product.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", color: "#fbbf24" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} style={{ width: "1rem", height: "1rem", fill: "currentColor" }} />
                ))}
              </div>
              <span style={{ fontSize: "0.8rem", color: "#78716c", fontWeight: "700" }}>4.8 (24 reviews)</span>
            </div>

            <div style={{ 
              display: "flex", 
              alignItems: "baseline", 
              gap: "1rem", 
              paddingBottom: "1.5rem", 
              borderBottom: "1px solid #f5f5f4",
              marginBottom: "1.5rem"
            }}>
              <span style={{ fontSize: "2rem", fontWeight: "950", color: "#1c1917" }}>₹{product.price}</span>
              <span style={{
                backgroundColor: inStock ? "#ecfdf5" : "#fef2f2",
                color: inStock ? "#059669" : "#dc2626",
                padding: "0.3rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
                fontWeight: "800",
                border: inStock ? "1px solid #d1fae5" : "1px solid #fee2f2"
              }}>
                {inStock ? `Sync Active: ${product.currentStockLevel} Units` : "OUT OF STOCK"}
              </span>
            </div>

            <p style={{ color: "#57534e", fontSize: "0.9rem", lineHeight: "1.6", margin: "0 0 1.5rem 0" }}>
              {product.description || "Directly synced from Seyon ERP Database. Live stock tracking active."}
            </p>

            {/* Size Selector */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#44403c", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                Select Size
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      border: selectedSize === size ? "2px solid #1c1917" : "1px solid #e7e5e4",
                      backgroundColor: selectedSize === size ? "#1c1917" : "#fff",
                      color: selectedSize === size ? "#fff" : "#1c1917",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      fontWeight: "700",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.1s"
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div style={{ marginBottom: "2rem" }}>
              <span style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#44403c", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                Select Color
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      border: selectedColor === color ? "2px solid #1c1917" : "1px solid #e7e5e4",
                      backgroundColor: selectedColor === color ? "#1c1917" : "#fff",
                      color: selectedColor === color ? "#fff" : "#1c1917",
                      padding: "0.5rem 0.85rem",
                      borderRadius: "0.5rem",
                      fontWeight: "700",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.1s"
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
              <button
                onClick={() => addToCart(product, selectedSize, selectedColor)}
                disabled={!inStock}
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  border: "2px solid #1c1917",
                  color: "#1c1917",
                  borderRadius: "0.75rem",
                  padding: "0.9rem",
                  fontSize: "0.9rem",
                  fontWeight: "800",
                  cursor: inStock ? "pointer" : "not-allowed",
                  opacity: inStock ? 1 : 0.5,
                  transition: "background 0.2s"
                }}
                className="cart-btn"
              >
                Add to Cart
              </button>

              <button
                onClick={() => handleBuyNow(product, selectedSize, selectedColor)}
                disabled={!inStock}
                style={{
                  flex: 1.5,
                  backgroundColor: inStock ? "#1c1917" : "#d6d3d1",
                  border: "none",
                  color: "#fff",
                  borderRadius: "0.75rem",
                  padding: "0.9rem",
                  fontSize: "0.9rem",
                  fontWeight: "800",
                  cursor: inStock ? "pointer" : "not-allowed",
                  transition: "background 0.2s"
                }}
                className="buy-btn"
              >
                Buy It Now
              </button>

              <button
                onClick={toggleFavorite}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #e7e5e4",
                  borderRadius: "0.75rem",
                  padding: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <Heart style={{ width: "1.2rem", height: "1.2rem", fill: isFavorite ? "#e11d48" : "none", color: isFavorite ? "#e11d48" : "#78716c" }} />
              </button>
            </div>

            {/* Free shipping banner */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#f0fdf4",
              border: "1px solid #d1fae5",
              color: "#166534",
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              marginTop: "1.5rem",
              fontSize: "0.8rem",
              fontWeight: "600"
            }}>
              <Truck style={{ width: "1.1rem", height: "1.1rem" }} /> Free delivery & Cash on Delivery (COD) eligible.
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: "#1c1917",
        color: "#a8a29e",
        padding: "3rem 2rem",
        textAlign: "center",
        fontSize: "0.8rem",
        borderTop: "1px solid #292524",
        marginTop: "4rem"
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ margin: 0, color: "#f5f5f4", fontWeight: "700" }}>Seyon Storefront Demo Channel</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem" }}>Connected via direct PostgreSQL connection pool</p>
          </div>
          <div>
            <p style={{ margin: 0 }}>© {new Date().getFullYear()} Seyon ERP Suite. All margins kept.</p>
          </div>
        </div>
      </footer>

      {/* CART DRAWER SLIDE-OUT OVERLAY */}
      {isCartOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
          zIndex: 50,
          display: "flex",
          justifyContent: "flex-end"
        }}>
          <div style={{
            backgroundColor: "#fff",
            width: "100%",
            maxWidth: "420px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
            animation: "slideIn 0.3s ease-out"
          }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid #f5f5f4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800" }}>Shopping Bag ({cartCount})</h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c", padding: "0.25rem" }}
              >
                <X style={{ width: "1.2rem", height: "1.2rem" }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 0", color: "#a8a29e" }}>
                  <ShoppingBag style={{ width: "3rem", height: "3rem", margin: "0 auto 1rem auto", opacity: 0.5 }} />
                  <p style={{ fontWeight: "600", fontSize: "0.9rem", margin: 0 }}>Your bag is empty.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ width: "4.5rem", height: "4.5rem", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid #e7e5e4", flexShrink: 0 }}>
                        <ProductImage prod={item.product} style={{ fontSize: "1rem" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: "700", color: "#1c1917" }}>{item.product.title}</h4>
                          <span style={{ fontSize: "0.9rem", fontWeight: "800" }}>₹{item.product.price * item.quantity}</span>
                        </div>
                        <p style={{ margin: "0.25rem 0 0.5rem 0", fontSize: "0.75rem", color: "#78716c" }}>
                          Size: {item.selectedSize} | Color: {item.selectedColor}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <button 
                            onClick={() => updateCartQty(idx, -1)}
                            style={{ width: "1.5rem", height: "1.5rem", borderRadius: "0.25rem", border: "1px solid #e7e5e4", backgroundColor: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "0.8rem" }}
                          >-</button>
                          <span style={{ fontSize: "0.85rem", fontWeight: "700", minWidth: "1rem", textAlign: "center" }}>{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQty(idx, 1)}
                            style={{ width: "1.5rem", height: "1.5rem", borderRadius: "0.25rem", border: "1px solid #e7e5e4", backgroundColor: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "0.8rem" }}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: "1.5rem", borderTop: "1px solid #f5f5f4", backgroundColor: "#fbfbfa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>Subtotal</span>
                  <span style={{ fontWeight: "900", fontSize: "1.1rem" }}>₹{cartTotal}</span>
                </div>
                <button 
                  onClick={() => router.push("/?checkout=true")}
                  style={{
                    width: "100%",
                    backgroundColor: "#1c1917",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.75rem",
                    padding: "0.85rem",
                    fontWeight: "800",
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION FOR CART ADDITIONS */}
      {toastMessage && (
        <div className="toast-container">
          <div style={{
            backgroundColor: "#ecfdf5",
            color: "#059669",
            width: "2.25rem",
            height: "2.25rem",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <CheckCircle2 style={{ width: "1.2rem", height: "1.2rem" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: "700", fontSize: "0.85rem", color: "#1c1917" }}>{toastMessage.title}</p>
            <p style={{ margin: "0.1rem 0 0 0", fontSize: "0.75rem", color: "#78716c", fontWeight: "500" }}>{toastMessage.subtitle}</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            style={{
              backgroundColor: "#f5f5f4",
              border: "none",
              borderRadius: "0.375rem",
              padding: "0.35rem 0.6rem",
              fontSize: "0.7rem",
              fontWeight: "700",
              cursor: "pointer",
              color: "#1c1917"
            }}
          >
            Open Cart
          </button>
        </div>
      )}

      {/* Embedded CSS Animations */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .toast-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 100;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 300px;
          animation: slideUp 0.3s ease-out;
        }
        .back-link:hover {
          color: #1c1917 !important;
        }
        .product-layout-grid {
          grid-template-columns: 1fr 1.1fr;
        }
        @media (max-width: 768px) {
          .product-layout-grid {
            grid-template-columns: 1fr;
            padding: 1.5rem;
          }
        }
      `}</style>

      {/* Offline Overlay Modal */}
      {isOffline && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "1.5rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            maxWidth: "400px",
            width: "100%",
            padding: "2rem",
            textAlign: "center"
          }}>
            <div style={{
              width: "4rem",
              height: "4rem",
              backgroundColor: "#fef2f2",
              border: "1px solid #fee2e2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem auto",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
            }}>
              <WifiOff style={{ width: "2rem", height: "2rem", color: "#ef4444" }} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>No Internet Connection</h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: "1.5", margin: "0 0 1.5rem 0" }}>
              Your connection to Seyon Storefront was lost. Please verify your internet settings. We will reconnect automatically.
            </p>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#fef2f2",
              color: "#991b1b",
              fontSize: "0.75rem",
              fontWeight: "700",
              padding: "0.5rem 1rem",
              borderRadius: "9999px"
            }}>
              <span style={{
                position: "relative",
                display: "flex",
                width: "0.5rem",
                height: "0.5rem"
              }}>
                <span style={{
                  position: "absolute",
                  display: "inline-flex",
                  height: "100%",
                  width: "100%",
                  borderRadius: "50%",
                  backgroundColor: "#f87171",
                  opacity: 0.75,
                  animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite"
                }} />
                <span style={{
                  position: "relative",
                  display: "inline-flex",
                  borderRadius: "50%",
                  height: "0.5rem",
                  width: "0.5rem",
                  backgroundColor: "#ef4444"
                }} />
              </span>
              <span>Attempting to reconnect...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
