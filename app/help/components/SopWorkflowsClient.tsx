"use client";

import React, { useState } from "react";
import { 
  Building2, 
  FileText, 
  ArrowDownLeft, 
  Printer, 
  PhoneCall, 
  Boxes, 
  Truck, 
  ArrowRightLeft, 
  ClipboardList, 
  RotateCcw, 
  CreditCard, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { getSidebarBadgeStyle, NAVIGATION_SECTION_THEMES } from "@/lib/navigationThemes";

interface SopStep {
  step: number;
  title: string;
  route?: string;
  sidebarCode?: string;
  sidebarNavName?: string;
  badgeColor?: string; // Optional custom override
  action: string;
  details: string;
  tip?: string;
}

interface SopItem {
  id: number;
  sidebarCode: string;
  navName: string;
  title: string;
  route: string;
  headerBg: string;
  purpose: string;
  icon: any;
  steps: SopStep[];
}

export default function SopWorkflowsClient() {
  const [activeSopTab, setActiveSopTab] = useState(1);

  const sopData: SopItem[] = [
    {
      id: 1,
      sidebarCode: "1.1",
      navName: "Vendors & Suppliers",
      title: "1. Vendor Registration & Directory",
      route: "/dashboard/vendors",
      headerBg: "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200",
      purpose: "Register and verify suppliers, fabric mills, and manufacturing partners in your master vendor ledger before issuing purchase orders.",
      icon: Building2,
      steps: [
        {
          step: 1,
          title: "Access Vendor Directory",
          route: "/dashboard/vendors",
          sidebarCode: "1.1",
          sidebarNavName: "Vendors & Suppliers",
          action: "Open the Vendor Management screen from the sidebar.",
          details: "Click on 1.1 Vendors & Suppliers on the left navigation panel to view all existing registered suppliers."
        },
        {
          step: 2,
          title: "Create Supplier Profile",
          route: "/dashboard/vendors",
          sidebarCode: "1.1",
          sidebarNavName: "Vendors & Suppliers",
          action: "Click '+ Add Vendor' and complete the business identity form.",
          details: "Fill in Legal Business Name, Contact Person, Phone, Email, and GSTIN (vital for claimable GST input tax credit reconciliation)."
        },
        {
          step: 3,
          title: "Activate for Procurement",
          route: "/dashboard/vendors",
          sidebarCode: "1.1",
          sidebarNavName: "Vendors & Suppliers",
          action: "Save profile with 'Active' status.",
          details: "Once saved, this vendor immediately appears in all purchase order and inward drop-down selectors across all company warehouses.",
          tip: "Always ensure the vendor's GST state code matches their billing address to auto-calculate IGST vs CGST/SGST correctly."
        }
      ]
    },
    {
      id: 2,
      sidebarCode: "1.2",
      navName: "Purchase Orders (PO)",
      title: "2. Purchase Order Procurement",
      route: "/dashboard/inventory/purchase",
      headerBg: "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200",
      purpose: "Issue official Purchase Orders (PO) for manufactured garments or raw fabric material to be delivered to a target warehouse.",
      icon: FileText,
      steps: [
        {
          step: 1,
          title: "Initiate Purchase Order",
          route: "/dashboard/inventory/purchase",
          sidebarCode: "1.2",
          sidebarNavName: "Purchase Orders (PO)",
          action: "Navigate to Purchase Orders and click 'Create Purchase Order'.",
          details: "Select the target Vendor, destination Warehouse node, and generate a unique PO tracking number."
        },
        {
          step: 2,
          title: "Add Variants & Cost Rates",
          route: "/dashboard/inventory/purchase",
          sidebarCode: "1.2",
          sidebarNavName: "Purchase Orders (PO)",
          action: "Select garments/fabrics and define expected quantities.",
          details: "Input ordered units per size/color along with agreed unit procurement cost price. The system calculates subtotal and tax amounts."
        },
        {
          step: 3,
          title: "Dispatch to Supplier",
          route: "/dashboard/inventory/purchase",
          sidebarCode: "1.2",
          sidebarNavName: "Purchase Orders (PO)",
          action: "Mark status as 'SENT' and share PO document.",
          details: "Download or email the generated PO PDF directly to the manufacturer to trigger production or shipment dispatch."
        }
      ]
    },
    {
      id: 3,
      sidebarCode: "1.2 & 1.4",
      navName: "Inbound Receiving",
      title: "3. Stock Receiving (Inbound PO Check-in)",
      route: "/dashboard/inventory/purchase",
      headerBg: "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200",
      purpose: "Physically check-in received goods arriving at warehouse docks against active purchase order line items.",
      icon: ArrowDownLeft,
      steps: [
        {
          step: 1,
          title: "Open Pending PO",
          route: "/dashboard/inventory/purchase",
          sidebarCode: "1.2",
          sidebarNavName: "Purchase Orders (PO)",
          action: "Select the arriving shipment's PO number.",
          details: "Open the order details page and click 'Receive Items' to open the physical check-in wizard."
        },
        {
          step: 2,
          title: "Count & Verify Items",
          route: "/dashboard/inventory/purchase",
          sidebarCode: "1.2",
          sidebarNavName: "Purchase Orders (PO)",
          action: "Count received boxes and inspect garments.",
          details: "Type or scan the actual received quantity for each variant. Any shortage or defective items can be logged as partial arrivals."
        },
        {
          step: 3,
          title: "Commit Inward to Live Ledger",
          route: "/dashboard/inward",
          sidebarCode: "1.4",
          sidebarNavName: "Inward Receiving",
          action: "Click 'Receive & Commit'.",
          details: "The database increments warehouse currentStockLevel in real time, and the PO status automatically switches to COMPLETED or PARTIALLY RECEIVED."
        }
      ]
    },
    {
      id: 4,
      sidebarCode: "1.3",
      navName: "Print Barcodes",
      title: "4. Barcode Labeling & Shelving",
      route: "/dashboard/barcode",
      headerBg: "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200",
      purpose: "Print standardized scannable hangtags or adhesive stickers for newly received items before bin storage.",
      icon: Printer,
      steps: [
        {
          step: 1,
          title: "Select Product & Batch Count",
          route: "/dashboard/barcode",
          sidebarCode: "1.3",
          sidebarNavName: "Print Barcodes",
          action: "Navigate to 1.3 Print Barcodes and search SKU.",
          details: "Search by product title or SKU code, and enter the exact number of labels required."
        },
        {
          step: 2,
          title: "Configure Label Layout",
          route: "/dashboard/barcode",
          sidebarCode: "1.3",
          sidebarNavName: "Print Barcodes",
          action: "Select label template dimensions.",
          details: "Choose standard 2x2 inch garment hangtag, thermal roll, or jewelry sticker format according to your barcode printer specifications."
        },
        {
          step: 3,
          title: "Print & Affix to Garments",
          route: "/dashboard/barcode",
          sidebarCode: "1.3",
          sidebarNavName: "Print Barcodes",
          action: "Send to printer and attach tags.",
          details: "Attach barcode hangtags to clothing necklabels or outer polybags and place them onto designated rack shelves."
        }
      ]
    },
    {
      id: 5,
      sidebarCode: "3.1",
      navName: "Orders Directory",
      title: "5. COD Order Call Verification",
      route: "/dashboard/orders",
      headerBg: "bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-200",
      purpose: "Mandatory telephonic confirmation for Cash On Delivery (COD) orders to prevent high Return-to-Origin (RTO) freight costs.",
      icon: PhoneCall,
      steps: [
        {
          step: 1,
          title: "Filter Unverified COD Orders",
          route: "/dashboard/orders",
          sidebarCode: "3.1",
          sidebarNavName: "Orders Directory",
          action: "Go to 3.1 Orders Directory and filter by 'COD' & 'Unverified'.",
          details: "The system flags all newly placed Cash On Delivery orders requiring manual customer confirmation."
        },
        {
          step: 2,
          title: "Call Customer",
          route: "/dashboard/orders",
          sidebarCode: "3.1",
          sidebarNavName: "Orders Directory",
          action: "Dial customer's phone number from the order record.",
          details: "Confirm shipping address, garment size, and customer availability to accept delivery with cash ready."
        },
        {
          step: 3,
          title: "Confirm or Cancel",
          route: "/dashboard/orders",
          sidebarCode: "3.1",
          sidebarNavName: "Orders Directory",
          action: "Update order status.",
          details: "Click 'Verify Order' to approve for packing. If unreachable after 3 attempts or rejected by customer, mark as 'Cancelled' to prevent wasted fulfillment costs.",
          tip: "Prepaid orders (Razorpay/UPI) skip this step automatically and proceed directly to Pick & Pack."
        }
      ]
    },
    {
      id: 6,
      sidebarCode: "3.1",
      navName: "Orders Directory",
      title: "6. Order Fulfillment (Pick & Pack Barcode Matching)",
      route: "/dashboard/orders",
      headerBg: "bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-200",
      purpose: "Pick garments from warehouse bins and verify barcode match before sealing parcels to ensure 100% packing accuracy.",
      icon: Boxes,
      steps: [
        {
          step: 1,
          title: "Generate Picklist",
          route: "/dashboard/orders",
          sidebarCode: "3.1",
          sidebarNavName: "Orders Directory",
          action: "Select confirmed orders and retrieve garments from shelves.",
          details: "Gather items from designated bin locations corresponding to the order variant SKUs."
        },
        {
          step: 2,
          title: "Barcode Match Scan",
          route: "/dashboard/orders",
          sidebarCode: "3.1",
          sidebarNavName: "Orders Directory",
          action: "Scan each item's barcode in the packing station.",
          details: "The system compares scanned barcode against order lines. If the wrong size or color is scanned, an error tone triggers to prevent mispacks."
        },
        {
          step: 3,
          title: "Weight Check & AWB Generation",
          route: "/dashboard/orders",
          sidebarCode: "3.1",
          sidebarNavName: "Orders Directory",
          action: "Package the order and print courier shipping label.",
          details: "Enter box dead weight, select shipping courier (Delhivery, Bluedart, etc.), and generate the official shipping AWB."
        }
      ]
    },
    {
      id: 7,
      sidebarCode: "4.1",
      navName: "Logistics & Shipping",
      title: "7. Logistics Handover & Manifests",
      route: "/dashboard/logistics",
      headerBg: "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-blue-200",
      purpose: "Hand over packed orders to courier pickup executives with legally binding signed manifest custody sheets.",
      icon: Truck,
      steps: [
        {
          step: 1,
          title: "Create Daily Carrier Manifest",
          route: "/dashboard/logistics",
          sidebarCode: "4.1",
          sidebarNavName: "Logistics & Shipping",
          action: "Open 4.1 Logistics & Shipping and click 'Create Manifest'.",
          details: "Select the assigned carrier partner (e.g. Delhivery Surface/Air) for today's pickup batch."
        },
        {
          step: 2,
          title: "Scan All Outbound Parcels",
          route: "/dashboard/logistics",
          sidebarCode: "4.1",
          sidebarNavName: "Logistics & Shipping",
          action: "Scan each parcel's AWB barcode as it enters the pickup cage.",
          details: "Ensure physical box count exactly matches the manifest counter on screen."
        },
        {
          step: 3,
          title: "Driver Signature & Dispatch",
          route: "/dashboard/logistics",
          sidebarCode: "4.1",
          sidebarNavName: "Logistics & Shipping",
          action: "Print manifest sheet and capture driver's signature.",
          details: "Click 'Dispatch Manifest'. Customers receive automated tracking SMS/Email notifications, and orders update to IN_TRANSIT."
        }
      ]
    },
    {
      id: 8,
      sidebarCode: "2.1",
      navName: "Stock & SKU Inventory",
      title: "8. Inter-Warehouse Stock Transfers",
      route: "/dashboard/inventory",
      headerBg: "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200",
      purpose: "Rebalance stock between central warehouses and retail storefronts without losing tracking visibility.",
      icon: ArrowRightLeft,
      steps: [
        {
          step: 1,
          title: "Create Transfer Request",
          route: "/dashboard/inventory",
          sidebarCode: "2.1",
          sidebarNavName: "Stock & SKU Inventory",
          action: "Select source and destination warehouse nodes.",
          details: "Choose the variant SKU and the unit quantity to move from mother warehouse to store."
        },
        {
          step: 2,
          title: "Transit Departure (Sent)",
          route: "/dashboard/inward-outward",
          sidebarCode: "2.3",
          sidebarNavName: "Movement & Audit Logs",
          action: "Mark status as 'SENT' upon vehicle loading.",
          details: "Inventory is decremented from source warehouse and held in an 'In-Transit' virtual state."
        },
        {
          step: 3,
          title: "Destination Receipt (Completed)",
          route: "/dashboard/inventory",
          sidebarCode: "2.1",
          sidebarNavName: "Stock & SKU Inventory",
          action: "Destination warehouse scans arrival and marks 'COMPLETED'.",
          details: "Stock is added to destination warehouse live balances, becoming immediately available for local POS sales."
        }
      ]
    },
    {
      id: 9,
      sidebarCode: "2.2",
      navName: "Inventory Audits",
      title: "9. Inventory Cycle Auditing",
      route: "/dashboard/inventory/audits",
      headerBg: "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200",
      purpose: "Reconcile physical warehouse shelf stock with database balances to detect shrinkage, theft, or inventory errors.",
      icon: ClipboardList,
      steps: [
        {
          step: 1,
          title: "Launch Audit Session",
          route: "/dashboard/inventory/audits",
          sidebarCode: "2.2",
          sidebarNavName: "Inventory Audits",
          action: "Go to 2.2 Inventory Audits and click 'Start Cycle Audit'.",
          details: "Select the warehouse location and specific rack zone to audit."
        },
        {
          step: 2,
          title: "Scan Physical Racks",
          route: "/dashboard/inventory/audits",
          sidebarCode: "2.2",
          sidebarNavName: "Inventory Audits",
          action: "Scan every garment tag with a handheld barcode scanner.",
          details: "The system logs expected vs scanned delta in real-time, providing immediate audio beep/buzz confirmation."
        },
        {
          step: 3,
          title: "Reconcile & Commit Adjustments",
          route: "/dashboard/inventory/audits",
          sidebarCode: "2.2",
          sidebarNavName: "Inventory Audits",
          action: "Click 'Reconcile & Close'.",
          details: "Database stock counts are overwritten to match reality, and an adjustment log is generated for accounting audits."
        }
      ]
    },
    {
      id: 10,
      sidebarCode: "4.1",
      navName: "Logistics Returns",
      title: "10. Customer Returns & Restocking (RTO / RMA)",
      route: "/dashboard/logistics",
      headerBg: "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-blue-200",
      purpose: "Inspect customer returns or RTO parcels, verify garment condition, and restock units back to active inventory.",
      icon: RotateCcw,
      steps: [
        {
          step: 1,
          title: "Scan Return Tracking Label",
          route: "/dashboard/logistics",
          sidebarCode: "4.1",
          sidebarNavName: "Logistics & Shipping",
          action: "Open Logistics Returns and scan return AWB barcode.",
          details: "The system pulls up original customer details and order contents automatically."
        },
        {
          step: 2,
          title: "Quality Check (QC)",
          route: "/dashboard/logistics",
          sidebarCode: "4.1",
          sidebarNavName: "Logistics & Shipping",
          action: "Inspect physical garment condition.",
          details: "Check for original tags, unwashed condition, and hygiene seals. Tag as 'Restockable' or 'Damaged / Write-off'."
        },
        {
          step: 3,
          title: "Restock to Warehouse",
          route: "/dashboard/inventory",
          sidebarCode: "2.1",
          sidebarNavName: "Stock & SKU Inventory",
          action: "Submit RMA restocking record.",
          details: "Restockable garments increment warehouse inventory immediately, updating online storefront stock count in real-time."
        }
      ]
    },
    {
      id: 11,
      sidebarCode: "6.2",
      navName: "Settings & Billing",
      title: "11. Direct Razorpay Settlements & Gateway Refunds",
      route: "/dashboard/settings",
      headerBg: "bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-200",
      purpose: "Manage direct merchant bank settlements (0% platform cut), trigger instant customer refunds, and handle zero-balance fallback options.",
      icon: CreditCard,
      steps: [
        {
          step: 1,
          title: "Direct Merchant Account Settlements",
          route: "/dashboard/settings",
          sidebarCode: "6.2",
          sidebarNavName: "Tenant Settings & Billing",
          action: "Connect your company's own Razorpay API credentials.",
          details: "100% of customer order payments flow directly into your own Razorpay account and settle to your bank account with zero middleman escrow."
        },
        {
          step: 2,
          title: "Trigger Automated Refunds",
          route: "/dashboard/orders",
          sidebarCode: "3.1",
          sidebarNavName: "Orders Directory",
          action: "Open order in 3.1 Orders Directory and click 'Issue Refund'.",
          details: "The system triggers an automated API refund directly through Razorpay back to the customer's original payment source."
        },
        {
          step: 3,
          title: "Zero-Balance Fallback Handling",
          route: "/dashboard/orders",
          sidebarCode: "3.1",
          sidebarNavName: "Orders Directory",
          action: "Choose alternative if Razorpay lacks refund balance.",
          details: "Select: (1) Instant Store Credit voucher (keeps money in your brand), (2) Queued Gateway Refund, or (3) Manual UPI/IMPS transfer reference log."
        }
      ]
    },
    {
      id: 12,
      sidebarCode: "1.4 & POS",
      navName: "Inward & POS Sales",
      title: "12. Vendor Surplus & Direct Bulk Customer Billing (Without Barcodes)",
      route: "/dashboard/pos",
      headerBg: "bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border-purple-200",
      purpose: "Receive surplus fabric rolls or off-catalog bulk lots from a vendor without barcode tags, and immediately invoice them in bulk to a customer.",
      icon: Sparkles,
      steps: [
        {
          step: 1,
          title: "Verify / Add Product in Catalog",
          route: "/dashboard/inventory",
          sidebarCode: "2.1",
          sidebarNavName: "Stock & SKU Inventory",
          action: "Check if product title exists in 2.1 Stock & SKU Inventory.",
          details: "If it exists, note the SKU. If it is a brand new surplus lot, click '+ Add Product', enter Title (e.g. 'Cotton Twill Surplus Lot'), SKU, base rate, and save."
        },
        {
          step: 2,
          title: "Inward Surplus Stock (No Scanner Needed)",
          route: "/dashboard/inward",
          sidebarCode: "1.4",
          sidebarNavName: "Inward Receiving",
          action: "Log physical surplus quantity in 1.4 Inward Receiving.",
          details: "Select warehouse, choose product from drop-down, type surplus volume (e.g. 50 or 500 units), and click 'Submit Inward'.",
          tip: "Crucial prerequisite: Inwarding first guarantees POS checkout will never block your transaction with 'Insufficient Stock'."
        },
        {
          step: 3,
          title: "Generate Bulk Bill via POS Counter",
          route: "/dashboard/pos",
          sidebarCode: "POS",
          sidebarNavName: "POS Counter Sales",
          action: "Create customer invoice in POS Counter Sales.",
          details: "Search product name, click quantity box and type bulk order quantity (e.g. 50), enter negotiated wholesale discount, type Buyer Name & Phone, and click 'Complete Sale'."
        },
        {
          step: 4,
          title: "Print & Share Tax Invoice",
          route: "/dashboard/pos",
          sidebarCode: "POS",
          sidebarNavName: "POS Counter Sales",
          action: "Hand over A4 or Thermal Tax Invoice.",
          details: "Print standard 80mm thermal receipt or A4 Tax Invoice, or export PDF to share via WhatsApp. Stock is deducted automatically."
        }
      ]
    }
  ];

  const currentSop = sopData.find(s => s.id === activeSopTab) || sopData[0];
  const SopIcon = currentSop.icon;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Official Operations Manual
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Portal (Always Up-to-Date)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Standard Operating Procedures (SOPs)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Select any procedure below to view step-by-step instructions, sidebar routes, and operational guidelines.
            </p>
          </div>
        </div>

        {/* 12-Tab Selector Pills */}
        <div className="pt-4">
          <div className="text-[11px] font-black text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span>📖 Ledger Index Tabs — Click to Jump to Procedure:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {sopData.map((sop) => {
              const isActive = activeSopTab === sop.id;
              const TabIcon = sop.icon;
              return (
                <button
                  key={sop.id}
                  onClick={() => setActiveSopTab(sop.id)}
                  className={`flex flex-col p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/50"
                      : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    {/* Big Bold High-Contrast Number Badge */}
                    <span className={`w-6 h-6 rounded-md text-xs font-black flex items-center justify-center flex-shrink-0 shadow-2xs ${
                      isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900 border border-slate-300"
                    }`}>
                      {sop.id}
                    </span>

                    {/* High-Contrast Color Tag matching exact sidebar code */}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-black border shadow-2xs ${
                      isActive
                        ? "bg-white text-slate-900 border-white"
                        : getSidebarBadgeStyle(sop.sidebarCode)
                    }`}>
                      {sop.sidebarCode}
                    </span>
                  </div>

                  <div className="text-[11px] font-black truncate leading-tight mt-0.5">
                    {sop.navName}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active SOP Content Pane */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
        {/* Header of Active SOP */}
        <div className={`p-5 rounded-2xl border ${currentSop.headerBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center flex-shrink-0 text-slate-800">
                <SopIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 bg-white/80 border border-slate-200/80 px-2 py-0.5 rounded">
                    SOP {currentSop.id} of 12
                  </span>
                  
                  {/* High Contrast Sidebar Destination Pill */}
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-black shadow-xs">
                    <span className="text-amber-400 font-mono text-xs">Sidebar Code:</span>
                    <span className="font-mono text-sm underline decoration-amber-400 decoration-2">{currentSop.sidebarCode}</span>
                    <span className="text-slate-300 text-[11px] font-normal">({currentSop.navName})</span>
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight mt-1">
                  {currentSop.title}
                </h2>
              </div>
            </div>

            <a
              href={currentSop.route}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-all self-start sm:self-auto"
            >
              <span>Open Screen</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed font-medium">
            {currentSop.purpose}
          </p>
        </div>

        {/* Step-by-Step Cards */}
        <div className="space-y-4">
          <div className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            Step-by-Step Instructions ({currentSop.steps.length} Steps)
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {currentSop.steps.map((st) => {
              const effectiveCode = st.sidebarCode || currentSop.sidebarCode;
              const effectiveBadgeStyle = st.badgeColor || getSidebarBadgeStyle(effectiveCode);
              return (
              <div 
                key={st.step} 
                className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:bg-white hover:shadow-xs transition-all"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Step Number Circle */}
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                    {st.step}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {st.title}
                      </h3>
                      {st.route && (
                        <div className="flex flex-wrap items-center gap-1.5 self-start">
                          <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded shadow-2xs border ${effectiveBadgeStyle}`}>
                            Sidebar: {effectiveCode} {st.sidebarNavName ? `(${st.sidebarNavName})` : ""}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md">
                            {st.route}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm font-semibold text-indigo-900 mt-1">
                      Action: {st.action}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-650 mt-1 leading-relaxed">
                      {st.details}
                    </p>

                    {st.tip && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed"><strong>Pro-Tip:</strong> {st.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );})}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setActiveSopTab(Math.max(1, activeSopTab - 1))}
            disabled={activeSopTab === 1}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            &larr; Previous SOP
          </button>
          <span className="text-xs font-mono font-bold text-slate-500">
            {activeSopTab} / {sopData.length}
          </span>
          <button
            onClick={() => setActiveSopTab(Math.min(sopData.length, activeSopTab + 1))}
            disabled={activeSopTab === sopData.length}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Next SOP &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
