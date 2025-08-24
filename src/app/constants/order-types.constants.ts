

export const ORDER_TYPES = {
  // Job Listing Packages
  SME_LISTING: '1',           // SME Listing
  STANDARD_LISTING: '1',      // Standard Listing  
  PREMIUM_LISTING: '11',      // Premium Listing
  PREMIUM_PLUS: '11',         // Premium Plus
  HOT_JOB: '2',               // Hot Job
  
  // CV/Talent Search Packages
  BULK_CV: '3',               // Bulk CV/Talent Search
  RESUME_ON_DEMAND: '6',      // Resume on Demand
  
  // Bulk Subscription Packages
  BULK_STANDARD: '4',         // Bulk Standard Listing & Talent Search
  BULK_PREMIUM: '4',          // Bulk Premium Listing & Talent Search
  BULK_PREMIUM_PLUS: '4',     // Bulk Premium Plus & Talent Search
  BULK_CUSTOMIZED: '4',       // Bulk Customized
  
  // Pay as you go
  PNPL: '1'                    // Pay as you go
} as const;

export type OrderType = typeof ORDER_TYPES[keyof typeof ORDER_TYPES];

/**
 * Package to Order Type Mapping
 */
export const PACKAGE_ORDER_TYPE_MAPPING: Record<string, OrderType> = {
  'sme-listing': ORDER_TYPES.SME_LISTING,
  'standard-listing': ORDER_TYPES.STANDARD_LISTING,
  'premium-listing': ORDER_TYPES.PREMIUM_LISTING,
  'premium-plus': ORDER_TYPES.PREMIUM_PLUS,
  'hot-job': ORDER_TYPES.HOT_JOB,
  'pnpl': ORDER_TYPES.PNPL,
  'bulk-cv': ORDER_TYPES.BULK_CV,
  'resume-on-demand': ORDER_TYPES.RESUME_ON_DEMAND,
  'bulk-standard': ORDER_TYPES.BULK_STANDARD,
  'bulk-premium': ORDER_TYPES.BULK_PREMIUM,
  'bulk-premium-plus': ORDER_TYPES.BULK_PREMIUM_PLUS,
  'bulk-customized': ORDER_TYPES.BULK_CUSTOMIZED
};

/**
 * Order Type Labels for Display
 * Note: Multiple packages can share the same order type
 */
export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  '1': 'SME/Standard Listing/PNPL',      // Combined label for type 1
  '2': 'Hot Job',
  '3': 'Bulk CV/Talent Search',
  '4': 'Bulk Subscription',
  '6': 'Resume on Demand',
  '11': 'Premium Listing'                 // Combined label for type 11
};
