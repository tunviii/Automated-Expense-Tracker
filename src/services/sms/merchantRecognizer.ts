import type { TransactionCategory } from '@/types/transaction';

export interface RecognizedMerchant {
  normalizedMerchant: string;
  category: TransactionCategory;
  confidence: number;
}

/**
 * 172+ Curated Indian Merchant Mappings
 * Extracted from merchant_mapping_v1.csv
 */
const MERCHANT_REGISTRY: Record<string, { name: string; category: TransactionCategory }> = {
  "SWIGGY": {
    "name": "swiggy",
    "category": "Food & Dining"
  },
  "ZOMATO": {
    "name": "zomato",
    "category": "Food & Dining"
  },
  "DOMINOS PIZZA": {
    "name": "dominos pizza",
    "category": "Food & Dining"
  },
  "MCDONALDS INDIA": {
    "name": "mcdonalds india",
    "category": "Food & Dining"
  },
  "KFC INDIA": {
    "name": "kfc india",
    "category": "Food & Dining"
  },
  "STARBUCKS COFFEE": {
    "name": "starbucks coffee",
    "category": "Food & Dining"
  },
  "PARADISE RESTAURANT": {
    "name": "paradise restaurant",
    "category": "Food & Dining"
  },
  "SUBWAY INDIA": {
    "name": "subway india",
    "category": "Food & Dining"
  },
  "CAFE COFFEE DAY": {
    "name": "cafe coffee day",
    "category": "Food & Dining"
  },
  "CHAI POINT": {
    "name": "chai point",
    "category": "Food & Dining"
  },
  "BAWARCHI RESTAURANT": {
    "name": "bawarchi restaurant",
    "category": "Food & Dining"
  },
  "PISTA HOUSE": {
    "name": "pista house",
    "category": "Food & Dining"
  },
  "KARACHI BAKERY": {
    "name": "karachi bakery",
    "category": "Food & Dining"
  },
  "CAFE NILOUFER": {
    "name": "cafe niloufer",
    "category": "Food & Dining"
  },
  "ABSOLUTE BARBECUES": {
    "name": "absolute barbecues",
    "category": "Food & Dining"
  },
  "BASKIN ROBBINS": {
    "name": "baskin robbins",
    "category": "Food & Dining"
  },
  "TACO BELL INDIA": {
    "name": "taco bell india",
    "category": "Food & Dining"
  },
  "BURGER KING INDIA": {
    "name": "burger king india",
    "category": "Food & Dining"
  },
  "HALDIRAMS": {
    "name": "haldirams",
    "category": "Food & Dining"
  },
  "DUNKIN DONUTS": {
    "name": "dunkin donuts",
    "category": "Food & Dining"
  },
  "BIGBASKET": {
    "name": "bigbasket",
    "category": "Groceries"
  },
  "DMART": {
    "name": "dmart",
    "category": "Groceries"
  },
  "ZEPTO MARKETPLACE": {
    "name": "zepto marketplace",
    "category": "Groceries"
  },
  "RELIANCE SMART": {
    "name": "reliance smart",
    "category": "Groceries"
  },
  "BLINKIT": {
    "name": "blinkit",
    "category": "Groceries"
  },
  "MORE SUPERMARKET": {
    "name": "more supermarket",
    "category": "Groceries"
  },
  "SPENCERS RETAIL": {
    "name": "spencers retail",
    "category": "Groceries"
  },
  "VIJETHA SUPERMARKET": {
    "name": "vijetha supermarket",
    "category": "Groceries"
  },
  "RATNADEEP SUPER MARKET": {
    "name": "ratnadeep super market",
    "category": "Groceries"
  },
  "NATURES BASKET": {
    "name": "natures basket",
    "category": "Groceries"
  },
  "RELIANCE FRESH": {
    "name": "reliance fresh",
    "category": "Groceries"
  },
  "STARQUICK GROCERY": {
    "name": "starquick grocery",
    "category": "Groceries"
  },
  "D MART READY": {
    "name": "d mart ready",
    "category": "Groceries"
  },
  "MILK BASKET": {
    "name": "milk basket",
    "category": "Groceries"
  },
  "FRESH TO HOME": {
    "name": "fresh to home",
    "category": "Groceries"
  },
  "UBER INDIA": {
    "name": "uber india",
    "category": "Transport"
  },
  "OLA CABS": {
    "name": "ola cabs",
    "category": "Transport"
  },
  "RAPIDO": {
    "name": "rapido",
    "category": "Transport"
  },
  "HYDERABAD METRO": {
    "name": "hyderabad metro",
    "category": "Transport"
  },
  "TSRTC": {
    "name": "tsrtc",
    "category": "Transport"
  },
  "INDIAN RAILWAYS": {
    "name": "indian railways",
    "category": "Transport"
  },
  "RED BUS": {
    "name": "red bus",
    "category": "Transport"
  },
  "METRO RIDE": {
    "name": "metro ride",
    "category": "Transport"
  },
  "INDIAN OIL PETROL PUMP": {
    "name": "indian oil petrol pump",
    "category": "Transport"
  },
  "HP PETROL PUMP": {
    "name": "hp petrol pump",
    "category": "Transport"
  },
  "BHARAT PETROLEUM": {
    "name": "bharat petroleum",
    "category": "Transport"
  },
  "IRCTC": {
    "name": "irctc",
    "category": "Travel"
  },
  "AMAZON INDIA": {
    "name": "amazon india",
    "category": "Shopping"
  },
  "FLIPKART": {
    "name": "flipkart",
    "category": "Shopping"
  },
  "MYNTRA": {
    "name": "myntra",
    "category": "Shopping"
  },
  "AJIO": {
    "name": "ajio",
    "category": "Shopping"
  },
  "NYKAA": {
    "name": "nykaa",
    "category": "Shopping"
  },
  "ZARA INDIA": {
    "name": "zara india",
    "category": "Shopping"
  },
  "H&M INDIA": {
    "name": "h&m india",
    "category": "Shopping"
  },
  "MEESHO": {
    "name": "meesho",
    "category": "Shopping"
  },
  "SAVANA": {
    "name": "savana",
    "category": "Shopping"
  },
  "TATA CLIQ": {
    "name": "tata cliq",
    "category": "Shopping"
  },
  "WESTSIDE": {
    "name": "westside",
    "category": "Shopping"
  },
  "LIFESTYLE": {
    "name": "lifestyle",
    "category": "Shopping"
  },
  "DECATHLON": {
    "name": "decathlon",
    "category": "Shopping"
  },
  "CROMA": {
    "name": "croma",
    "category": "Shopping"
  },
  "RELIANCE DIGITAL": {
    "name": "reliance digital",
    "category": "Shopping"
  },
  "PVR CINEMAS": {
    "name": "pvr cinemas",
    "category": "Entertainment"
  },
  "INOX": {
    "name": "inox",
    "category": "Entertainment"
  },
  "BOOKMYSHOW": {
    "name": "bookmyshow",
    "category": "Entertainment"
  },
  "NETFLIX": {
    "name": "netflix",
    "category": "Subscription"
  },
  "HOTSTAR": {
    "name": "hotstar",
    "category": "Entertainment"
  },
  "YOUTUBE PREMIUM": {
    "name": "youtube premium",
    "category": "Subscription"
  },
  "AMAZON PRIME VIDEO": {
    "name": "amazon prime video",
    "category": "Entertainment"
  },
  "SONYLIV": {
    "name": "sonyliv",
    "category": "Entertainment"
  },
  "JIOHOTSTAR": {
    "name": "jiohotstar",
    "category": "Entertainment"
  },
  "CINEPOLIS": {
    "name": "cinepolis",
    "category": "Entertainment"
  },
  "SPOTIFY INDIA": {
    "name": "spotify india",
    "category": "Subscription"
  },
  "GOOGLE ONE": {
    "name": "google one",
    "category": "Subscription"
  },
  "ADOBE": {
    "name": "adobe",
    "category": "Subscription"
  },
  "MICROSOFT 365": {
    "name": "microsoft 365",
    "category": "Subscription"
  },
  "NOTION": {
    "name": "notion",
    "category": "Subscription"
  },
  "AMAZON PRIME": {
    "name": "amazon prime",
    "category": "Subscription"
  },
  "APPLE SERVICES": {
    "name": "apple services",
    "category": "Subscription"
  },
  "DROPBOX": {
    "name": "dropbox",
    "category": "Subscription"
  },
  "UDEMY": {
    "name": "udemy",
    "category": "Education"
  },
  "COURSERA": {
    "name": "coursera",
    "category": "Education"
  },
  "SRI OM SARASWATHI STATIONERY": {
    "name": "sri om saraswathi stationery",
    "category": "Education"
  },
  "CROSSWORD BOOKSTORE": {
    "name": "crossword bookstore",
    "category": "Education"
  },
  "CAMPUS BOOK STORE": {
    "name": "campus book store",
    "category": "Education"
  },
  "LEETCODE PREMIUM": {
    "name": "leetcode premium",
    "category": "Education"
  },
  "GEEKSFORGEEKS": {
    "name": "geeksforgeeks",
    "category": "Education"
  },
  "UNACADEMY": {
    "name": "unacademy",
    "category": "Education"
  },
  "BYJUS": {
    "name": "byjus",
    "category": "Education"
  },
  "UPGRAD": {
    "name": "upgrad",
    "category": "Education"
  },
  "COACHING CENTER": {
    "name": "coaching center",
    "category": "Education"
  },
  "EXAM FEE PORTAL": {
    "name": "exam fee portal",
    "category": "Education"
  },
  "APOLLO PHARMACY": {
    "name": "apollo pharmacy",
    "category": "Healthcare"
  },
  "MEDPLUS": {
    "name": "medplus",
    "category": "Healthcare"
  },
  "CARE HOSPITAL": {
    "name": "care hospital",
    "category": "Healthcare"
  },
  "APOLLO HOSPITALS": {
    "name": "apollo hospitals",
    "category": "Healthcare"
  },
  "TATA 1MG": {
    "name": "tata 1mg",
    "category": "Healthcare"
  },
  "PRACTO": {
    "name": "practo",
    "category": "Healthcare"
  },
  "FORTIS HOSPITAL": {
    "name": "fortis hospital",
    "category": "Healthcare"
  },
  "YASHODA HOSPITALS": {
    "name": "yashoda hospitals",
    "category": "Healthcare"
  },
  "PHARMEASY": {
    "name": "pharmeasy",
    "category": "Healthcare"
  },
  "NETMEDS": {
    "name": "netmeds",
    "category": "Healthcare"
  },
  "DIAGNOSTIC LAB": {
    "name": "diagnostic lab",
    "category": "Healthcare"
  },
  "TSSPDCL": {
    "name": "tsspdcl",
    "category": "Bills & Utilities"
  },
  "ELECTRICITY BOARD": {
    "name": "electricity board",
    "category": "Bills & Utilities"
  },
  "JIO MOBILE": {
    "name": "jio mobile",
    "category": "Bills & Utilities"
  },
  "AIRTEL": {
    "name": "airtel",
    "category": "Bills & Utilities"
  },
  "ACT FIBERNET": {
    "name": "act fibernet",
    "category": "Bills & Utilities"
  },
  "HYDERABAD WATER BOARD": {
    "name": "hyderabad water board",
    "category": "Bills & Utilities"
  },
  "BSNL": {
    "name": "bsnl",
    "category": "Bills & Utilities"
  },
  "VODAFONE IDEA": {
    "name": "vodafone idea",
    "category": "Bills & Utilities"
  },
  "TATA POWER": {
    "name": "tata power",
    "category": "Bills & Utilities"
  },
  "GAS BILL PAYMENT": {
    "name": "gas bill payment",
    "category": "Bills & Utilities"
  },
  "BROADBAND BILL": {
    "name": "broadband bill",
    "category": "Bills & Utilities"
  },
  "DTH RECHARGE": {
    "name": "dth recharge",
    "category": "Bills & Utilities"
  },
  "MAKEMYTRIP": {
    "name": "makemytrip",
    "category": "Travel"
  },
  "GOIBIBO": {
    "name": "goibibo",
    "category": "Travel"
  },
  "INDIGO AIRLINES": {
    "name": "indigo airlines",
    "category": "Travel"
  },
  "AIR INDIA": {
    "name": "air india",
    "category": "Travel"
  },
  "OYO ROOMS": {
    "name": "oyo rooms",
    "category": "Travel"
  },
  "CLEARTRIP": {
    "name": "cleartrip",
    "category": "Travel"
  },
  "EASEMYTRIP": {
    "name": "easemytrip",
    "category": "Travel"
  },
  "VISTARA": {
    "name": "vistara",
    "category": "Travel"
  },
  "AKASA AIR": {
    "name": "akasa air",
    "category": "Travel"
  },
  "BOOKING.COM": {
    "name": "booking.com",
    "category": "Travel"
  },
  "LAKME SALON": {
    "name": "lakme salon",
    "category": "Personal Care"
  },
  "URBAN COMPANY": {
    "name": "urban company",
    "category": "Personal Care"
  },
  "NATURALS SALON": {
    "name": "naturals salon",
    "category": "Personal Care"
  },
  "ENRICH SALON": {
    "name": "enrich salon",
    "category": "Personal Care"
  },
  "JAWED HABIB": {
    "name": "jawed habib",
    "category": "Personal Care"
  },
  "VLCC": {
    "name": "vlcc",
    "category": "Personal Care"
  },
  "KAYA SKIN CLINIC": {
    "name": "kaya skin clinic",
    "category": "Personal Care"
  },
  "THE MAN COMPANY": {
    "name": "the man company",
    "category": "Personal Care"
  },
  "BOMBAY SHAVING COMPANY": {
    "name": "bombay shaving company",
    "category": "Personal Care"
  },
  "LANDLORD RENT": {
    "name": "landlord rent",
    "category": "Rent & Accommodation"
  },
  "HOSTEL RENT": {
    "name": "hostel rent",
    "category": "Rent & Accommodation"
  },
  "ABC APARTMENTS": {
    "name": "abc apartments",
    "category": "Rent & Accommodation"
  },
  "PG ACCOMMODATION": {
    "name": "pg accommodation",
    "category": "Rent & Accommodation"
  },
  "HOUSE RENT": {
    "name": "house rent",
    "category": "Rent & Accommodation"
  },
  "NESTAWAY": {
    "name": "nestaway",
    "category": "Rent & Accommodation"
  },
  "COLIVE": {
    "name": "colive",
    "category": "Rent & Accommodation"
  },
  "STANZA LIVING": {
    "name": "stanza living",
    "category": "Rent & Accommodation"
  },
  "B GOWTHAM": {
    "name": "b gowtham",
    "category": "Transfer"
  },
  "RAHUL KUMAR": {
    "name": "rahul kumar",
    "category": "Transfer"
  },
  "PRIYA SHARMA": {
    "name": "priya sharma",
    "category": "Transfer"
  },
  "SAI KIRAN": {
    "name": "sai kiran",
    "category": "Transfer"
  },
  "ANIL KUMAR": {
    "name": "anil kumar",
    "category": "Transfer"
  },
  "SNEHA REDDY": {
    "name": "sneha reddy",
    "category": "Transfer"
  },
  "ROHIT VERMA": {
    "name": "rohit verma",
    "category": "Transfer"
  },
  "KARTHIK": {
    "name": "karthik",
    "category": "Transfer"
  },
  "DIVYA": {
    "name": "divya",
    "category": "Transfer"
  },
  "ARJUN REDDY": {
    "name": "arjun reddy",
    "category": "Transfer"
  },
  "FAMILY MEMBER": {
    "name": "family member",
    "category": "Transfer"
  },
  "TEMPLE DONATION": {
    "name": "temple donation",
    "category": "Others"
  },
  "CHARITY PAYMENT": {
    "name": "charity payment",
    "category": "Others"
  },
  "PARKING FEE": {
    "name": "parking fee",
    "category": "Others"
  },
  "GOVERNMENT SERVICE": {
    "name": "government service",
    "category": "Others"
  },
  "PASSPORT FEE": {
    "name": "passport fee",
    "category": "Others"
  },
  "COURT FEE": {
    "name": "court fee",
    "category": "Others"
  },
  "MISCELLANEOUS SERVICE": {
    "name": "miscellaneous service",
    "category": "Others"
  },
  "UNKNOWN MERCHANT": {
    "name": "unknown merchant",
    "category": "Others"
  },
  "CLUB PAYMENT": {
    "name": "club payment",
    "category": "Others"
  },
  "EVENT REGISTRATION": {
    "name": "event registration",
    "category": "Others"
  },
  "ALEXS KITCHEN": {
    "name": "alexs kitchen",
    "category": "Food & Dining"
  },
  "MYNTRA DESIGNS PRIVATE": {
    "name": "myntra",
    "category": "Shopping"
  },
  "VIJETHA SUPER MARKETS PVT": {
    "name": "vijetha supermarket",
    "category": "Groceries"
  },
  "PURVI SRI HOSPITALITY SER": {
    "name": "purvi sri hospitality",
    "category": "Food & Dining"
  },
  "SPOTIFY INDIA PVT LTD": {
    "name": "spotify",
    "category": "Subscription"
  },
  "WWW SAVANA COM": {
    "name": "savanna",
    "category": "Shopping"
  },
  "VIJETHA SUPERMAR": {
    "name": "vijetha supermarket",
    "category": "Groceries"
  },
  "SRI OM SARASWATHI STATIONARY": {
    "name": "sri om saraswathi stationery",
    "category": "Education"
  },
  "ZEPTO MARKETPLA": {
    "name": "zepto",
    "category": "Groceries"
  }
};

/**
 * Normalizes raw merchant strings from SMS by removing banking noise,
 * legal suffixes (PVT LTD, PRIVATE LIMITED), domains, and punctuation.
 */
export function normalizeMerchantName(raw: string): string {
  let cleaned = raw
    .toUpperCase()
    .replace(/^([.*_\s]+)/, '')
    .replace(/([.*_\s]+)$/, '')
    .replace(/\b(PVT\.?\s*LTD\.?|PRIVATE\s+LIMITED|LIMITED|LTD\.?|INC\.?|LLP)\b/gi, '')
    .replace(/\b(WWW\.?|\.COM|\.IN|\.CO)\b/gi, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

/**
 * Matches a merchant name against known Indian merchant database.
 * Returns normalized merchant name, predicted category, and confidence score.
 */
export function recognizeMerchant(rawMerchant: string | null): RecognizedMerchant | null {
  if (!rawMerchant) return null;

  const normalized = normalizeMerchantName(rawMerchant);
  if (!normalized) return null;

  // 1. Exact match against registry key
  if (MERCHANT_REGISTRY[normalized]) {
    const match = MERCHANT_REGISTRY[normalized];
    return {
      normalizedMerchant: match.name,
      category: match.category,
      confidence: 1.0,
    };
  }

  // 2. Substring / Token matching
  for (const [key, value] of Object.entries(MERCHANT_REGISTRY)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        normalizedMerchant: value.name,
        category: value.category,
        confidence: 0.9,
      };
    }
  }

  return null;
}

/**
 * Searches the entire SMS body for known merchant names.
 * Very resilient when regex merchant extraction fails.
 */
export function recognizeFromFullText(smsText: string): RecognizedMerchant | null {
  if (!smsText) return null;
  const upper = smsText.toUpperCase();

  // Prefer longer merchant names first to avoid partial conflicts (e.g. "STARBUCKS COFFEE" before "STARBUCKS")
  const sortedEntries = Object.entries(MERCHANT_REGISTRY).sort(
    (a, b) => b[0].length - a[0].length,
  );

  for (const [key, value] of sortedEntries) {
    // Look for merchant as whole word or distinctive phrase
    const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(upper)) {
      return {
        normalizedMerchant: value.name,
        category: value.category,
        confidence: 0.95,
      };
    }
  }

  return null;
}
