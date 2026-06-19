# Edge Cases Discovered

## Source Dataset: TAM_INTERN_TABLE.xlsx

---

## Edge Case 1: Excel Serial Date Numbers

**Observed:** The `signup_date` column contains integers like `45037`, `45454`, `45445` — not human-readable dates.

**Root Cause:** Excel stores dates as days since 1900-01-01. When exported as `.xlsx` without date formatting, the underlying serial number is exposed.

**Impact:** Without handling, all dates would fail validation as "unrecognized format".

**Fix Applied:** `fileParser.js` detects columns where >80% of values are numbers in range 20,000–70,000 and converts them using:
```
UTC_DAYS = serial - 25569
date = new Date(UTC_DAYS * 86400 * 1000)
```
**Result:** `45037` → `2023-04-21` ✓

---

## Edge Case 2: Numeric Phone Numbers

**Observed:** `phone_number` column contains integers like `7332867654` — JavaScript reads these as `Number` type from XLSX, not strings.

**Root Cause:** SheetJS reads large integers as JavaScript `Number`, which loses leading zeros in some cases and fails string-based regex.

**Fix Applied:** `fileParser.js` converts values where `typeof v === 'number' && v > 1000000000 && v < 99999999999` to `String(v)`.

**Result:** `7332867654` (Number) → `"7332867654"` (String) → passes 10-digit India validation ✓

---

## Edge Case 3: Null Values vs Empty Strings

**Observed:** Missing values in XLSX appear as `null` (not `""`) when read with `defval: null`.

**Impact:** Standard empty-string checks (`value === ""`) would miss null values.

**Fix Applied:** `integrityValidator.isEmpty()` checks:
```js
value === null || value === undefined || value.trim() === ""
```

---

## Edge Case 4: 699 of 999 Rows with Missing Phone

**Observed:** 70% of rows have no phone number. This is a business-level data quality failure.

**Impact:** Trust score for phone dimension: 30%. Business Impact: "High" communication risk.

**Implication for Validation:** The validator should NOT skip rows where phone is null — it should report them as `invalid_phone_empty_phone` so they appear in the error report.

---

## Edge Case 5: Large-Scale Duplicate Customer IDs

**Observed:** Only 301 unique `customer_id` values across 999 rows — 698 IDs are duplicated.

**Root Cause (suspected):** Synthetic/test data generation with repeated ID ranges, or multiple transactions linked to the same customer without a transaction-level ID.

**Business Impact:** CRITICAL — makes customer-level deduplication, cohort analysis, and retention metrics unreliable.

**Detection:** `findDuplicates()` in `integrityValidator.js` uses a single-pass Map to identify all duplicates in O(n).

---

## Edge Case 6: Mixed Indian City Names in `city` Column

**Observed:** Cities: Chennai, Pune, Kolkata, Delhi, Ahmedabad, Mumbai, Hyderabad, Bangalore — one `undefined` row.

**Implication:** `city` was mapped to `country` canonical field in column mapper. The phone validator uses `country` to determine phone rules. Since "Mumbai" is not a country code, the validator falls back to `defaultCountry = 'IN'` — which is correct for this dataset.

**Lesson:** Country field mapping should be tolerant of city names for Indian datasets.

---

## Edge Case 7: Mixed Null in Emails

**Observed:** `null` and valid email patterns coexist. Some emails use unusual domains (`.info`, `.co.in`, `wason.com`).

**Impact:** 22% of 999 rows have valid emails. The validator correctly accepts unusual domains while rejecting null entries.

**Non-issue:** `.info`, `.net`, `wason.com` — all pass `^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$` regex ✓

---

## Edge Case 8: XLSX Multi-Sheet Files

**Implementation Note:** Parser reads only `SheetNames[0]` (first sheet). Files with multiple sheets will only have the first sheet parsed.

**Current Behavior:** Sheet name is displayed in the detection card metadata.

**Recommendation for Production:** Add sheet selector UI for multi-sheet XLSX files.

---

*Documented by XENO DataPulse AI testing team*
