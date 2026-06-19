# XENO DataPulse AI

> **AI-Powered Transaction Intelligence Platform**  
> *From Raw Data To Trusted Data*

Built as a selection assignment for Xeno. Designed to look and feel like a real enterprise data quality tool.

---

## What It Does

XENO DataPulse AI is a fully client-side data validation and intelligence platform. Upload any CSV or XLSX transaction/customer dataset and get:

| Feature | Description |
|---------|-------------|
| 🔍 **Dataset Type Detection** | Auto-classifies Customer, Transaction, Product, or Mixed datasets with confidence % |
| 🗺️ **Smart Column Mapping** | Fuzzy alias matching auto-suggests field mappings; templates for common dataset types |
| ✅ **Multi-Rule Validation** | Phone (8 countries), email, date (7 formats), data integrity, payment modes |
| 📊 **Data Trust Score** | Weighted 5-dimension score (0–100) with per-dimension breakdown |
| 💼 **Business Impact Analysis** | Converts errors into CRM metrics: CRM reach loss, communication risk, reporting accuracy |
| 🤖 **AI Executive Insights** | On-demand Groq AI summary, error explanations, and recommended actions |
| 📦 **Smart Downloads** | Clean CSV, error report CSV, chunked ZIP (500/1000/5000 rows), validation JSON |
| ⚙️ **Country Rules Manager** | Add/edit/delete phone validation rules per country |

---

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS v4 (CSS-first config)
- **Parsing:** PapaParse (CSV) + SheetJS (XLSX)
- **Downloads:** JSZip
- **Charts:** Recharts (Radial Bar for Trust Score)
- **State:** Zustand
- **AI:** Groq API (`llama-3.3-70b-versatile`)
- **Deployment:** Vercel

---

## Quick Start

```bash
# Install dependencies
npm install

# Add your Groq API key (optional — app works without it)
cp .env.example .env.local
# Edit .env.local → VITE_GROQ_API_KEY=your_key

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Sample Dataset

The provided `dataset/TAM_INTERN_TABLE.xlsx` (999 rows) demonstrates the platform on real data:

| Finding | Count |
|---------|-------|
| Detected Type | Customer Dataset (96% confidence) |
| Null Phone Numbers | 699 (70%) |
| Null Email Addresses | 779 (78%) |
| Duplicate Customer IDs | 698 |
| Excel Serial Dates (auto-fixed) | 300 |
| Trust Score | ~28/100 (Critical) |

See `docs/testing/` for detailed analysis.

---

## Architecture

Everything runs **client-side**. No backend, no database, no auth.

```
Browser
  ↓
PapaParse / SheetJS → parseFile()
  ↓
datasetTypeDetector → type + confidence
  ↓
columnAutoMapper → auto mappings
  ↓
validationEngine → errors + clean rows
  ↓
trustScore + businessImpact → metrics
  ↓
[optional] groqService → AI insights (stats only, no PII)
  ↓
downloadService → CSV / ZIP / JSON
```

---

## AI Safety

The Groq AI integration **never sends raw data**. Only validation statistics are transmitted:
```json
{
  "error_categories": { "invalid_phone": 699, "invalid_email": 779 },
  "total_rows": 999,
  "trust_score": 28
}
```

---

## Deployment

```bash
# Deploy to Vercel
npx vercel --prod
```

Set `VITE_GROQ_API_KEY` in Vercel environment variables for AI features.

---

## Validation Rules

### Phone Countries Supported
India (IN) · Singapore (SG) · USA (US) · UAE (AE) · UK (GB) · Malaysia (MY) · Australia (AU) · Canada (CA)

### Date Formats Supported
`YYYY-MM-DD` · `DD/MM/YYYY` · `MM/DD/YYYY` · `DD-MM-YYYY` · `YYYY/MM/DD` · `ISO 8601` · Excel serial (auto-converted)

### Integrity Checks
- Missing required fields
- Duplicate Order/Customer IDs
- Exact duplicate rows
- Negative amounts
- Invalid quantities
- Unrecognized payment methods
- Invalid transaction statuses

---

*XENO DataPulse AI — Built for the Xeno selection assignment, 2024*
