/**
 * Global App Store (Zustand)
 * Single source of truth for all application state.
 */
import { create } from 'zustand';
import { DEFAULT_COUNTRY_RULES } from '../constants/countryRules';

export const STEPS = {
  UPLOAD: 0,
  MAPPING: 1,
  VALIDATION: 2,
  RESULTS: 3,
};

const useAppStore = create((set, get) => ({
  // --- File / Parse State ---
  fileInfo: null,       // { fileName, fileSize, rowCount, columnCount, sheetName }
  rawData: [],          // Parsed rows
  headers: [],          // Column headers

  // --- Dataset Detection ---
  datasetDetection: null, // { type, confidence, detectedFields, description, icon, color }

  // --- Column Mapping ---
  columnMappings: {},   // { canonical_field_id: source_column_name }
  activeTemplate: null, // 'customer' | 'transaction' | 'custom'

  // --- Validation ---
  isValidating: false,
  validationResult: null,

  // --- Trust Score ---
  trustScore: null,

  // --- Business Impact ---
  businessImpact: null,

  // --- Validation Coverage ---
  validationCoverage: null,

  // --- AI Insights ---
  aiInsights: null,
  aiCache: {},
  isLoadingAI: false,
  aiError: null,

  // --- Settings ---
  countryRules: { ...DEFAULT_COUNTRY_RULES },
  defaultCountry: 'IN',

  // --- UI State ---
  currentStep: STEPS.UPLOAD,
  errorFilter: { severity: 'all', field: 'all', search: '' },

  // --- Actions ---

  setFileData: (fileInfo, rawData, headers) =>
    set({ fileInfo, rawData, headers }),

  setDatasetDetection: (detection) =>
    set({ datasetDetection: detection }),

  setColumnMappings: (mappings) =>
    set({ columnMappings: mappings }),

  updateColumnMapping: (fieldId, sourceColumn) =>
    set((state) => ({
      columnMappings: { ...state.columnMappings, [fieldId]: sourceColumn },
    })),

  setActiveTemplate: (template) =>
    set({ activeTemplate: template }),

  setValidating: (isValidating) =>
    set({ isValidating }),

  setValidationResult: (result, trustScore, businessImpact, coverage) =>
    set({
      validationResult: result,
      trustScore,
      businessImpact,
      coverage,
      isValidating: false,
    }),

  setAIInsights: (insights) =>
    set({ aiInsights: insights }),

  setAILoading: (loading) =>
    set({ isLoadingAI: loading }),

  setAIError: (error) =>
    set({ aiError: error }),

  addToAICache: (key, value) =>
    set((state) => ({ aiCache: { ...state.aiCache, [key]: value } })),

  setErrorFilter: (filter) =>
    set((state) => ({ errorFilter: { ...state.errorFilter, ...filter } })),

  setCountryRules: (rules) =>
    set({ countryRules: rules }),

  updateCountryRule: (code, rule) =>
    set((state) => ({
      countryRules: { ...state.countryRules, [code]: rule },
    })),

  deleteCountryRule: (code) =>
    set((state) => {
      const rules = { ...state.countryRules };
      delete rules[code];
      return { countryRules: rules };
    }),

  setDefaultCountry: (country) =>
    set({ defaultCountry: country }),

  goToStep: (step) =>
    set({ currentStep: step }),

  goNextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, STEPS.RESULTS) })),

  goPrevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, STEPS.UPLOAD) })),

  reset: () =>
    set({
      fileInfo: null,
      rawData: [],
      headers: [],
      datasetDetection: null,
      columnMappings: {},
      activeTemplate: null,
      isValidating: false,
      validationResult: null,
      trustScore: null,
      businessImpact: null,
      validationCoverage: null,
      aiInsights: null,
      isLoadingAI: false,
      aiError: null,
      currentStep: STEPS.UPLOAD,
      errorFilter: { severity: 'all', field: 'all', search: '' },
    }),
}));

export default useAppStore;
