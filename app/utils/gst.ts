export interface GstTaxBreakdown {
  taxableAmount: number;
  gstRate: number;
  totalTax: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxType: "INTRA_STATE" | "INTER_STATE";
  placeOfSupply: string;
}

/**
  * Standard State Name to GST State Code Mapping
  */
export const GST_STATE_CODES: Record<string, string> = {
  // 28 States
  "JAMMU AND KASHMIR": "01",
  "HIMACHAL PRADESH": "02",
  "PUNJAB": "03",
  "CHANDIGARH": "04",
  "UTTARAKHAND": "05",
  "HARYANA": "06",
  "DELHI": "07",
  "RAJASTHAN": "08",
  "UTTAR PRADESH": "09",
  "BIHAR": "10",
  "SIKKIM": "11",
  "ARUNACHAL PRADESH": "12",
  "NAGALAND": "13",
  "MANIPUR": "14",
  "MIZORAM": "15",
  "TRIPURA": "16",
  "MEGHALAYA": "17",
  "ASSAM": "18",
  "WEST BENGAL": "19",
  "JHARKHAND": "20",
  "ODISHA": "21",
  "CHHATTISGARH": "22",
  "MADHYA PRADESH": "23",
  "GUJARAT": "24",
  "DADRA AND NAGAR HAVELI AND DAMAN AND DIU": "26",
  "MAHARASHTRA": "27",
  "ANDHRA PRADESH": "37",
  "KARNATAKA": "29",
  "GOA": "30",
  "LAKSHADWEEP": "31",
  "KERALA": "32",
  "TAMIL NADU": "33",
  "PUDUCHERRY": "34",
  "ANDAMAN AND NICOBAR ISLANDS": "35",
  "TELANGANA": "36",
  "LADAKH": "38",
  "OTHER TERRITORY": "97"
};


/**
 * Validates 15-character Indian GSTIN format
 */
export function validateGSTIN(gstin: string): boolean {
  if (!gstin) return false;
  const cleaned = gstin.trim().toUpperCase();
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(cleaned);
}

/**
 * Normalizes Indian state names, codes, and common abbreviations (e.g. TN -> TAMIL NADU, MH -> MAHARASHTRA)
 */
export function normalizeStateName(stateInput?: string): string {
  if (!stateInput) return "TAMIL NADU";
  const cleaned = stateInput.trim().toUpperCase().replace(/[^A-Z\s]/g, "");

  // Common State Code / Abbreviation Mappings
  const abbrMap: Record<string, string> = {
    "TN": "TAMIL NADU",
    "TAMILNADU": "TAMIL NADU",
    "MH": "MAHARASHTRA",
    "KA": "KARNATAKA",
    "GJ": "GUJARAT",
    "DL": "DELHI",
    "UP": "UTTAR PRADESH",
    "WB": "WEST BENGAL",
    "KL": "KERALA",
    "AP": "ANDHRA PRADESH",
    "TS": "TELANGANA",
    "TELANGANA": "TELANGANA",
    "RJ": "RAJASTHAN",
    "HR": "HARYANA",
    "MP": "MADHYA PRADESH",
    "PB": "PUNJAB"
  };

  if (abbrMap[cleaned]) return abbrMap[cleaned];
  
  // Direct match in GST_STATE_CODES
  if (GST_STATE_CODES[cleaned]) return cleaned;

  // Substring search
  const found = Object.keys(GST_STATE_CODES).find(k => k.includes(cleaned) || cleaned.includes(k));
  return found || cleaned;
}

/**
 * Calculates GST Breakdown (CGST+SGST vs IGST)
 */
export function calculateGstBreakdown(params: {
  amount: number;
  gstRate?: number;
  merchantState?: string;
  shippingState?: string;
}): GstTaxBreakdown {
  const { amount, gstRate = 12, merchantState = "Tamil Nadu", shippingState = "Tamil Nadu" } = params;

  const cleanMerchantState = normalizeStateName(merchantState);
  const cleanShippingState = normalizeStateName(shippingState);

  const isIntraState = cleanMerchantState === cleanShippingState || !cleanShippingState;
  const taxType = isIntraState ? "INTRA_STATE" : "INTER_STATE";

  const stateCode = GST_STATE_CODES[cleanShippingState] || "33";
  const placeOfSupply = `${stateCode}-${cleanShippingState}`;


  // Inclusive GST formula: Taxable = Amount / (1 + (Rate / 100))
  const taxableAmount = parseFloat((amount / (1 + gstRate / 100)).toFixed(2));
  const totalTax = parseFloat((amount - taxableAmount).toFixed(2));

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isIntraState) {
    cgstAmount = parseFloat((totalTax / 2).toFixed(2));
    sgstAmount = parseFloat((totalTax - cgstAmount).toFixed(2));
  } else {
    igstAmount = totalTax;
  }

  return {
    taxableAmount,
    gstRate,
    totalTax,
    cgstAmount,
    sgstAmount,
    igstAmount,
    taxType,
    placeOfSupply
  };
}
