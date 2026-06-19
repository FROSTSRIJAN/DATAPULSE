/**
 * Config-Driven Scoring Weights
 * Allows tuning data trust and business readiness formulas without changing code.
 */

export const SCORING_WEIGHTS = {
  trustScore: {
    completeness: 0.30,      // weight for completeness (non-null value %)
    validity: 0.25,          // weight for validity (passing validation checks %)
    uniqueness: 0.20,        // weight for uniqueness (non-duplicate records %)
    consistency: 0.15,       // weight for consistency (matching expected formats %)
    schemaConfidence: 0.10,  // weight for dataset type detection confidence
  },
  businessReadiness: {
    dataQuality: 0.25,         // overall clean row ratio
    contactCompleteness: 0.20, // presence of vital email/phone data
    uniqueness: 0.20,          // uniqueness score
    validationSuccess: 0.20,   // general validation check pass rate
    criticalFieldCoverage: 0.15, // coverage of required/critical fields
  }
};
