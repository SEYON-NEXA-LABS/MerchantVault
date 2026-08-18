"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  FolderOpen, 
  Package,
  QrCode,
  Truck
} from "lucide-react";

// Structure representing topics in our help system
interface HelpTopic {
  id: string;
  title: string;
  category: string;
  content: React.ReactNode;
}

export default function HelpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading Operations Guide...</div>}>
      <HelpContent />
    </Suspense>
  );
}

function HelpContent() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");

  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "Getting Started": true,
    "Modular Add-On Packs": true,
    "Operating SOPs": true,
    "Inventory & Barcodes": true,
    "Orders & Logistics": true,
    "Brand Customization & Storefront Channels": true
  });

  const [activeTopicId, setActiveTopicId] = useState("sop-workflows");

  useEffect(() => {
    if (topicParam) {
      setActiveTopicId(topicParam);
    }
  }, [topicParam]);

  // Help topic content dictionary
  const topics: HelpTopic[] = [
    {
      id: "sop-workflows",
      title: "Step-by-Step Operating Workflows (SOPs)",
      category: "Operating SOPs",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Step-by-Step Operations Flow (SOP)</h1>
          <p className="text-sm text-slate-707 leading-relaxed">
            Follow this end-to-end standard operating procedure (SOP) to manage suppliers, purchase supply, receiving, barcode operations, order verification, fulfillment, logistics dispatches, transfers, and inventory audits.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">1. Vendor Registration & Directory</h3>
          <p className="text-xs text-slate-655 leading-relaxed">
            Before ordering inventory, register your suppliers and fabric manufacturers in the directory:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-700 pl-2 space-y-1.5">
            <li>Go to the **Vendors** management panel.</li>
            <li>Click **Add Vendor** and input details (Name, Contact Email, GSTIN, and Billing Address).</li>
            <li>Verify the active status. This vendor is now available for procurement orders.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">2. Purchase Order (PO) Procurement</h3>
          <p className="text-xs text-slate-655 leading-relaxed">
            Create a purchase order request to supply garments to your warehouse locations:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-700 pl-2 space-y-1.5">
            <li>Go to **Purchase Orders** and click **Create Purchase Order**.</li>
            <li>Select the target Vendor, destination Warehouse, and enter a unique PO Number.</li>
            <li>Add the product variants, specifying the ordered quantities and unit cost prices.</li>
            <li>Set the status to **SENT** when dispatching the PO to the supplier.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">3. Stock Receiving (Inbound PO Check-in)</h3>
          <p className="text-xs text-slate-655 leading-relaxed">
            When the supplier's shipment arrives at the destination warehouse:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-700 pl-2 space-y-1.5">
            <li>Open the corresponding **Purchase Order** details page.</li>
            <li>Click **Receive Items** to open the inbound check-in panel.</li>
            <li>Scan or input the received quantity for each variant.</li>
            <li>Click **Receive & Commit** to automatically increment the warehouse inventory stock levels and update the PO to **COMPLETED** (or **PARTIALLY RECEIVED**).</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">4. Barcode Labeling & Shelving</h3>
          <p className="text-xs text-slate-655 leading-relaxed">
            If the incoming garments do not have physical labels attached yet:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-700 pl-2 space-y-1.5">
            <li>Open the **Barcode Operations** section.</li>
            <li>Select the SKU and quantity corresponding to the received batch.</li>
            <li>Select the appropriate tag layout size (e.g. 2"x2" standard tag) and print.</li>
            <li>Attach the printed barcode to the garment hangtags and shelve them.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">5. COD Order Call Verification</h3>
          <p className="text-xs text-slate-655 leading-relaxed">
            In Indian e-commerce retail, Cash On Delivery (COD) orders must be verified over a phone call before shipping to prevent high RTO (Return to Origin) losses:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-700 pl-2 space-y-1.5">
            <li>Go to the **Order Board** and select the **COD Call Log** tab.</li>
            <li>Contact the customer using the phone number listed on the order card.</li>
            <li>Once confirmed, click **Verify Order**. If unreachable after 3 attempts or cancelled by the user, mark as **Unreachable** or **Cancelled** respectively.</li>
            <li>Orders that are not marked **VERIFIED** (or prepaid **PAID**) will trigger a safety alert block before packaging.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">6. Order Fulfillment (Pick & Pack Barcode Matching)</h3>
          <p className="text-xs text-slate-655 leading-relaxed">
            When a customer places an order on your storefront (and passes COD checks):
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-700 pl-2 space-y-1.5">
            <li>Go to the **Order Board** and locate the order in **Active / Processing**.</li>
            <li>Pick the physical garments from the warehouse shelves matching the order details.</li>
            <li>Verify item accuracy by scanning each picked garment's barcode label in the Order Panel.</li>
            <li>Confirm package dimensions and weight, then generate the shipping **AWB** from your carrier.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">7. Logistics Handover & Manifests</h3>
          <p className="text-xs text-slate-655 leading-relaxed">
            Before packages are loaded onto the courier driver's vehicle:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-700 pl-2 space-y-1.5">
            <li>Open the **Logistics** panel and click **Create Manifest**.</li>
            <li>Select the courier partner (e.g. Bluedart or Delhivery) and assign all packed parcels.</li>
            <li>Print the manifest sheet and have the courier driver sign it as custody validation.</li>
            <li>Submit the manifest. The packages are now dispatched, and status updates are sent to the buyer.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">8. Inter-Warehouse Stock Transfers</h3>
          <p className="text-xs text-slate-655 leading-relaxed">
            To balance supply levels by moving garment stock between different warehouse nodes:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-700 pl-2 space-y-1.5">
            <li>Navigate to **Stock Transfers** and select **Initiate Transfer**.</li>
            <li>Specify the source location, destination warehouse, garment variant, and quantity.</li>
            <li>**Sent (Shipped)**: Once packed and loaded, the source operator logs it as shipped, decrementing source warehouse stock levels.</li>
            <li>**Completed (Received)**: Once received, the destination operator scans the arrivals, incrementing destination warehouse stock levels.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">9. Inventory Cycle Auditing</h3>
          <p className="text-xs text-slate-655 leading-relaxed">
            Reconcile physical floor stock levels with database counts to resolve shrinkage:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-700 pl-2 space-y-1.5">
            <li>Open **Inventory Audits** and create a count session for the warehouse.</li>
            <li>Walk the shelves and scan all physical tags. The ledger tracks the expected vs scanned delta.</li>
            <li>Use the **Audio Feedback** beep/buzz indicators to verify correct tag scanning.</li>
            <li>Click **Reconcile & Close** to commit counts, overwrite database levels, and log adjustment details.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">10. Handling Customer Returns & Restocking</h3>
          <p className="text-xs text-slate-655 leading-relaxed">
            If a package is returned (Return to Origin) or returned by a customer:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-700 pl-2 space-y-1.5">
            <li>Go to the **Logistics Returns** tab.</li>
            <li>Scan the returned package's **AWB barcode**.</li>
            <li>Select the destination warehouse node to restock the return.</li>
            <li>Submit the RMA to increment the catalog stock levels and update the Shopify status automatically.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">11. Direct Razorpay Settlements, Refunds & Zero Balance SOP</h3>
          <p className="text-xs text-slate-655 leading-relaxed">
            Manage customer payment collections, Razorpay refunds, and zero-balance fallback options:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-700 pl-2 space-y-1.5">
            <li><strong>Direct Payouts</strong>: 100% of customer order payments flow directly into your own configured Razorpay merchant bank account (`Company.razorpayKeyId`). Seyon Shopping holds 0% funds.</li>
            <li><strong>Triggering Refunds</strong>: In <strong>Orders &rarr; View Order</strong>, click <strong>Initiate Return / Refund</strong>. The system calls your Razorpay API key to issue an immediate gateway refund.</li>

            <li><strong>Handling Zero / Insufficient Razorpay Balance</strong>: If Razorpay rejects a refund due to insufficient merchant balance, select from 3 instant resolution options:
              <ul className="list-disc list-inside pl-4 pt-1 text-[11px] text-slate-600 space-y-1">
                <li><strong>Store Credit / Loyalty Wallet (Recommended)</strong>: Issues an instant store credit code to the customer's phone number (keeps revenue inside your brand).</li>
                <li><strong>Queued Gateway Refund</strong>: Retries Razorpay refund automatically as soon as new customer orders credit your balance.</li>
                <li><strong>Manual IMPS / UPI Transfer</strong>: Input the customer's UPI ID (`customer@upi`) for direct bank transfer and log the reference code.</li>
              </ul>
            </li>
            <li><strong>GST Credit Note Auto-Filing</strong>: The system automatically generates a GSTR-1 Credit Note to reduce your monthly tax liability and exports the entry to Tally Prime.</li>
          </ol>
        </div>
      )
    },

    {
      id: "intro",
      title: "Introduction to SEYON Operations",
      category: "Getting Started",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Introduction to SEYON</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Welcome to the <strong>SEYON Operations Portal</strong>, the centralized control center for managing your D2C clothing brand's logistics and fulfillment. This system connects your active Shopify store with real-time warehouse scanning, stock movements, and courier partner dispatch.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">How Seyon Shopping Empowers Your Business</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Seyon Shopping brings your online store, physical retail POS counters, and central warehouse inventory into one single dashboard. Stock updates instantly across Shopify, Amazon, and Flipkart with 0% platform transaction fees.
          </p>

          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg">
            <h4 className="text-sm font-bold text-indigo-950">Quick Start Checklist for Store Managers</h4>
            <ul className="list-disc list-inside text-xs text-indigo-800 mt-2 space-y-1">
              <li>Select your active <strong>Warehouse Location</strong> from the top bar selector.</li>
              <li>Verify that your <strong>Marketplace & Storefront Sync</strong> status reads "Connected".</li>
              <li>Plug in standard USB barcode scanners into your billing terminal.</li>
            </ul>
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-6">Product Lifecycle Navigation Flow</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The ERP sidebar menu is structured chronologically according to the physical life cycle of products entering inventory through to customer delivery:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-700 pl-2 space-y-2 mt-2">
            <li><strong>1. Inbound & Procurement</strong>: Suppliers (1.1), Purchase Orders (1.2), Barcode Generation (1.3), Inward Receiving (1.4).</li>
            <li><strong>2. Inventory & Warehouse</strong>: Stock Inventory (2.1), Floor Audits (2.2), Audit Logs (2.3), COGS Analytics (2.4).</li>
            <li><strong>3. Sales & Dispatch</strong>: Orders Directory (3.1), Outward Dispatch (3.2), Discounts & Coupons (3.3).</li>
            <li><strong>4. Logistics & Delivery</strong>: Shipping & Manifests (4.1), GST & E-Way Bill Filing (4.2).</li>
            <li><strong>5. Customer Management (CRM)</strong>: Customer Directory (5.1), Abandoned Cart Recalls (5.2), WhatsApp Broadcasts (5.3), Social & Ads Leads (5.4).</li>
            <li><strong>6. Administration & Store Settings</strong>: Staff Profiles & Roles (6.1), Store Configurations & Razorpay (6.2).</li>
          </ul>

          <h3 className="text-base font-bold text-slate-900 mt-6">Staff Access Roles</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every staff member gets a tailored workspace based on their job role:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-xs text-indigo-900 block">STORE OWNER / ADMIN</span>
              <span className="text-[11px] text-slate-500 block mt-1">Full control over store settings, payment gateways, GST reports, and staff management.</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-xs text-emerald-800 block">WAREHOUSE MANAGER</span>
              <span className="text-[11px] text-slate-500 block mt-1">Manages purchase orders, vendor invoices, stock audits, barcode printing, and CRM.</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-xs text-slate-800 block">BILLING & DISPATCH OPERATOR</span>
              <span className="text-[11px] text-slate-500 block mt-1">Floor execution: barcode scanning, inward stock check-in, order picking, and shipping.</span>
            </div>
          </div>

        </div>
      )
    },
    {
      id: "addon-packs-overview",
      title: "5 Modular A La Carte Add-On Packs Guide",
      category: "Modular Add-On Packs",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">5 Modular "A La Carte" Add-On Packs Guide</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Seyon Shopping features 5 optional modular add-on packs. Merchants on Micro or Starter plans can activate individual packs a la carte as needed, while Growth & Enterprise plans include pre-bundled packs out-of-the-box.
          </p>

          {/* Pack 1 */}
          <div className="border border-blue-200 bg-blue-50/50 p-5 rounded-2xl space-y-2">
            <h3 className="text-base font-bold text-blue-900 flex items-center gap-2">
              🌐 Pack 1: Storefront, Custom Domain & SEO (₹499 / mo)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enables online e-commerce selling under your own brand identity:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-2">
              <li><strong>Custom Domain Mapping</strong>: Connect `yourbrand.in` with automated SSL certificate generation.</li>
              <li><strong>White-Label Footer Removal</strong>: Hides platform references for clean merchant branding.</li>
              <li><strong>Dynamic SEO Suite</strong>: Auto-generated `sitemap.xml`, `robots.txt`, schema markup, and metadata.</li>
              <li><strong>WhatsApp OpenGraph Share Cards</strong>: Generates high-converting rich product preview cards when sharing links on WhatsApp.</li>
            </ul>
          </div>

          {/* Pack 2 */}
          <div className="border border-amber-200 bg-amber-50/50 p-5 rounded-2xl space-y-2">
            <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
              🔄 Pack 2: Omnichannel Marketplace Sync (₹699 / mo)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect external sales channels for centralized inventory control:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-2">
              <li><strong>Multi-Channel Stock Pooling</strong>: Auto-syncs warehouse inventory across Shopify, Amazon, Flipkart, & Myntra.</li>
              <li><strong>Order Consolidation</strong>: Pulls orders from all marketplaces into a single unified dispatch queue.</li>
              <li><strong>Overselling Protection</strong>: Instantly depletes stock across all channels within sub-50ms of sale.</li>
            </ul>
          </div>

          {/* Pack 3 */}
          <div className="border border-emerald-200 bg-emerald-50/50 p-5 rounded-2xl space-y-2">
            <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2">
              📜 Pack 3: Indian GST Engine & Tally Export (₹299 / mo)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Native Indian tax compliance and accounting synchronization:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-2">
              <li><strong>Place of Supply Auto-Matching</strong>: Calculates CGST+SGST (In-State) vs IGST (Interstate) based on customer PIN code.</li>
              <li><strong>GSTR-1 Reports</strong>: Exports ready-to-file GSTR-1 B2B & B2C CSV spreadsheets for your accountant.</li>
              <li><strong>Tally Prime Integration</strong>: Generates 1-click Tally XML vouchers for seamless sales & return entry imports.</li>
            </ul>
          </div>

          {/* Pack 4 */}
          <div className="border border-indigo-200 bg-indigo-50/50 p-5 rounded-2xl space-y-2">
            <h3 className="text-base font-bold text-indigo-900 flex items-center gap-2">
              🏢 Pack 4: B2B Wholesale & TDS Compliance (₹499 / mo)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enterprise B2B billing and tax deduction compliance:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-2">
              <li><strong>TDS Tax Withholding</strong>: Handles Section 194C / 194Q TDS deductions and Section 206C(1H) TCS collections.</li>
              <li><strong>B2B Credit Limits</strong>: Set wholesale customer credit accounts, net-30 payment terms, and purchase ledger tracking.</li>
            </ul>
          </div>

          {/* Pack 5 */}
          <div className="border border-purple-200 bg-purple-50/50 p-5 rounded-2xl space-y-2">
            <h3 className="text-base font-bold text-purple-900 flex items-center gap-2">
              💬 Pack 5: WhatsApp & AI Marketing Engine (₹599 / mo)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated customer recovery and marketing broadcast targeting:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-2">
              <li><strong>Abandoned Cart Recovery</strong>: Sends automated WhatsApp recovery messages with 1-click checkout links.</li>
              <li><strong>Segment Targeting</strong>: AI customer segmentation for repeat purchases and promotional broadcasts.</li>
              <li><strong>Meta Lead Ads Sync</strong>: Auto-imports lead forms from Facebook and Instagram ads directly into CRM.</li>
            </ul>
          </div>
        </div>
      )
    },

    {
      id: "barcodes",
      title: "Print & Generate Barcodes",
      category: "Inventory & Barcodes",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Barcode Generation & Printing</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Every product variant has a unique barcode identifier. Barcodes must be printed and attached to garments before scanning them into stock.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">Step-by-Step Generation Workflow</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2.5 mt-2">
            <li>Go to the <strong>Barcode Operations</strong> page from the sidebar menu.</li>
            <li>Select the target garment SKU or variant from the active catalog directory. Use the search input to filter by name, size, or color.</li>
            <li>Input the number of labels you want to create in the quantity input field.</li>
            <li>Select the **Code Type** (1D Barcode or 2D QR Code).</li>
            <li>Click <strong>Generate Barcode Image</strong>. The portal will generate standard barcode labels containing the SKU and variant details.</li>
            <li>Click <strong>Add to Queue</strong> to compile multiple items. Once ready, click **Print Queue** to output labels.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">Label Presets & Dimensions</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform supports three standard layouts for thermal printer output:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 pl-4 list-disc">
            <li><strong>Standard (2" x 2")</strong>: Ideal for hangtags. Displays variant description, price, SKU, and large code.</li>
            <li><strong>Compact (1.5" x 1.5")</strong>: Used for packaging bags or small labels.</li>
            <li><strong>Micro (1" x 1")</strong>: Restricted layout containing only SKU or Shopify numeric ID, suitable for jewelry or accessory tags.</li>
          </ul>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-amber-950">Thermal Printer Calibration</h4>
            <p className="text-xs text-amber-800 mt-1">
              For best scanning results, calibrate your thermal printer to standard label sizes (e.g. Zebra or TSC) to ensure barcodes don't bleed off the edges. Always test-scan one barcode from the first printed batch before printing high-volume queues.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "inward-outward",
      title: "Stock Inwarding & Outwarding",
      category: "Inventory & Barcodes",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Stock Inward & Outward</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Use the **Inward/Outward** scanning page to register stock changes as physical items arrive or leave the warehouse shelves.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">Fulfillment Ledger Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <h3 className="font-bold text-xs text-slate-950 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Inward Scan (Receiving)
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Scan production batches arriving from suppliers to add them to your active warehouse stock. This logs an `INWARD` stock movement and updates total catalog levels.
              </p>
              <ul className="text-[10px] text-slate-500 list-disc list-inside space-y-1">
                <li>Increases catalog stock levels.</li>
                <li>Triggers immediate sync update to Shopify (if bridge is active).</li>
                <li>Associates stock directly with selected warehouse node.</li>
              </ul>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <h3 className="font-bold text-xs text-slate-950 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span> Outward Scan (Adjustments)
              </h3>
              <p className="text-[11px] text-slate-660 leading-relaxed">
                Scan items to manually deduct inventory for sample dispatch, store displays, or writing off damaged garments. Logs an `OUTWARD` stock movement.
              </p>
              <ul className="text-[10px] text-slate-500 list-disc list-inside space-y-1">
                <li>Decreases catalog stock levels.</li>
                <li>Logs inventory adjustments reasons in the stock movements ledger.</li>
                <li>Applies real-time decrements on the public storefront.</li>
              </ul>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-6">Performing Scans</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 mt-2">
            <li>Select the correct **Active Scanning Node** (Warehouse).</li>
            <li>Set the **Mode Toggle** to either Inward or Outward.</li>
            <li>Place your cursor in the scan field. Begin scanning tags. The queue list will update automatically.</li>
            <li>Review the quantities. Click **Commit Batch Queue** to write changes to the database.</li>
          </ol>
        </div>
      )
    },
    {
      id: "stock-transfers",
      title: "Inter-Warehouse Stock Transfers",
      category: "Inventory & Barcodes",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Inter-Warehouse Stock Transfers</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Seyon ERP allows you to coordinate, dispatch, and track physical inventory movements between different warehouse locations.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">Transfer Lifecycle States</h3>
          <div className="space-y-3.5 text-xs text-slate-700 mt-2">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-amber-700 block">1. PENDING</span>
              <span className="text-[11px] text-slate-500 block mt-1">
                The transfer request is created. Stock remains at the source warehouse until dispatched.
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-indigo-700 block">2. SENT (Shipped)</span>
              <span className="text-[11px] text-slate-500 block mt-1">
                The source warehouse operator clicks **Ship**. The system immediately deducts the quantity from the source warehouse stock and logs an `OUTWARD` stock movement.
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-emerald-700 block">3. COMPLETED (Received)</span>
              <span className="text-[11px] text-slate-500 block mt-1">
                The destination warehouse operator clicks **Receive** upon arrival. The system adds the quantity to the destination warehouse stock and logs an `INWARD` stock movement, finalizing the cycle.
              </span>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-6">How to Initiate a Transfer</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 mt-2">
            <li>Open the **Order Fulfillment Board** page.</li>
            <li>Scroll down to the **Inter-Warehouse Communications (Transfers Feed)** card.</li>
            <li>Select your source location, target destination, desired variant SKU, and the transfer quantity.</li>
            <li>Click **Initiate Transfer**. The request is now logged and will appear in the transfers list.</li>
          </ol>
        </div>
      )
    },
    {
      id: "auditing",
      title: "Inventory Auditing (Cycle Count)",
      category: "Inventory & Barcodes",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Inventory Auditing & Cycle Counts</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Run periodic audits to reconcile physical stock with digital numbers. The audit dashboard tracks discrepancies automatically.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">Audit Reconciliation Table</h3>
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-xs text-slate-600 border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  <th className="px-3 py-2 text-left">Audit Field</th>
                  <th className="px-3 py-2 text-left">Formula / Definition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-900">Expected Stock</td>
                  <td className="px-3 py-2">The current database count recorded for the variant.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-900">Actual Scanned</td>
                  <td className="px-3 py-2 text-indigo-700 font-semibold">The number of tags physically scanned on shelves during this audit session.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-900">Discrepancy</td>
                  <td className="px-3 py-2">The delta (Scanned - Expected). Highlights mismatch errors requiring reconciliation.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-900">Shrinkage Value</td>
                  <td className="px-3 py-2">Net value difference of the missing stock calculated against unit cost prices.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-6">Reconciliation & Committing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Once a cycle count is complete:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 pl-4 list-disc">
            <li>Click **Save Draft** to store current counts if you need to pause or switch shifts. Counts are recovered from local browser storage automatically.</li>
            <li>Click **Reconcile & Close** to finalize the audit. This overrides database quantities with scanned counts and logs physical adjustments.</li>
          </ul>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-indigo-950">Audio Feedback Integration</h4>
            <p className="text-xs text-indigo-800 mt-1">
              Keep the audio feedback toggle active to get auditory verification as you scan. A high-frequency beep indicates a valid tag match; a low warning buzz alerts you that the scanned SKU does not belong to this audit segment.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "orders",
      title: "Processing Shopify Orders",
      category: "Orders & Logistics",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Fulfilling Shopify Orders</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Incoming orders synchronize automatically from Shopify via webhooks. Floor staff can pack and fulfill orders directly.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">Fulfillment Workflow States</h3>
          <ul className="list-disc list-inside text-xs text-slate-700 space-y-2 mt-2">
            <li><strong>Processing</strong>: Order imported and waiting to be packed. Items must be picked from warehouse shelving.</li>
            <li><strong>Barcode Matching</strong>: Picked item tags are scanned against the order's line-items directory to prevent packing errors.</li>
            <li><strong>Fulfill Action</strong>: Enter parcel dimensions (L x W x H) and weight. The logistics portal calls API providers to assign tracking AWBs.</li>
            <li><strong>Shipped</strong>: Print shipping labels, stick them to packages, and transfer them to the dispatch bay. Shopify is automatically updated with tracking details.</li>
          </ul>

          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-emerald-950">Real-Time Ingestion</h4>
            <p className="text-xs text-emerald-800 mt-1">
              Thanks to direct-database listeners, order creations require zero webhook processing delays. You can trigger simulated Shopify orders from the dashboard directory header to validate courier routing.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "manifests",
      title: "Courier Handovers & Manifests",
      category: "Orders & Logistics",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Shipping Manifests & Courier Handovers</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            A shipping manifest must be printed and signed by the courier driver before any package leaves the warehouse premises.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">How to Create & Dispatch Manifests</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2.5 mt-2">
            <li>Go to the **Logistics** panel in the sidebar.</li>
            <li>Click **Create Manifest**. Select the courier partner (e.g. Bluedart, Delhivery) and enter driver details (name, vehicle number, phone).</li>
            <li>Assign packed packages (filter by courier partner) to the manifest list.</li>
            <li>Print the manifest handover sheet. The driver signs this paper document as proof of custody.</li>
            <li>Commit the manifest to close the dispatch queue.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">Return Merchandise Authorization (RMA)</h3>
          <p className="text-xs text-slate-650 leading-relaxed">
            When packages are returned as RTO (Return to Origin), scan the AWB in the Logistics Returns tab. This updates the package status, moves items back to inventory, and registers adjustments.
          </p>
        </div>
      )
    },
    {
      id: "branding-setup",
      title: "Tenant & Brand Styling Setup",
      category: "Brand Customization & Storefront Channels",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Tenant & Brand Styling Setup</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Seyon provides a **generic customizable branding engine** for SaaS tenants. You can control the visual experience of your back-office and your public storefront down to the pixel.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">How to Configure Brand Styles</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 mt-2">
            <li>Log in as a **Superadmin** or **Tenantadmin** operator.</li>
            <li>Go to the **Companies** panel under the dashboard directory.</li>
            <li>Select the target **Company profile** to configure tenant-wide storefront styling defaults.</li>
            <li>To configure brand-specific theme profiles, go to the **Brands** tab.</li>
            <li>Use the styling inputs to modify:
              <ul className="list-disc list-inside text-[11px] text-slate-500 pl-4 mt-1 space-y-1">
                <li><strong>Primary Color</strong>: The main color used for primary CTA buttons, links, search outlines, and active status indicators.</li>
                <li><strong>Accent Color</strong>: Accent highlights, ratings, and special visual callouts.</li>
                <li><strong>Border Radius</strong>: Border corner curves (`0.375rem`, `0.5rem`, `0.625rem` etc.).</li>
                <li><strong>Logo URL</strong>: High-resolution brand logo image displayed in storefront headers.</li>
              </ul>
            </li>
            <li>Alternatively, use the **JSON Theme Configurator** for advanced variable mapping.</li>
          </ol>

          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-indigo-950">Dynamic Contrast Calculations</h4>
            <p className="text-xs text-indigo-800 mt-1">
              The platform automatically calculates contrast values. If you input a dark primary color (e.g. Navy Blue or Black), the engine assigns a light text foreground (`#ffffff`) for CTA buttons. If you input a light color, it resolves a dark foreground text color to maintain perfect accessibility scores.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "storefront-channels",
      title: "Storefront Sales Channels",
      category: "Brand Customization & Storefront Channels",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Public Storefront Sales Channels</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            The customer-facing digital sales channel is separated into dedicated fast-loading routes designed to optimize buyer conversion.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">Active Sales Channel Routes</h3>
          <div className="space-y-4 text-xs text-slate-700 mt-2">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-slate-900 block">1. Catalog Landing Page (`/`)</span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Displays active brand selections, products grid, multi-dimensional search/filter queries, and dynamically loads company logo headers.
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-slate-900 block">2. Product Details (`/products/[id]`)</span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Features detailed specifications, sizing and color selection grids, user review stars, and a **zip-code courier speed checker** that queries local courier speeds in real-time.
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-slate-900 block">3. Shopping Cart (`/cart`)</span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Enables users to adjust quantities, override variant size/color selections, review pricing totals, and proceed directly to checkout.
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-slate-900 block">4. Checkout Flow (`/checkout`)</span>
              <span className="text-[11px] text-slate-500 block mt-1">
                A secure checkout flow that collects contact details, computes delivery prices dynamically based on pin code distance metrics, supports COD or Card options, and ingests orders directly via webhook into the Seyon ERP registry.
              </span>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-6">Recommended Accessories (Upsell Widgets)</h3>
          <p className="text-xs text-slate-650 leading-relaxed">
            To drive higher Average Order Value (AOV), the checkout sidebar contains an **Add Accessories** block. Operators can view demo accessory recommendations (e.g. Card Holders or Wool Socks) that customers can add with one click. The sidebar automatically updates subtotal values and GST charges dynamically.
          </p>
        </div>
      )
    },
    {
      id: "tweakcn-themes",
      title: "Importing TweakCN Custom Themes",
      category: "Brand Customization & Storefront Channels",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Importing TweakCN Themes</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Seyon features out-of-the-box support for visual styling themes generated using the popular **TweakCN** shadcn/ui visual editor.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">Importing Theme Configs</h3>
          <p className="text-xs text-slate-650 leading-relaxed">
            To apply custom stylesheets exported from TweakCN:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-700 space-y-2 mt-2">
            <li>Export the theme custom properties block from tweakcn.com.</li>
            <li>Convert the bare HSL layout values into normal color properties by wrapping them in the `hsl()` helper syntax (e.g., `hsl(222.2 47.4% 11.2%)`).</li>
            <li>Paste them directly into storefront or erp-admin `theme.css` files.</li>
          </ul>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4 font-sans">
            <h4 className="text-sm font-bold text-amber-950">Active Layout Customizers</h4>
            <p className="text-xs text-amber-800 mt-1">
              Currently, both storefront and ERP-admin codebases are fully initialized with the **Je1lo** theme style parameters exported from the TweakCN community database (`cmozeqk6p000404la4exx0xe0`).
            </p>
          </div>
        </div>
      )
    },
    {
      id: "payment-gateways",
      title: "Indian Payment Gateways Integration",
      category: "Brand Customization & Storefront Channels",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Indian Payment Gateways Integration</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Seyon is engineered to support Indian digital transaction networks. During checkout, buyers can select payment options mapped directly to popular processing systems.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">Supported Payment Options in India</h3>
          <p className="text-xs text-slate-650 leading-relaxed">
            Operators can link and process transactions using several leading gateway aggregators:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-700 space-y-2.5 mt-2">
            <li><strong>Razorpay</strong>: Best overall platform support in India. Supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Netbanking across 50+ banks, and PayLater services.</li>
            <li><strong>Cashfree Payments</strong>: Features fast payouts, high-speed UPI links, and automated COD verification tools.</li>
            <li><strong>Instamojo</strong>: Ideal for startups and small-scale operations with immediate checkout onboarding support.</li>
            <li><strong>Paytm Payment Gateway</strong>: Native integration with the Paytm wallet and UPI routing infrastructure.</li>
            <li><strong>CCAvenue</strong>: Legacy enterprise processor supporting a vast array of regional banking options.</li>
          </ul>

          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-emerald-950">Cash On Delivery (COD) Routing</h4>
            <p className="text-xs text-emerald-800 mt-1">
              For demo safety and order verification, COD orders are flagged with a `-COD` suffix and processed through a simulated risk verification ledger before automatic ingestion into active warehouse queues.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "shopify-setup",
      title: "Shopify API & Credentials Setup Guide",
      category: "Brand Customization & Storefront Channels",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Shopify Custom App & API Credentials Guide</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Follow this guide to generate and connect your custom Shopify Admin API credentials for real-time catalog syncing, inventory updates, and order ingestion.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">Step 1: Create a Custom App in Shopify</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2">
            <li>Log into your <strong>Shopify Store Admin</strong> (`https://your-store.myshopify.com/admin`).</li>
            <li>Go to <strong>Settings &rarr; Apps and sales channels</strong>.</li>
            <li>Click <strong>Develop apps</strong>, then click <strong>Create an app</strong>.</li>
            <li>Name your app (e.g. <code>FabricVault ERP Sync</code>) and select your Developer Account.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">Step 2: Configure Admin API Access Scopes</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Under <strong>Configuration &rarr; Admin API integration</strong>, enable the following required access scopes:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1 font-mono text-indigo-900">
            <div>• read_products, write_products</div>
            <div>• read_inventory, write_inventory</div>
            <div>• read_orders, write_orders</div>
            <div>• read_customers</div>
            <div>• read_fulfillments, write_fulfillments</div>
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-6">Step 3: Copy Access Token & Credentials</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2">
            <li>Click <strong>Install app</strong> at the top right of the Shopify Custom App screen.</li>
            <li>Copy the generated <strong>Admin API access token</strong> (starts with <code>shpat_</code>). <em>Note: This token is displayed only once in Shopify.</em></li>
            <li>Copy your <strong>API secret key</strong> (used for webhook HMAC validation).</li>
            <li>Note down your store's internal domain name ending in <code>.myshopify.com</code> (e.g. <code>wolfcabin.myshopify.com</code>).</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">Step 4: Save & Handshake in FabricVault ERP</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2">
            <li>Go to <strong>Dashboard Settings &rarr; Shopify Integration</strong> in FabricVault ERP.</li>
            <li>Paste your <strong>Store Domain URL</strong>, <strong>Admin API Access Token</strong>, and <strong>Webhook API Secret Key</strong>.</li>
            <li>Click <strong>Connect & Initiate Handshake</strong>. The system will perform an automated handshake test and display <code>Bridge Connected</code>.</li>
          </ol>

          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-indigo-950">Catalog & Pricing Sync Operational Notes</h4>
            <p className="text-xs text-indigo-900 mt-1 space-y-1">
              <span>Once connected, products pulled from Shopify populate your active database variants table with automated field mappings:</span>
              <span className="block">• <strong>Brand / Vendor Sync</strong>: <code>prod.vendor</code> from Shopify maps automatically to <code>ProductVariant.brand</code> for multi-brand tags.</span>
              <span className="block">• <strong>Compare-at Price (Discount)</strong>: <code>variant.compare_at_price</code> maps to <code>ProductVariant.compareAtPrice</code> to power storefront strikethrough badges.</span>
              <span className="block">• <strong>Cost Price & Profit Margins</strong>: <code>inventory_item.cost</code> is ingested into <code>ProductVariant.costPrice</code> for ERP margin analytics.</span>
            </p>
          </div>

          <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-lg mt-3">
            <h4 className="text-sm font-bold text-emerald-950">Oversell Protection & Stock Auto-Sync Guarantees</h4>
            <p className="text-xs text-emerald-900 mt-1 space-y-1.5 leading-relaxed">
              <span className="block"><strong>What happens if an operator forgets to press "Push to Shopify"?</strong></span>
              <span className="block">• <strong>Automated Realtime Syncing</strong>: Stock counts automatically reconcile in the background when POs arrive or stock is adjusted. Manual push is only an optional force override.</span>
              <span className="block">• <strong>Shopify Native Oversell Guard</strong>: When stock reaches 0, Shopify automatically disables "Add to Cart" and blocks payment processing.</span>
              <span className="block">• <strong>Safety Stock Reserve</strong>: FabricVault ERP maintains a safety stock buffer (e.g. 5 units) preventing simultaneous checkout traffic overselling.</span>
            </p>
          </div>

          <div className="bg-slate-100 border-l-4 border-slate-700 p-4 rounded-r-lg mt-3">
            <h4 className="text-sm font-bold text-slate-950">100% Non-Destructive Data Protection & Zero Deletion Guarantee</h4>
            <p className="text-xs text-slate-700 mt-1 space-y-1.5 leading-relaxed">
              <span className="block"><strong>Will syncing or pushing stock ever delete or ruin anything in Shopify?</strong></span>
              <span className="block">• <strong>Zero Deletion API Policy</strong>: The FabricVault ERP integration algorithm <strong>never executes HTTP DELETE requests</strong> against your Shopify store.</span>
              <span className="block">• <strong>Untouched Store Config</strong>: Your existing Shopify store themes, collections, liquid templates, blog posts, and customer data remain 100% untouched.</span>
              <span className="block">• <strong>Safe Upsert Only</strong>: Inventory synchronization strictly updates inventory quantities (`inventory_level`) or creates missing product SKUs.</span>
            </p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-lg mt-3">
            <h4 className="text-sm font-bold text-purple-950">Client-Side LocalStorage & Realtime Session Syncing</h4>
            <p className="text-xs text-purple-900 mt-1 space-y-1.5 leading-relaxed">
              <span className="block"><strong>How does FabricVault ERP utilize browser LocalStorage?</strong></span>
              <span className="block">• <strong>Session & Tenant Caching</strong>: Key configuration records (e.g. <code>seyon:company</code>, <code>activeWarehouseId</code>, <code>seyon:user</code>) are cached in browser <code>localStorage</code> to guarantee instant page renders without waiting for network pings.</span>
              <span className="block">• <strong>Realtime Storage Events</strong>: When tenant credentials or Shopify URLs are updated in <strong>Settings</strong>, the app fires a custom <code>window.dispatchEvent(new Event("storage"))</code> event.</span>
              <span className="block">• <strong>Instant UI updates</strong>: The global navigation sidebar listens for storage events to immediately display dynamic links like <strong>Shopify Admin</strong> and active brand titles without requiring a manual page refresh.</span>
            </p>
          </div>
        </div>
      )
    },
    {
      id: "multi-tenant-storefront",
      title: "Storefront Multi-Tenant Channel Setup",
      category: "Brand Customization & Storefront Channels",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Storefront Sales Channel Options</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Seyon Storefront allows you to run multiple brand channels or standalone tenant stores while keeping catalogs, orders, and pricing completely isolated.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">How Your Storefront URL Is Delivered</h3>
          <div className="space-y-3 text-xs text-slate-700 mt-2">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <span className="font-bold text-indigo-950 block">1. Dedicated Tenant Link (Default)</span>
              <span className="text-[11px] text-slate-600 block mt-1">
                Your company is assigned a unique storefront link containing your company code. You can copy this link anytime under <strong>Settings → Sales Channels</strong>.
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <span className="font-bold text-indigo-950 block">2. Custom Brand Subdomain</span>
              <span className="text-[11px] text-slate-600 block mt-1">
                Run your storefront under your own brand subdomain (e.g. <code>brand.yourdomain.com</code>). Contact your platform administrator to link your DNS records.
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <span className="font-bold text-indigo-950 block">3. Custom White-Label Domain</span>
              <span className="text-[11px] text-slate-600 block mt-1">
                Connect a fully custom domain (e.g. <code>www.yourbrand.com</code>) to deliver a seamless shopping experience for your buyers.
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-amber-950">Quick Launch Link</h4>
            <p className="text-xs text-amber-800 mt-1">
              Navigate to <strong>Settings → Sales Channels</strong> to test or launch your active storefront channel in one click.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "coupon-guide",
      title: "Creating Coupons & Discount Codes",
      category: "Brand Customization & Storefront Channels",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Creating Coupons & Promo Codes</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Boost store sales and reward your shoppers by launching discount codes for your online store and checkout counters.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">How to Create a Coupon Code (Simple Steps)</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 mt-2">
            <li>Go to <strong>CRM & Marketing &rarr; Coupons & Promo Codes</strong> tab in your dashboard.</li>
            <li>Click <strong>+ Create Coupon Code</strong>.</li>
            <li>Type your code name (e.g. <code>WELCOME10</code> or <code>FESTIVE500</code>).</li>
            <li>Choose your discount type:
              <ul className="list-disc list-inside text-[11px] text-slate-600 pl-4 mt-1 space-y-1">
                <li><strong>Percentage (%)</strong>: Offers a percent discount (e.g. 10% OFF up to ₹500).</li>
                <li><strong>Flat Amount (₹)</strong>: Offers a fixed cash discount (e.g. Flat ₹200 OFF).</li>
              </ul>
            </li>
            <li>(Optional) Set a <strong>Minimum Order Amount</strong> (e.g. Only valid on orders above ₹1,000).</li>
            <li>Click <strong>Create Coupon</strong>. Your customers can now enter this code on the checkout page to receive their discount!</li>
          </ol>

          <div className="bg-teal-50 border-l-4 border-teal-600 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-teal-950">💡 Automatic Usage Counter & Seyon Sync</h4>
            <p className="text-xs text-teal-900 mt-1">
              Every time a customer uses your coupon code during checkout or POS billing, your dashboard automatically updates the usage count. If you connect your Shopify store, discount codes created on Shopify sync automatically with your Seyon Shopping orders directory.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "crm-operations",
      title: "CRM Customer Intelligence & WhatsApp Recalls",
      category: "Operating SOPs",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Customer Management & WhatsApp Marketing SOP</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Seyon Shopping includes a built-in Customer Relationship Management (CRM) suite to track buyer Lifetime Value (LTV), recover abandoned storefront checkouts, and launch WhatsApp campaigns.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">1. Customer Directory & Auto-Segmentation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The CRM engine automatically compiles buyer profiles from both online storefront orders and POS counter sales:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 mt-2">
            <li><strong>VIP Tier</strong>: Automatically tags buyers with LTV ≥ ₹6,000 or 3+ completed orders.</li>
            <li><strong>Repeat Buyers</strong>: Flags buyers who have placed more than 1 order.</li>
            <li><strong>New Customers</strong>: First-time shoppers tagged for onboarding welcome offers.</li>
          </ul>

          <h3 className="text-base font-bold text-slate-900 mt-6">2. Abandoned Checkout Recovery via WhatsApp</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 mt-2">
            <li>Go to <strong>Customer Management (CRM) → Abandoned Cart Recalls</strong>.</li>
            <li>Review pending cart items and customer phone numbers.</li>
            <li>Click <strong>Send Recovery WhatsApp</strong> to transmit an automated recall template containing direct checkout links.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">3. Storefront Campaign Banners & Themes</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Switch your storefront visual theme without writing code under <strong>CRM → Banners & Themes</strong>:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 mt-2">
            <li><strong>🔥 Big Billion Day Theme</strong>: Amber Gold mesh marquee banner featuring 50% strike-through discount badges.</li>
            <li><strong>⚡ Wednesday Midnight Blitz</strong>: Electric Cyan/Blue banner for 10 PM - 2 AM flash sales.</li>
            <li><strong>✨ Festive Mega Sale</strong>: Deep Violet/Rose theme for Diwali and holiday festival promotions.</li>
          </ul>

          <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-purple-950">Multi-Tenant Data Privacy Guarantee</h4>
            <p className="text-xs text-purple-900 mt-1">
              Customer profiles, LTV stats, and phone numbers are strictly isolated per company using PostgreSQL Row Level Security (RLS). No other tenant can access your customer contacts.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "gst-tax-engine",
      title: "GST Billing, Tax Engine & Tally/GSTR-1 Export",
      category: "Orders & Logistics",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">GST Tax Calculation & Tally/GSTR-1 Export Guide</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Seyon Shopping includes a Indian GST Tax Engine that calculates CGST, SGST, and IGST for B2C & B2B orders and generates instant exports for GSTR-1 filing and Tally Prime accounting software.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">1. How Intra-State vs. Inter-State GST Works</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tax rates are calculated based on your merchant warehouse state vs. customer delivery state:
          </p>
          <div className="space-y-3 text-xs text-slate-700 mt-2">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <span className="font-bold text-emerald-950 block">• Intra-State (Same State) → CGST + SGST</span>
              <span className="text-[11px] text-slate-600 block mt-1">
                If warehouse and customer are in the same state (e.g. Gujarat to Gujarat), a 5% GST rate splits equally into <strong>2.5% CGST</strong> + <strong>2.5% SGST</strong>.
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <span className="font-bold text-indigo-950 block">• Inter-State (Different State) → IGST</span>
              <span className="text-[11px] text-slate-600 block mt-1">
                If customer is in another state (e.g. Gujarat to Maharashtra), the full <strong>5% IGST</strong> rate applies.
              </span>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-6">2. B2B Checkout & Input Tax Credit (ITC)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Wholesale buyers can check **"Add Business GSTIN for B2B Tax Credit"** during checkout. The system records their 15-digit GSTIN, legal business name, and generates a valid B2B tax invoice.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">3. Exporting GSTR-1 CSV & Tally Prime XML</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 mt-2">
            <li>Go to <strong>Logistics & Delivery → GST & Tally Export</strong> (`/dashboard/reports/gst`).</li>
            <li>Select the date range or billing month.</li>
            <li>Click <strong>Export GSTR-1 CSV</strong> to download a portal-ready CSV formatted for government GST offline tool upload.</li>
            <li>Click <strong>Export Tally XML</strong> to generate XML vouchers ready for 1-click import into Tally Prime / Tally.ERP 9.</li>
          </ol>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-amber-950">E-Way Bill Threshold Warning</h4>
            <p className="text-xs text-amber-900 mt-1">
              Inter-state consignments with order invoice value exceeding ₹50,000 automatically flag an E-Way Bill requirement badge in your Outward Dispatch queue.
            </p>
          </div>
        </div>
      )
    },


    {
      id: "store-categories-guide",
      title: "Store Categories & Custom Displays",
      category: "Brand Customization & Storefront Channels",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Organizing Store Categories</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Organize your catalog into easy-to-browse categories so shoppers can find their favorite products in seconds.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">Built-in Store Category Presets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-bold text-slate-900 text-xs block">👗 Apparel & Dresses</span>
              <span className="text-[11px] text-slate-600 block mt-1">Displays size selector chips (`S`, `M`, `L`, `XL`) and fabric care details.</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-bold text-slate-900 text-xs block">💄 Cosmetics & Beauty</span>
              <span className="text-[11px] text-slate-600 block mt-1">Highlights `🌿 100% Organic` and `🧪 Dermatologically Tested` safety badges.</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-bold text-slate-900 text-xs block">👶 Baby & Kids Products</span>
              <span className="text-[11px] text-slate-600 block mt-1">Highlights `👶 Hypoallergenic` and `🛡️ BPA-Free` badges for parents.</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-bold text-slate-900 text-xs block">💎 Jewelry & Accessories</span>
              <span className="text-[11px] text-slate-600 block mt-1">Displays `✨ Anti-Tarnish` and `💎 1-Year Warranty` guarantees.</span>
            </div>
          </div>

          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-indigo-950">🛍️ Understanding Stores vs Brands vs Categories</h4>
            <p className="text-xs text-indigo-900 mt-1 space-y-1">
              <span className="block">• <strong>Store Outlet / Channel</strong>: The website where your customer shops (e.g. <i>Seyon Beauty Store</i> or <i>Seyon Fashion Store</i>). Controls store logo & theme colors.</span>
              <span className="block">• <strong>Manufacturer / Label Brand</strong>: Who manufactured the product (e.g. <i>L'Oréal</i>, <i>MAC</i>, <i>Nike</i>, <i>Zara</i>).</span>
              <span className="block">• <strong>Category</strong>: What kind of product it is (e.g. <i>Cosmetics</i>, <i>Dresses</i>, <i>Baby Products</i>).</span>
            </p>
          </div>
        </div>
      )
    },
    {
      id: "marketplace-sync-guide",
      title: "Marketplace Sync (Shopify, Amazon, Flipkart)",
      category: "Brand Customization & Storefront Channels",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Omnichannel Marketplace Integration Guide</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Seyon Shopping connects your central warehouse inventory directly with external sales channels including <strong>Shopify, Amazon India (SP-API), Flipkart Seller Hub, and Myntra</strong> to prevent overselling and automate order fulfillments.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">1. Connecting Marketplace Channels</h3>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2 mt-2">
            <li>Go to <strong>Sales & Dispatch → Marketplace Sync</strong> (`/dashboard/marketplaces`).</li>
            <li>Click <strong>Connect Channel</strong> on your target platform (e.g., Shopify, Amazon, or Flipkart).</li>
            <li>Input your Store Name, Seller ID, and API Access Credentials.</li>
            <li>Click <strong>Save Connection</strong>. The system status will update to <span className="text-emerald-700 font-bold">CONNECTED</span>.</li>
          </ol>

          <h3 className="text-base font-bold text-slate-900 mt-6">2. Automated Stock & Order Normalization</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            When orders arrive from external marketplaces, Seyon Shopping automatically normalizes shipping addresses, customer contacts, GSTIN tax details, and Place of Supply (PoS) strings into your central <strong>Orders Directory</strong> (`/dashboard/orders`).
          </p>

          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-indigo-950">Real-Time Stock Reservation</h4>
            <p className="text-xs text-indigo-900 mt-1">
              Whenever an order is placed on any channel or billed at a physical POS counter, central stock levels decrement across all connected marketplaces instantly.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "tds-tax-withholding",
      title: "Tax Withholding (TDS & TCS) Compliance",
      category: "Orders & Logistics",
      content: (
        <div className="space-y-6">
          <h1 className="text-2xl font-black text-slate-900 border-b pb-2 tracking-tight">Indian Tax Withholding (TDS & TCS) Guide</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            For B2B wholesalers and textile manufacturers, Seyon Shopping includes a Tax Withholding module to deduct Statutory TDS on purchase orders and collect TCS on high-value sales.
          </p>

          <h3 className="text-base font-bold text-slate-900 mt-6">Supported Income Tax Sections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs">
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-bold text-slate-900 block">• Section 194C (Contractors / Processing)</span>
              <span className="text-[11px] text-slate-600 block mt-1">1% (Individual) or 2% (Company) TDS on job-work & processing orders.</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-bold text-slate-900 block">• Section 194Q (Purchase of Goods &gt; ₹50L)</span>
              <span className="text-[11px] text-slate-600 block mt-1">0.1% TDS on cumulative vendor purchases exceeding ₹50 Lakhs in a financial year.</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <span className="font-bold text-slate-900 block">• Section 206C(1H) (TCS on Sales &gt; ₹50L)</span>
              <span className="text-[11px] text-slate-600 block mt-1">0.1% Tax Collected at Source on high-value buyer sales receipts.</span>
            </div>
          </div>
        </div>
      )
    }
  ];


  // Helper to construct the Table of Contents Tree
  const categories = Array.from(new Set(topics.map(t => t.category)));

  const toggleFolder = (cat: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTopic = topics.find(t => t.id === activeTopicId) || topics[0];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg select-none">
      {/* CHM Help Header Toolbar */}
      <div className="h-14 bg-slate-100 border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors mr-1 flex items-center justify-center border border-slate-300 bg-white shadow-xs cursor-pointer"
            title={sidebarCollapsed ? "Expand Navigation Tree" : "Collapse Navigation Tree"}
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-extrabold text-sm text-slate-900">Operations Guide Help System</h2>
            <p className="text-[10px] text-slate-500 font-mono">v1.2.0-userhelp</p>
          </div>
        </div>
        
        {/* Help Search Indexer */}
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search help topics (e.g. audit, labels)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-md py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: CHM Nested TOC Navigation Tree */}
        {!sidebarCollapsed && (
          <aside className="w-80 border-r border-slate-200 flex flex-col h-full bg-slate-50 overflow-y-auto transition-all duration-200">
            <div className="p-3 bg-slate-100/50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Table of Contents
            </div>
            
            <div className="p-2 space-y-1">
              {categories.map((cat) => {
                const catTopics = filteredTopics.filter(t => t.category === cat);
                if (catTopics.length === 0) return null;

                const isExpanded = expandedFolders[cat];

                return (
                  <div key={cat} className="space-y-0.5">
                    {/* Folder Folder */}
                    <button
                      onClick={() => toggleFolder(cat)}
                      className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-200/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        {isExpanded ? (
                          <FolderOpen className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Folder className="w-4 h-4 text-amber-500" />
                        )}
                        <span>{cat}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* Nested Folder Children Documents */}
                    {isExpanded && (
                      <div className="pl-6 space-y-0.5 border-l border-slate-200 ml-4 py-0.5">
                        {catTopics.map((topic) => {
                          const isActive = activeTopicId === topic.id;
                          return (
                            <button
                              key={topic.id}
                              onClick={() => setActiveTopicId(topic.id)}
                              className={`w-full flex items-center gap-2 p-1.5 rounded-md transition-colors text-left text-xs font-medium ${
                                isActive 
                                  ? "bg-indigo-50 text-indigo-700 font-bold" 
                                  : "text-slate-650 hover:bg-slate-200/55 hover:text-slate-900"
                              }`}
                            >
                              <FileText className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                              <span className="truncate">{topic.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredTopics.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching help topics found.
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Right Side: CHM Document Reading Pane */}
        <main className="flex-1 overflow-y-auto p-8 bg-white selection:bg-indigo-150">
          <div className="max-w-3xl mx-auto">
            {activeTopic.content}
          </div>
        </main>
      </div>

      {/* CHM Footer Status Bar */}
      <footer className="h-7 bg-slate-150 text-slate-600 border-t border-slate-250 flex items-center justify-between px-4 text-[9px] font-mono select-none flex-shrink-0">
        <div>
          Topic ID: <span className="font-bold text-slate-800">{activeTopic.id}</span>
        </div>
        <div>
          Category: <span className="font-bold text-slate-800">{activeTopic.category}</span>
        </div>
      </footer>
    </div>
  );
}
