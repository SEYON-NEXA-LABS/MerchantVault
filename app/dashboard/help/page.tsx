"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  FolderOpen, 
  HelpCircle,
  Package,
  QrCode,
  Truck,
  CreditCard,
  UserCheck
} from "lucide-react";

// Structure representing topics in our help system
interface HelpTopic {
  id: string;
  title: string;
  category: string;
  icon?: any;
  content: React.ReactNode;
}

interface TOCNode {
  title: string;
  isFolder: boolean;
  children?: TOCNode[];
  topicId?: string;
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "Getting Started": true,
    "Inventory & Barcodes": true,
    "Orders & Shipments": false,
    "Platform Billing": false
  });
  const [activeTopicId, setActiveTopicId] = useState("intro");

  // Help topic content dictionary
  const topics: HelpTopic[] = [
    {
      id: "intro",
      title: "Introduction to SEYON CRM + ERP",
      category: "Getting Started",
      content: (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Introduction to SEYON</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Welcome to the <strong>SEYON Operations Portal</strong>, a centralized multi-tenant CRM + ERP system designed specifically for D2C clothing brands. SEYON integrates inventory, order processing, barcode scanning, logistics partners, and tenant management into a single, high-fidelity user interface.
          </p>
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
            <h4 className="text-sm font-bold text-indigo-950">Quick Tip</h4>
            <p className="text-xs text-indigo-750 mt-1">
              You can toggle your simulated user role (Superadmin, Tenant Admin, Staff Operator) in the top-right header selector to explore various operational views and permissions.
            </p>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-6">Core Modules</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-all bg-white">
              <span className="font-bold text-sm text-slate-950 block">📦 Inventory & Barcodes</span>
              <span className="text-xs text-slate-500">Scan barcodes to inward new production stock, manage transfers, and run active floor audits.</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-all bg-white">
              <span className="font-bold text-sm text-slate-950 block">🚚 Orders & Logistics</span>
              <span className="text-xs text-slate-500">Track incoming Shopify orders, assign courier partners, generate manifest numbers, and ship packages.</span>
            </div>
          </ul>
        </div>
      )
    },
    {
      id: "roles",
      title: "Platform Roles & Permissions",
      category: "Getting Started",
      content: (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Roles & Access Control</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            SEYON implements a role-based access control (RBAC) hierarchy to ensure secure data access and appropriate interfaces for different warehouse and business roles:
          </p>
          <div className="space-y-3 mt-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-xs font-extrabold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded mr-2">Platform Superadmin</span>
              <p className="text-xs text-slate-600 mt-1.5">
                Responsible for platform-wide operations: managing company onboarding, bootstrapping default warehouse locations, creating default company admins, and configuring billing tiers (Free Trial, Monthly, Yearly, One-time Setup + AMC).
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-xs font-extrabold uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded mr-2">Tenant Admin</span>
              <p className="text-xs text-slate-600 mt-1.5">
                The manager for a specific brand (tenant). Has access to all company-level settings, Shopify synchronization logs, staff management, warehouse configurations, and order reviews.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-xs font-extrabold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded mr-2">Staff Operator</span>
              <p className="text-xs text-slate-600 mt-1.5">
                Floor staff operators responsible for day-to-day operations: printing barcode tags, matching inward shipments, outwarding packages, running audits, and handing manifests over to drivers.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "barcodes",
      title: "Print & Generate Barcodes",
      category: "Inventory & Barcodes",
      content: (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Barcode Generation & Printing</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Every product variant in your SEYON portal has a unique barcode identifier. Barcodes must be printed and attached to garments before scanning them into stock.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-4">Step-by-Step Instructions</h3>
          <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2 mt-2">
            <li>Navigate to the <strong>Print & Generate</strong> tab under Barcode Operations.</li>
            <li>Select your active product or variant from the list.</li>
            <li>Enter the quantity of tags you wish to generate.</li>
            <li>Click <strong>Generate Barcode Image</strong>. The system will encode the barcode string and render a downloadable PNG barcode label.</li>
            <li>Click <strong>Print Labels</strong> to send the generated PDF to your local thermal barcode printer.</li>
          </ol>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-amber-950">Important Requirement</h4>
            <p className="text-xs text-amber-750 mt-1">
              Ensure that your barcode printer is calibrated to the correct size (e.g. 50mm x 25mm labels) to avoid cropped barcodes that cannot be scanned by laser barcode scanners.
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
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Stock Inward & Outward</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            The <strong>Inward & Outward</strong> portal is where you log inventory modifications on the warehouse floor.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-950 flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Stock Inward (Production/Restock)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan barcode tags of incoming crates from factories. Inwarding increases the inventory count of that SKU inside your selected warehouse location and creates an `INWARD` stock movement.
              </p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-950 flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span> Stock Outward (Dispatches/Damage)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan barcodes to manually deduct stock (for offline sales, corporate samples, or writing off damaged units). Outwarding decreases the inventory count of that SKU and logs an `OUTWARD` movement.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "auditing",
      title: "Inventory Auditing (Cycle Count)",
      category: "Inventory & Barcodes",
      content: (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Inventory Auditing & Reconciliation</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            The **Inventory Auditing** module enables periodic verification of physical warehouse stock. It highlights discrepancies and generates adjusting movements to maintain absolute catalog integrity.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-4">Audit Columns Explained</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-slate-600 border border-slate-250 divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  <th className="px-3 py-2 text-left">Column Name</th>
                  <th className="px-3 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-900">Expected Stock</td>
                  <td className="px-3 py-2">The digital quantity of units the database currently records on shelves.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-900">Ready to Dispatch</td>
                  <td className="px-3 py-2">Units currently allocated/staging for active pending customer orders (in `PROCESSING` state).</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-900">Returned (RTO)</td>
                  <td className="px-3 py-2">Units returned by customers that have arrived back but are not yet added back to shelf inventory.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-900">In-Transit</td>
                  <td className="px-3 py-2">Units currently traveling between warehouse locations on active Stock Transfers.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-900">Incoming PO</td>
                  <td className="px-3 py-2">Ordered units purchased from factory suppliers that are still waiting to arrive.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-900">Actual Scanned</td>
                  <td className="px-3 py-2 font-bold text-indigo-700">The physical number of units verified on the shelf by the auditor's barcode scan.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-bold text-slate-900">Discrepancy</td>
                  <td className="px-3 py-2">Calculated mismatch difference (Scanned Quantity - Expected Quantity). Highlights in orange/red if non-zero.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-emerald-950">Audio Feedback & Recovery</h4>
            <p className="text-xs text-emerald-750 mt-1">
              Enable the <strong>Audio Beep Feedback</strong> toggle on the scanning dashboard to get audio status warnings (beep sound on valid match, warning buzz on unknown SKU). Active counts are continuously saved to local storage so you never lose progress if the device refreshes.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "orders",
      title: "Processing Shopify Orders",
      category: "Orders & Shipments",
      content: (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Shopify Orders Directory</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Orders are automatically synchronized from your Shopify store into SEYON via Webhooks.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-4">Fulfillment Workflow</h3>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1.5 mt-2">
            <li><strong>Step 1</strong>: View orders in the <strong>Orders Directory</strong>. Orders show a `PROCESSING` status upon import.</li>
            <li><strong>Step 2</strong>: Pack items and enter dimensions. Click <strong>Fulfill Order</strong>.</li>
            <li><strong>Step 3</strong>: The system communicates with the configured courier partner (e.g. Delhivery, Shiprocket) to retrieve an AWB tracking number.</li>
            <li><strong>Step 4</strong>: Print the shipping label with the barcode and attach it to the package. The order status advances to `SHIPPED`.</li>
          </ul>
        </div>
      )
    },
    {
      id: "manifests",
      title: "Logistics & Manifests",
      category: "Orders & Shipments",
      content: (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Manifests & Handover</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Before courier drivers leave the warehouse, you must generate a <strong>Shipping Manifest</strong>. This document details all packages loaded onto a single vehicle.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-4">Manifest Process</h3>
          <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2 mt-2">
            <li>Go to the <strong>Logistics & Returns</strong> section.</li>
            <li>Click <strong>Generate New Manifest</strong>. Select the courier partner (e.g., Delhivery) and enter driver details (Name and Phone).</li>
            <li>Scan/add unmanifested shipped packages to this manifest.</li>
            <li>Print the manifest sheet. The driver signs the printed manifest as proof of receipt.</li>
            <li>Click <strong>Hand Over Manifest</strong> in the portal to update delivery statuses for all packed items to `SHIPPED` inside Shopify.</li>
          </ol>
        </div>
      )
    },
    {
      id: "subscriptions",
      title: "Subscription Tiers & AMC",
      category: "Platform Billing",
      content: (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Subscription & Pricing Mechanics</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Platform billing configurations support multiple business tiers. The billing scheme is managed globally by the Superadmin:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="font-bold text-xs text-indigo-700 uppercase block">Free Trial</span>
              <p className="text-xs text-slate-500 mt-1">Allows unlimited scans and orders for 14 days, expiring automatically unless upgraded.</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="font-bold text-xs text-indigo-700 uppercase block">Monthly / Yearly Plan</span>
              <p className="text-xs text-slate-500 mt-1">Flat rate billing with cycles completing exactly 30 days or 365 days from the active start date.</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="font-bold text-xs text-indigo-700 uppercase block">One-time Setup + AMC</span>
              <p className="text-xs text-slate-500 mt-1">Combines an initial license setup fee with an annual maintenance charge (AMC) billed annually.</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="font-bold text-xs text-indigo-700 uppercase block">Pay-per-order / Enterprise</span>
              <p className="text-xs text-slate-500 mt-1">Flexible pay-as-you-go fees based on transaction volume, or custom high-capacity enterprise service level agreements (SLAs).</p>
            </div>
          </div>
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-indigo-950">Renewal Adjustments</h4>
            <p className="text-xs text-indigo-750 mt-1">
              Superadmins can click <strong>Reset Renewal from Today</strong> on any company profile, which shifts the upcoming billing date from the current moment based on their active billing tier interval.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "onboarding",
      title: "Onboarding & Password Resets",
      category: "Platform Billing",
      content: (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Manual Tenant Onboarding</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            New companies are manually provisioned by the Superadmin on the Platform Control Center.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-4">Onboarding Flow</h3>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1.5 mt-2">
            <li>The Superadmin enters the Company Name and unique code (e.g. `vtex`).</li>
            <li>The system generates an initial Admin User account with username `admin` and default password `password123`.</li>
            <li>A default warehouse is bootstrapped (e.g., `vtex MUMBAI WH`) to ensure the tenant is ready to scan products immediately.</li>
          </ul>
          <h3 className="text-base font-bold text-slate-900 mt-6">Password Reset Policies</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            Because SEYON operates on a local, secure sandbox model, no external mail servers are integrated. Password recovery is handled hierarchically:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1.5 mt-2">
            <li>The **Superadmin** can reset the password of any Tenant Admin from the Superadmin dashboard directory.</li>
            <li>A **Tenant Admin** can reset passwords for staff operators inside the company settings panel.</li>
          </ul>
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
          <BookOpen className="w-5 h-5 text-slate-600" />
          <div>
            <h2 className="font-extrabold text-sm text-slate-900">SEYON Compiled HTML Help System</h2>
            <p className="text-[10px] text-slate-500 font-mono">v1.2.0-winhelp</p>
          </div>
        </div>
        
        {/* Help Search Indexer */}
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search help index (e.g. audit, RTO)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-md py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: CHM Nested TOC Navigation Tree */}
        <aside className="w-80 border-r border-slate-200 flex flex-col h-full bg-slate-50 overflow-y-auto">
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
                  {/* Folder Header */}
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
