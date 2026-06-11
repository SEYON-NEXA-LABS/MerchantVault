import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import process from "process";
import fs from "fs";
import path from "path";

// Load .env.local manually
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn("Failed to load .env.local manually:", e);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || "" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Create Company
  const company = await prisma.company.upsert({
    where: { code: "vtex" },
    update: {},
    create: {
      name: "V Textile Company",
      code: "vtex",
      shopifyStoreUrl: "https://vtex-clothing.myshopify.com",
      shopifyAccessToken: "shpat_mockaccesstoken12345",
      whatsappNumber: "+919876543210",
      whatsappApiKey: "wa_mock_key_abc123",
      onboardingCompleted: true,
      timezone: "IST",
      currency: "INR",
      contactEmail: "ops@vtextile.com",
    },
  });
  console.log(`🏢 Company created/upserted: ${company.name} (Code: ${company.code})`);

  // 2. Create Warehouses
  const whMumbai = await prisma.warehouse.upsert({
    where: { companyId_code: { companyId: company.id, code: "MUM-01" } },
    update: {},
    create: {
      companyId: company.id,
      name: "Mumbai Central Hub",
      code: "MUM-01",
      addressLine1: "Lower Parel Industrial Area",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400013",
      country: "India",
      isDefaultPickup: true,
    },
  });

  const whBangalore = await prisma.warehouse.upsert({
    where: { companyId_code: { companyId: company.id, code: "BLR-02" } },
    update: {},
    create: {
      companyId: company.id,
      name: "Bengaluru Distribution Center",
      code: "BLR-02",
      addressLine1: "Whitefield Tech Park Road",
      city: "Bengaluru",
      state: "Karnataka",
      zip: "560066",
      country: "India",
      isDefaultPickup: false,
    },
  });
  console.log("📍 Warehouses seeded successfully.");

  // 3. Create Users
  const usersToSeed = [
    {
      username: "admin",
      email: "admin@vtex.local",
      password: "admin123",
      role: "TENANTADMIN" as const,
    },
    {
      username: "operator",
      email: "operator@vtex.local",
      password: "operator123",
      role: "STAFF" as const,
    },
    {
      username: "superadmin",
      email: "super@platform.local",
      password: "super123",
      role: "SUPERADMIN" as const,
    },
  ];

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: u.password,
        role: u.role,
        isActive: true,
      },
      create: {
        companyId: company.id,
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role,
        isActive: true,
      },
    });
  }
  console.log("👥 Users/Staff profiles seeded.");

  // 4. Create Product Variants (expanded catalog)
  const variantsToSeed = [
    // SEYON Oversized T-Shirt variants
    {
      shopifyVariantId: "gid://shopify/ProductVariant/44123456789",
      sku: "TWCT001-BLK-M",
      title: "SEYON Oversized T-Shirt",
      size: "M",
      color: "Black",
      barcodeString: "TWCT001BLKM",
      price: 1299,
    },
    {
      shopifyVariantId: "gid://shopify/ProductVariant/44123456790",
      sku: "TWCT001-BLK-L",
      title: "SEYON Oversized T-Shirt",
      size: "L",
      color: "Black",
      barcodeString: "TWCT001BLKL",
      price: 1299,
    },
    {
      shopifyVariantId: "gid://shopify/ProductVariant/44123456791",
      sku: "TWCT001-WHT-S",
      title: "SEYON Oversized T-Shirt",
      size: "S",
      color: "White",
      barcodeString: "TWCT001WHTS",
      price: 1299,
    },
    // SEYON Cargo Pants variants
    {
      shopifyVariantId: "gid://shopify/ProductVariant/44123456792",
      sku: "TWCP001-OLV-32",
      title: "SEYON Cargo Pants",
      size: "32",
      color: "Olive",
      barcodeString: "TWCP001OLV32",
      price: 1999,
    },
    {
      shopifyVariantId: "gid://shopify/ProductVariant/44123456793",
      sku: "TWCP001-OLV-34",
      title: "SEYON Cargo Pants",
      size: "34",
      color: "Olive",
      barcodeString: "TWCP001OLV34",
      price: 1999,
    },
    // SEYON Hoodie variants
    {
      shopifyVariantId: "gid://shopify/ProductVariant/44123456794",
      sku: "TWH001-GRY-L",
      title: "SEYON Hoodie",
      size: "L",
      color: "Grey",
      barcodeString: "TWH001GRYL",
      price: 2499,
    },
    {
      shopifyVariantId: "gid://shopify/ProductVariant/44123456795",
      sku: "TWH001-GRY-XL",
      title: "SEYON Hoodie",
      size: "XL",
      color: "Grey",
      barcodeString: "TWH001GRYXL",
      price: 2499,
    },
    // SEYON Sweatshirt variants
    {
      shopifyVariantId: "gid://shopify/ProductVariant/44123456796",
      sku: "TWSS001-NVY-XL",
      title: "SEYON Sweatshirt",
      size: "XL",
      color: "Navy",
      barcodeString: "TWSS001NVYXL",
      price: 1799,
    },
    {
      shopifyVariantId: "gid://shopify/ProductVariant/44123456797",
      sku: "TWSS001-NVY-L",
      title: "SEYON Sweatshirt",
      size: "L",
      color: "Navy",
      barcodeString: "TWSS001NVYL",
      price: 1799,
    },
    // SEYON Joggers variants
    {
      shopifyVariantId: "gid://shopify/ProductVariant/44123456798",
      sku: "TWJG001-BLK-M",
      title: "SEYON Joggers",
      size: "M",
      color: "Black",
      barcodeString: "TWJG001BLKM",
      price: 1599,
    },
    {
      shopifyVariantId: "gid://shopify/ProductVariant/44123456799",
      sku: "TWJG001-BLK-L",
      title: "SEYON Joggers",
      size: "L",
      color: "Black",
      barcodeString: "TWJG001BLKL",
      price: 1599,
    },
  ];

  const variants = [];
  for (const v of variantsToSeed) {
    const configColor = v.color.toLowerCase() === "olive" ? "green" : v.color.toLowerCase();
    const mockConfig = JSON.stringify({
      color: configColor,
      shapes: [
        { size: 35, top: 10, left: 15, opacity: 0.2 },
        { size: 55, top: 40, left: 35, opacity: 0.25 },
        { size: 40, top: 15, left: 55, opacity: 0.15 }
      ]
    });

    const variant = await prisma.productVariant.upsert({
      where: { companyId_sku: { companyId: company.id, sku: v.sku } },
      update: {
        title: v.title,
        size: v.size,
        color: v.color,
        barcodeString: v.barcodeString,
        thumbnailConfig: mockConfig,
        price: v.price,
      },
      create: {
        companyId: company.id,
        shopifyVariantId: v.shopifyVariantId,
        sku: v.sku,
        title: v.title,
        size: v.size,
        color: v.color,
        barcodeString: v.barcodeString,
        safetyStockLimit: 10,
        currentStockLevel: 0, // Will be computed below
        thumbnailConfig: mockConfig,
        price: v.price,
      },
    });
    variants.push({ ...variant, price: v.price });
  }
  console.log(`👕 ${variants.length} product variants seeded.`);

  // 5. Seed WarehouseStock levels
  const stockLevels = [
    // MUM-01 Stock
    { warehouseId: whMumbai.id, variantIndex: 0, currentStockLevel: 65 },
    { warehouseId: whMumbai.id, variantIndex: 1, currentStockLevel: 42 },
    { warehouseId: whMumbai.id, variantIndex: 2, currentStockLevel: 15 },
    { warehouseId: whMumbai.id, variantIndex: 3, currentStockLevel: 28 },
    { warehouseId: whMumbai.id, variantIndex: 4, currentStockLevel: 22 },
    { warehouseId: whMumbai.id, variantIndex: 5, currentStockLevel: 7 },
    { warehouseId: whMumbai.id, variantIndex: 6, currentStockLevel: 18 },
    { warehouseId: whMumbai.id, variantIndex: 7, currentStockLevel: 5 },
    { warehouseId: whMumbai.id, variantIndex: 8, currentStockLevel: 31 },
    { warehouseId: whMumbai.id, variantIndex: 9, currentStockLevel: 44 },
    { warehouseId: whMumbai.id, variantIndex: 10, currentStockLevel: 29 },

    // BLR-02 Stock
    { warehouseId: whBangalore.id, variantIndex: 0, currentStockLevel: 35 },
    { warehouseId: whBangalore.id, variantIndex: 1, currentStockLevel: 38 },
    { warehouseId: whBangalore.id, variantIndex: 2, currentStockLevel: 35 },
    { warehouseId: whBangalore.id, variantIndex: 3, currentStockLevel: 12 },
    { warehouseId: whBangalore.id, variantIndex: 4, currentStockLevel: 19 },
    { warehouseId: whBangalore.id, variantIndex: 5, currentStockLevel: 25 },
    { warehouseId: whBangalore.id, variantIndex: 6, currentStockLevel: 14 },
    { warehouseId: whBangalore.id, variantIndex: 7, currentStockLevel: 20 },
    { warehouseId: whBangalore.id, variantIndex: 8, currentStockLevel: 11 },
    { warehouseId: whBangalore.id, variantIndex: 9, currentStockLevel: 16 },
    { warehouseId: whBangalore.id, variantIndex: 10, currentStockLevel: 21 },
  ];

  for (const st of stockLevels) {
    const variantId = variants[st.variantIndex].id;
    await prisma.warehouseStock.upsert({
      where: { warehouseId_variantId: { warehouseId: st.warehouseId, variantId } },
      update: { currentStockLevel: st.currentStockLevel },
      create: {
        warehouseId: st.warehouseId,
        variantId,
        currentStockLevel: st.currentStockLevel,
      },
    });
  }
  console.log("📦 Seeding Serialized Units (item-level QR codes)...");
  for (const st of stockLevels) {
    const variant = variants[st.variantIndex];
    const whCode = st.warehouseId === whMumbai.id ? "MUM-01" : "BLR-02";
    for (let i = 1; i <= 5; i++) {
      const qrCodeString = `vtex:${whCode}:${variant.sku}:${i.toString().padStart(4, "0")}`;
      await prisma.serializedUnit.upsert({
        where: { qrCodeString },
        update: {
          status: "AVAILABLE",
          warehouseId: st.warehouseId,
        },
        create: {
          companyId: company.id,
          variantId: variant.id,
          warehouseId: st.warehouseId,
          qrCodeString,
          status: "AVAILABLE"
        }
      });
    }
  }
  console.log("🏷️ Serialized units seeded successfully.");

  // Calculate sum total stock limit updates per variant
  for (const v of variants) {
    const totalStock = await prisma.warehouseStock.aggregate({
      where: { variantId: v.id },
      _sum: { currentStockLevel: true },
    });
    await prisma.productVariant.update({
      where: { id: v.id },
      data: { currentStockLevel: totalStock._sum.currentStockLevel || 0 },
    });
  }
  console.log("📦 Warehouse stock levels mapped and synchronized.");

  // 6. Seed Order Fulfillments (varied statuses for dashboard data)
  const fulfillmentsToSeed = [
    {
      shopifyOrderId: "gid://shopify/Order/55123456789",
      orderNumber: "#ORD-10254",
      customerName: "Rahul Sharma",
      customerPhone: "+919988776655",
      shippingAddressLine1: "123, Marine Drive",
      shippingCity: "Mumbai",
      shippingState: "Maharashtra",
      shippingZip: "400002",
      shippingCountry: "India",
      awbNumber: "AWB998811223",
      courierPartner: "Delhivery",
      deliveryStatus: "PROCESSING" as const,
      warehouseId: whMumbai.id,
    },
    {
      shopifyOrderId: "gid://shopify/Order/55123456790",
      orderNumber: "#ORD-10253",
      customerName: "Aman Gupta",
      customerPhone: "+918877665544",
      shippingAddressLine1: "456, Indiranagar",
      shippingCity: "Bengaluru",
      shippingState: "Karnataka",
      shippingZip: "560038",
      shippingCountry: "India",
      awbNumber: "AWB887722119",
      courierPartner: "Bluedart",
      deliveryStatus: "SHIPPED" as const,
      warehouseId: whBangalore.id,
    },
    {
      shopifyOrderId: "gid://shopify/Order/55123456791",
      orderNumber: "#ORD-10252",
      customerName: "Neha Verma",
      customerPhone: "+919911223344",
      shippingAddressLine1: "789, Connaught Place",
      shippingCity: "New Delhi",
      shippingState: "Delhi",
      shippingZip: "110001",
      shippingCountry: "India",
      awbNumber: "AWB776633001",
      courierPartner: "Delhivery",
      deliveryStatus: "DELIVERED" as const,
      warehouseId: whMumbai.id,
    },
    {
      shopifyOrderId: "gid://shopify/Order/55123456792",
      orderNumber: "#ORD-10251",
      customerName: "Rohit Singh",
      customerPhone: "+919812345678",
      shippingAddressLine1: "321, MG Road",
      shippingCity: "Pune",
      shippingState: "Maharashtra",
      shippingZip: "411001",
      shippingCountry: "India",
      awbNumber: "AWB554433778",
      courierPartner: "Bluedart",
      deliveryStatus: "RTO_INITIATED" as const,
      warehouseId: whMumbai.id,
    },
    {
      shopifyOrderId: "gid://shopify/Order/55123456793",
      orderNumber: "#ORD-10250",
      customerName: "Priya Patel",
      customerPhone: "+919955443322",
      shippingAddressLine1: "55, SG Highway",
      shippingCity: "Ahmedabad",
      shippingState: "Gujarat",
      shippingZip: "380015",
      shippingCountry: "India",
      awbNumber: null,
      courierPartner: null,
      deliveryStatus: "PROCESSING" as const,
      warehouseId: whBangalore.id,
    },
    {
      shopifyOrderId: "gid://shopify/Order/55123456794",
      orderNumber: "#ORD-10249",
      customerName: "Vikram Mehta",
      customerPhone: "+919876001234",
      shippingAddressLine1: "99, Anna Nagar",
      shippingCity: "Chennai",
      shippingState: "Tamil Nadu",
      shippingZip: "600040",
      shippingCountry: "India",
      awbNumber: "AWB112233998",
      courierPartner: "DTDC",
      deliveryStatus: "DELIVERED" as const,
      warehouseId: whBangalore.id,
    },
    {
      shopifyOrderId: "gid://shopify/Order/55123456795",
      orderNumber: "#ORD-10248",
      customerName: "Anjali Desai",
      customerPhone: "+919867543210",
      shippingAddressLine1: "12, Banjara Hills",
      shippingCity: "Hyderabad",
      shippingState: "Telangana",
      shippingZip: "500034",
      shippingCountry: "India",
      awbNumber: "AWB998877665",
      courierPartner: "Delhivery",
      deliveryStatus: "SHIPPED" as const,
      warehouseId: whMumbai.id,
    },
  ];

  for (const f of fulfillmentsToSeed) {
    await prisma.orderFulfillment.upsert({
      where: { companyId_shopifyOrderId: { companyId: company.id, shopifyOrderId: f.shopifyOrderId } },
      update: {
        deliveryStatus: f.deliveryStatus,
        awbNumber: f.awbNumber,
        courierPartner: f.courierPartner,
      },
      create: {
        companyId: company.id,
        shopifyOrderId: f.shopifyOrderId,
        orderNumber: f.orderNumber,
        customerName: f.customerName,
        customerPhone: f.customerPhone,
        shippingAddressLine1: f.shippingAddressLine1,
        shippingCity: f.shippingCity,
        shippingState: f.shippingState,
        shippingZip: f.shippingZip,
        shippingCountry: f.shippingCountry,
        awbNumber: f.awbNumber,
        courierPartner: f.courierPartner,
        deliveryStatus: f.deliveryStatus,
        warehouseId: f.warehouseId,
      },
    });
  }
  console.log(`🚚 ${fulfillmentsToSeed.length} order fulfillments seeded.`);

  // 7. Seed sample StockMovement records
  const movementsToSeed = [
    { variantIndex: 0, warehouseId: whMumbai.id, type: "INWARD" as const, quantity: 50, operatorEmail: "operator@vtex.local" },
    { variantIndex: 1, warehouseId: whMumbai.id, type: "INWARD" as const, quantity: 30, operatorEmail: "operator@vtex.local" },
    { variantIndex: 0, warehouseId: whMumbai.id, type: "OUTWARD" as const, quantity: 5, operatorEmail: "operator@vtex.local" },
    { variantIndex: 2, warehouseId: whBangalore.id, type: "INWARD" as const, quantity: 40, operatorEmail: "admin@vtex.local" },
    { variantIndex: 3, warehouseId: whBangalore.id, type: "OUTWARD" as const, quantity: 3, operatorEmail: "admin@vtex.local" },
    { variantIndex: 5, warehouseId: whMumbai.id, type: "INWARD" as const, quantity: 20, operatorEmail: "operator@vtex.local" },
    { variantIndex: 9, warehouseId: whMumbai.id, type: "INWARD" as const, quantity: 50, operatorEmail: "operator@vtex.local" },
    { variantIndex: 10, warehouseId: whBangalore.id, type: "OUTWARD" as const, quantity: 2, operatorEmail: "admin@vtex.local" },
  ];

  for (const m of movementsToSeed) {
    await prisma.stockMovement.create({
      data: {
        companyId: company.id,
        variantId: variants[m.variantIndex].id,
        warehouseId: m.warehouseId,
        type: m.type,
        quantity: m.quantity,
        operatorEmail: m.operatorEmail,
        syncStatus: "SUCCESS",
      },
    });
  }
  console.log(`📋 ${movementsToSeed.length} stock movement records seeded.`);

  // 8. Seed sample PurchaseOrders
  console.log("🛒 Seeding Purchase Orders...");
  const po1 = await prisma.purchaseOrder.upsert({
    where: { companyId_poNumber: { companyId: company.id, poNumber: "PO-10001" } },
    update: {},
    create: {
      companyId: company.id,
      poNumber: "PO-10001",
      vendorName: "Apex Fabrics Ltd",
      vendorEmail: "sales@apexfabrics.com",
      status: "SENT",
      warehouseId: whMumbai.id,
      items: {
        create: [
          { variantId: variants[0].id, quantityOrdered: 100, costPrice: 450 },
          { variantId: variants[1].id, quantityOrdered: 50, costPrice: 450 },
        ]
      }
    }
  });

  const po2 = await prisma.purchaseOrder.upsert({
    where: { companyId_poNumber: { companyId: company.id, poNumber: "PO-10002" } },
    update: {},
    create: {
      companyId: company.id,
      poNumber: "PO-10002",
      vendorName: "Zeta Knits & Weaves",
      vendorEmail: "orders@zetaknits.com",
      status: "PARTIALLY_RECEIVED",
      warehouseId: whBangalore.id,
      items: {
        create: [
          { variantId: variants[2].id, quantityOrdered: 200, quantityReceived: 120, costPrice: 380 },
          { variantId: variants[3].id, quantityOrdered: 100, quantityReceived: 0, costPrice: 600 },
        ]
      }
    }
  });
  console.log("🛒 Purchase Orders seeded successfully.");

  // 9. Seed sample CourierConfig & ShippingManifest
  console.log("🚚 Seeding Logistics & Courier Settings...");
  await prisma.courierConfig.upsert({
    where: { companyId_courierPartner: { companyId: company.id, courierPartner: "SHIPROCKET" } },
    update: {},
    create: {
      companyId: company.id,
      courierPartner: "SHIPROCKET",
      apiEmail: "ops@vtextile.com",
      apiPassword: "shiprocketpassword123",
      isActive: true
    }
  });

  await prisma.courierConfig.upsert({
    where: { companyId_courierPartner: { companyId: company.id, courierPartner: "DELHIVERY" } },
    update: {},
    create: {
      companyId: company.id,
      courierPartner: "DELHIVERY",
      apiKey: "delhivery_api_key_mock_123",
      isActive: true
    }
  });

  const manifest = await prisma.shippingManifest.upsert({
    where: { companyId_manifestNumber: { companyId: company.id, manifestNumber: "MNF-2026-001" } },
    update: {},
    create: {
      companyId: company.id,
      manifestNumber: "MNF-2026-001",
      courierPartner: "SHIPROCKET",
      warehouseId: whMumbai.id,
      status: "CREATED",
      driverName: "Karan Singh",
      driverPhone: "+919988770011"
    }
  });
  console.log("🚚 Logistics & Courier settings seeded successfully.");

  // 10. Seed Subscription details
  console.log("💳 Seeding Tenant Subscriptions...");
  await prisma.subscription.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      planType: "MONTHLY",
      amount: 4999.00,
      currency: "INR",
      status: "ACTIVE",
      startDate: new Date(),
      nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  });
  console.log("💳 Subscription seeded successfully.");

  console.log("🎉 Database Seeding Completed Successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
