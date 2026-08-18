import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@repo/db";
import { getContextCompanyId } from "@/lib/session";

/**
 * Helper to escape CSV cell contents
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "gstr1_csv"; // "gstr1_csv" | "gstr3b_summary" | "tally_xml"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const companyId = await getContextCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized / Missing Tenant Context" }, { status: 401 });
    }

    // 1. Fetch Company details for merchant GSTIN
    const { data: company } = await supabaseAdmin
      .from("Company")
      .select("name, gstin, code")
      .eq("id", companyId)
      .single();

    // 2. Fetch Orders for date range with joined Order price details
    let query = supabaseAdmin
      .from("OrderFulfillment")
      .select("id, orderNumber, shopifyOrderId, customerName, customerPhone, shippingCity, shippingState, shippingZip, buyerGstin, buyerCompanyName, placeOfSupply, taxType, cgstAmount, sgstAmount, igstAmount, taxableAmount, createdAt, deliveryStatus, orderSource, orderId, Order(totalPrice)")
      .eq("companyId", companyId);

    if (startDate) {
      query = query.gte("createdAt", startDate);
    }
    if (endDate) {
      query = query.lte("createdAt", endDate);
    }

    const { data: rawOrders, error } = await query.order("createdAt", { ascending: false });
    if (error) throw error;

    // Dynamically calculate GST breakdown if taxableAmount is 0 or null
    const { calculateGstBreakdown } = await import("@/app/utils/gst");
    const orders = (rawOrders || []).map((ord: any) => {
      let taxableAmount = ord.taxableAmount || 0;
      let cgstAmount = ord.cgstAmount || 0;
      let sgstAmount = ord.sgstAmount || 0;
      let igstAmount = ord.igstAmount || 0;
      let taxType = ord.taxType || "INTRA_STATE";
      let placeOfSupply = ord.placeOfSupply || "33-TAMIL NADU";

      const orderPrice = ord.Order?.totalPrice || 0;

      if ((!taxableAmount || taxableAmount === 0) && orderPrice > 0) {
        const calc = calculateGstBreakdown({
          amount: orderPrice,
          merchantState: "Tamil Nadu",
          shippingState: ord.shippingState || "Tamil Nadu"
        });
        taxableAmount = calc.taxableAmount;
        cgstAmount = calc.cgstAmount;
        sgstAmount = calc.sgstAmount;
        igstAmount = calc.igstAmount;
        taxType = calc.taxType;
        placeOfSupply = calc.placeOfSupply;
      }

      return {
        ...ord,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        taxType,
        placeOfSupply,
        orderPrice
      };
    });


    // Format 1: GSTR-1 B2B / B2C CSV Report
    if (format === "gstr1_csv") {
      const headers = [
        "Invoice Number",
        "Invoice Date",
        "Invoice Value",
        "Place of Supply",
        "Reverse Charge",
        "Invoice Type",
        "E-Commerce GSTIN",
        "Rate (%)",
        "Taxable Value",
        "Cess Amount",
        "Buyer GSTIN",
        "Buyer Legal Name",
        "Tax Type",
        "CGST Amount (₹)",
        "SGST Amount (₹)",
        "IGST Amount (₹)",
        "Order Source"
      ];

      const csvRows = [headers.map(escapeCsv).join(",")];

      (orders || []).forEach((ord: any) => {
        const totalInvoiceValue = ((ord.taxableAmount || 0) + (ord.cgstAmount || 0) + (ord.sgstAmount || 0) + (ord.igstAmount || 0)).toFixed(2);
        const invDate = new Date(ord.createdAt).toISOString().split("T")[0];
        const isB2b = Boolean(ord.buyerGstin);

        const row = [
          ord.orderNumber,
          invDate,
          totalInvoiceValue,
          ord.placeOfSupply || "33-Tamil Nadu",
          "N",
          isB2b ? "Regular B2B" : "Consumer B2C",
          company?.gstin || "",
          "12.0",
          (ord.taxableAmount || 0).toFixed(2),
          "0.00",
          ord.buyerGstin || "",
          ord.buyerCompanyName || ord.customerName || "",
          ord.taxType || "INTRA_STATE",
          (ord.cgstAmount || 0).toFixed(2),
          (ord.sgstAmount || 0).toFixed(2),
          (ord.igstAmount || 0).toFixed(2),
          ord.orderSource || "STOREFRONT"
        ];
        csvRows.push(row.map(escapeCsv).join(","));
      });

      const csvContent = csvRows.join("\n");
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="GSTR1_Export_${company?.code || "merchant"}_${new Date().toISOString().split("T")[0]}.csv"`
        }
      });
    }

    // Format 2: Tally Prime XML Vouchers Format
    if (format === "tally_xml") {
      let xmlVouchers = "";

      (orders || []).forEach((ord: any) => {
        const totalVal = ((ord.taxableAmount || 0) + (ord.cgstAmount || 0) + (ord.sgstAmount || 0) + (ord.igstAmount || 0)).toFixed(2);
        const tallyDate = new Date(ord.createdAt).toISOString().split("T")[0].replace(/-/g, "");

        xmlVouchers += `
    <VOUCHER VCHTYPE="Sales" ACTION="Create">
      <DATE>${tallyDate}</DATE>
      <NARRATION>Order ${ord.orderNumber} via ${ord.orderSource || "STOREFRONT"}</NARRATION>
      <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
      <VOUCHERNUMBER>${ord.orderNumber}</VOUCHERNUMBER>
      <PARTYLEDGERNAME>${ord.buyerCompanyName || ord.customerName || "Cash Sales"}</PARTYLEDGERNAME>
      <PERSISTEDVIEW>Invoice View</PERSISTEDVIEW>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${ord.buyerCompanyName || ord.customerName || "Cash Sales"}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
        <AMOUNT>-${totalVal}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>Sales Account</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>${(ord.taxableAmount || 0).toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      ${ord.cgstAmount > 0 ? `
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>CGST Output</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>${(ord.cgstAmount || 0).toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>` : ""}
      ${ord.sgstAmount > 0 ? `
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>SGST Output</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>${(ord.sgstAmount || 0).toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>` : ""}
      ${ord.igstAmount > 0 ? `
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>IGST Output</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>${(ord.igstAmount || 0).toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>` : ""}
    </VOUCHER>`;
      });

      const tallyXml = `<?xml version="1.0"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>${xmlVouchers}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

      return new NextResponse(tallyXml, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Content-Disposition": `attachment; filename="Tally_Sales_Import_${company?.code || "merchant"}_${new Date().toISOString().split("T")[0]}.xml"`
        }
      });
    }

    // Default JSON Summary Response
    const summary = (orders || []).reduce(
      (acc: any, ord: any) => {
        acc.totalOrders += 1;
        acc.totalTaxable += ord.taxableAmount || 0;
        acc.totalCgst += ord.cgstAmount || 0;
        acc.totalSgst += ord.sgstAmount || 0;
        acc.totalIgst += ord.igstAmount || 0;
        if (ord.buyerGstin) acc.b2bOrdersCount += 1;
        return acc;
      },
      { totalOrders: 0, totalTaxable: 0, totalCgst: 0, totalSgst: 0, totalIgst: 0, b2bOrdersCount: 0 }
    );

    return NextResponse.json({
      success: true,
      company: company?.name,
      gstin: company?.gstin,
      summary,
      orders
    });
  } catch (err: any) {
    console.error("GST Export API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
