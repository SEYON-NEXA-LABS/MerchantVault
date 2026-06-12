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
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "Getting Started": true,
    "Inventory & Barcodes": true,
    "Orders & Logistics": true
  });
  const [activeTopicId, setActiveTopicId] = useState("intro");

  // Help topic content dictionary
  const topics: HelpTopic[] = [
    {
      id: "intro",
      title: "Introduction to SEYON Operations",
      category: "Getting Started",
      content: (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Introduction to SEYON</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Welcome to the <strong>SEYON Operations Portal</strong>, the centralized control center for managing your D2C clothing brand's logistics and fulfillment. This system connects your active Shopify store with real-time warehouse scanning, stock movements, and courier partner dispatch.
          </p>
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
            <h4 className="text-sm font-bold text-indigo-950">Quick Start</h4>
            <p className="text-xs text-indigo-750 mt-1">
              Select your active **Warehouse Location** from the footer selector. All scanning and stock records will be automatically tied to the selected warehouse terminal.
            </p>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-6">Primary Workflows</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="border border-slate-200 rounded-lg p-3 bg-white">
              <span className="font-bold text-sm text-slate-950 block">📦 Barcode Scanning</span>
              <span className="text-xs text-slate-500">Generate tags, inward new production batches, manage inter-warehouse transfers, and run shelf audits.</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-white">
              <span className="font-bold text-sm text-slate-950 block">🚚 Shopify Dispatch</span>
              <span className="text-xs text-slate-500">Review pending orders, print shipping labels with automatically assigned tracking numbers, and build courier manifests.</span>
            </div>
          </ul>
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
            Every product variant has a unique barcode identifier. Barcodes must be printed and attached to garments before scanning them into stock.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-4">Generating Labels</h3>
          <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2 mt-2">
            <li>Go to the <strong>Barcode Operations</strong> page from the sidebar menu.</li>
            <li>Select the target garment SKU or variant from the active catalog directory.</li>
            <li>Input the number of labels you want to create in the quantity input field.</li>
            <li>Click <strong>Generate Barcode Image</strong>. The portal will generate standard barcode labels containing the SKU and variant details.</li>
            <li>Use the **Print** dialog to output labels to your local thermal label printer.</li>
          </ol>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
            <h4 className="text-sm font-bold text-amber-950">Printer Calibration Tip</h4>
            <p className="text-xs text-amber-750 mt-1">
              For best scanning results, calibrate your thermal printer to standard `50mm x 25mm` barcode label sizes to ensure barcodes don't bleed off the edges.
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
            Use the **Inward/Outward** scanning page to register stock changes as physical items arrive or leave the warehouse shelves.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-950 flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Inward Scan (Receiving)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan production batches arriving from suppliers to add them to your active warehouse stock. This logs an `INWARD` stock movement and updates total catalog levels.
              </p>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-950 flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span> Outward Scan (Adjustments)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan items to manually deduct inventory for sample dispatch, store displays, or writing off damaged garments. Logs an `OUTWARD` stock movement.
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
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Inventory Auditing & Cycle Counts</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Run periodic audits to reconcile physical stock with digital numbers. The audit dashboard tracks discrepancies automatically:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-slate-600 border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  <th className="px-3 py-2 text-left">Audit Field</th>
                  <th className="px-3 py-2 text-left">Description</th>
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
              </tbody>
            </table>
          </div>
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg mt-2">
            <h4 className="text-sm font-bold text-indigo-950">Audio Scans</h4>
            <p className="text-xs text-indigo-750 mt-1">
              Keep the audio feedback toggle active to get auditory verification as you scan (success beep vs. invalid warning tone) to speed up floor operations.
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
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Fulfilling Shopify Orders</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            Incoming orders synchronize automatically from Shopify via webhooks. Floor staff can pack and fulfill orders directly:
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-4">Order Status Path</h3>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1.5 mt-2">
            <li><strong>Processing</strong>: Order imported and waiting to be packed.</li>
            <li><strong>Fulfill Action</strong>: Enter parcel dimensions and weight to automatically fetch courier routing from Delhivery or Shiprocket.</li>
            <li><strong>Shipped</strong>: Once the AWB label is generated and printed, attach it to the box. The status moves to `SHIPPED` and updates the customer on Shopify.</li>
          </ul>
        </div>
      )
    },
    {
      id: "manifests",
      title: "Courier Handovers & Manifests",
      category: "Orders & Logistics",
      content: (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-2">Shipping Manifests</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            A shipping manifest must be printed and signed by the courier driver before any package leaves the warehouse premises.
          </p>
          <h3 className="text-base font-bold text-slate-900 mt-4">How to create a manifest:</h3>
          <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2 mt-2">
            <li>Go to the **Logistics** panel in the sidebar.</li>
            <li>Click **Create Manifest**. Select the courier partner (e.g. Bluedart, Delhivery) and enter driver details.</li>
            <li>Assign packed packages to the manifest.</li>
            <li>Print the manifest handover sheet. The driver signs this paper document as proof of custody.</li>
          </ol>
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
