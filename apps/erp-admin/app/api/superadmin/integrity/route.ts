import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "../../../../lib/supabase";

export async function GET() {
  try {
    const TABLES_TO_CHECK = [
      "Company", "Warehouse", "User", "ProductVariant", 
      "WarehouseStock", "StockMovement", "OrderFulfillment", 
      "AbandonedCheckout", "StockTransfer", "PurchaseOrder", 
      "PurchaseOrderItem", "CourierConfig", "ShippingManifest", 
      "Subscription", "InventoryAudit", "InventoryAuditItem", 
      "SerializedUnit", "Vendor", "Brand"
    ];

    const integrityReport: any = {
      connection: "HEALTHY",
      checkedAt: new Date().toISOString(),
      tables: [],
      rlsStatus: [],
      orphans: []
    };

    // 1. Check Table Counts & schema
    for (const tableName of TABLES_TO_CHECK) {
      const { count, error } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true });

      if (error) {
        integrityReport.tables.push({
          name: tableName,
          status: "MISSING_OR_ERROR",
          error: error.message
        });
      } else {
        integrityReport.tables.push({
          name: tableName,
          status: "ACTIVE",
          rows: count || 0
        });
      }
    }

    // 2. Query Postgres System catalogs for Row Level Security (RLS) status
    // relrowsecurity is true if RLS is active on that table
    const rlsQuery = `
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      JOIN pg_class ON pg_class.relname = pg_tables.tablename 
      WHERE schemaname = 'public';
    `;
    
    try {
      const { data: rlsData, error: rlsErr } = await supabase.rpc("exec_sql", { sql_query: rlsQuery });
      if (!rlsErr && rlsData) {
        integrityReport.rlsStatus = rlsData;
      } else {
        // Fallback simulation: fetch config
        integrityReport.rlsStatus = TABLES_TO_CHECK.map(t => ({
          tablename: t,
          rowsecurity: false // Default to false if we cannot query pg_class
        }));
      }
    } catch (e) {
      integrityReport.rlsStatus = TABLES_TO_CHECK.map(t => ({
        tablename: t,
        rowsecurity: false
      }));
    }

    // 3. Orphan Check (Checking records referencing non-existent companies)
    const ORPHANED_RELATIONS = [
      { table: "Warehouse", field: "companyId" },
      { table: "User", field: "companyId" },
      { table: "ProductVariant", field: "companyId" },
      { table: "OrderFulfillment", field: "companyId" },
      { table: "StockMovement", field: "companyId" }
    ];

    for (const rel of ORPHANED_RELATIONS) {
      try {
        // Find if any rows exist where companyId is not in Company(id)
        const { data: orphansFound, error: orphanErr } = await supabase
          .from(rel.table)
          .select("id")
          .not("companyId", "in", supabase.from("Company").select("id")); // Note: nested queries not fully supported in standard REST, so we fetch Company IDs first

        const { data: companies } = await supabase.from("Company").select("id");
        const companyIds = (companies || []).map((c: any) => c.id);

        if (companyIds.length > 0) {
          const { count } = await supabase
            .from(rel.table)
            .select("id", { count: "exact", head: true })
            .not("companyId", "in", `(${companyIds.join(",")})`);
          
          integrityReport.orphans.push({
            table: rel.table,
            field: rel.field,
            orphanedCount: count || 0
          });
        } else {
          // If no companies exist, any records are orphans
          const { count } = await supabase
            .from(rel.table)
            .select("id", { count: "exact", head: true });
          
          integrityReport.orphans.push({
            table: rel.table,
            field: rel.field,
            orphanedCount: count || 0
          });
        }
      } catch (err) {
        integrityReport.orphans.push({
          table: rel.table,
          field: rel.field,
          status: "CHECK_FAILED"
        });
      }
    }

    return NextResponse.json({
      success: true,
      report: integrityReport
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to compile database integrity report.",
        error: error.message || error
      },
      { status: 500 }
    );
  }
}
