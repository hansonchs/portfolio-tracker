# Changelog

All notable changes and fixes to the Portfolio Tracker application.

## [2025-12-29] - Cash Balance & Position Size Analysis ✅

### Cash Balance Tracking - Added ✅
**Feature:** Track cash balances across all broker accounts

**Implementation:**
- Added `cashBalance` field to Account model in Prisma schema
- Added PUT endpoint to `/api/accounts` for updating cash balance
- Settings page now includes "Cash Balance Management" section
- Multi-currency support (HKD, USD) with automatic conversion

**Dashboard Updates:**
- New 5-card summary layout (was 4 cards)
- **Net Worth** card replaces "Total Value" - shows positions + cash
- **Cash** card shows total cash across all accounts (converted to HKD)
- Cash as % of net worth displayed

**Files Changed:**
- `prisma/schema.prisma` - Added cashBalance to Account model
- `app/api/accounts/route.ts` - Added PUT endpoint
- `app/settings/page.tsx` - Added cash management section
- `app/page.tsx` - Added cash calculations and Cash card

---

### Position Size Analysis - Added ✅
**Feature:** Monitor position sizes relative to total portfolio with configurable alerts

**Implementation:**
- Created UserSettings model for storing position threshold
- Added `/api/settings` endpoint (GET/POST)
- Settings page includes "Position Size Alert Threshold" section
- Threshold configurable from 5% to 50% (default: 20%)

**Dashboard Updates:**
- Holdings show position size as % of net worth (positions + cash)
- Visual alert badges:
  - **Gray**: Normal (< 80% of threshold)
  - **Yellow**: Near threshold (80-100%)
  - **Red**: Over threshold (≥ threshold)
- "Over threshold" alert badge with icon on oversized positions
- Highlighted red border and background for oversized holdings

**Files Changed:**
- `prisma/schema.prisma` - Added UserSettings model
- `app/api/settings/route.ts` - New file
- `app/settings/page.tsx` - Added threshold configuration
- `app/page.tsx` - Added position alerts and net worth calculation

---

### Asset Type Chart Enhancement - Updated ✅
**Enhancement:** Added Cash as a new category in Asset Type Breakdown chart

**Changes:**
- Chart now shows: Stocks, Options, ETFs, **Cash**
- Cash displayed with green color (#22c55e)
- Summary section includes cash with value and percentage

**Files Changed:**
- `app/page.tsx`

---

## [2025-12-28] - Price Fetching & Currency Conversion Fixes

### Dashboard Price Display - Fixed ✅
**Issue:** Dashboard showing 0 values for all positions

**Root Cause:** Yahoo Finance API response structure changed - `meta.regularPrice` and `meta.previousClose` were undefined

**Fix:** `app/api/prices/route.ts:38-56`
- Added multiple price field attempts: `regularPrice`, `regularMarketPrice`, `previousClose`, `chartPreviousClose`
- Added fallback to `indicators.quote[0].close` data
- Improved error handling with better null checks

**Files Changed:**
- `app/api/prices/route.ts`

---

### HK Stock Price Fetching - Fixed ✅
**Issue:** Hong Kong stocks (00700, 09988, etc.) returning no prices

**Root Cause:** Yahoo Finance expects HK stocks with specific leading zero format:
- `00700` → `0700.HK` (5-digit codes: remove first zero only)
- `09988` → `09988.HK` (4-digit codes: keep as is)

**Fix:** `app/api/prices/route.ts:12-21`
```typescript
// Add suffix for HK stocks (handle leading zeros)
if (ticker.match(/^\d{4,5}$/)) {
  let hkTicker = ticker
  if (ticker.length === 5 && ticker.startsWith('0')) {
    hkTicker = ticker.substring(1) // Remove first zero only
  }
  yahooTicker = `${hkTicker}.HK`
}
```

**Verified Prices:**
- 00700 (Tencent): HKD 603
- 09988 (Alibaba): HKD 146
- AAPL (Apple): USD 273.40

**Files Changed:**
- `app/api/prices/route.ts`

---

### Dashboard avgCost Fallback - Fixed ✅
**Issue:** When live prices unavailable, dashboard showed 0 value

**Fix:** `app/page.tsx:89-90, 136-137`
- Dashboard now uses `avgCost` as fallback when `prices[ticker].price` is unavailable
- Ensures values display based on cost basis even when API fails

**Files Changed:**
- `app/page.tsx`

---

### Currency Conversion for US Stocks - Fixed ✅
**Issue:** US stock values not converted to HKD, causing incorrect totals

**Root Cause:** Code was using `pos.account.currency` instead of the actual price currency from Yahoo Finance

**Fix:** `app/page.tsx:87-100, 140-155`
- Now uses `prices[ticker].currency` from Yahoo Finance API for conversion
- Falls back to account currency if price unavailable
- Both grouped data and market breakdown use price currency

**Calculation Example:**
- TSLA: 65 shares × $475.19 USD × 7.8 = HKD 240,921
- US stock: 10 AAPL × $273.40 × 7.8 = HKD 21,325.20
- HK stock: 100 × 00700 × HKD 603 = HKD 60,300

**Files Changed:**
- `app/page.tsx`

---

### Dashboard Display Improvements - Enhanced ✅
**Issue:** Need better information display per holding

**Enhancement:** `app/page.tsx:259-274`
- Added **Current Price** display with currency badge (e.g., "USD 273.40", "HKD 603.00")
- Improved **Portfolio Portion** label (e.g., "12.5% of portfolio")
- Better visual organization with distinct badges

**Display Format:**
```
AAPL | USD 273.40 | 12.5% of portfolio | 100 shares
Total: HKD 213,054 | P/L: +HKD 45,234 (+26.98%)
```

**Files Changed:**
- `app/page.tsx`

---

### Navigation Cleanup - Fixed ✅
**Issue:** Upload page deprecated but still in navigation

**Fix:** Removed upload links from:
- `app/layout.tsx` - Navigation bar
- `app/page.tsx` - Empty state message
- `app/positions/page.tsx` - "Add Position" button now goes to /manual only

**Files Changed:**
- `app/layout.tsx`
- `app/page.tsx`
- `app/positions/page.tsx`

---

## [2025-12-28] - Dashboard Charts Added ✅

### Portfolio Visualization Charts - Added ✅
**Enhancement:** Added pie charts to visualize portfolio allocation

**Features Added:**
1. **Market Allocation Chart** - Shows US vs HK market breakdown
   - Pie chart with percentage labels on slices
   - Summary section below with values and percentages
   - HK Market (green), US Market (blue)

2. **Asset Type Breakdown Chart** - Shows Stocks, Options, ETFs
   - Pie chart with percentage labels on slices
   - Summary section below with values and percentages
   - Stocks (purple), Options (orange), ETFs (cyan)
   - Automatically detects ETFs by ticker pattern

**ETF Detection Pattern:**
```
QQQ, VOO, VTI, SPY, IWM, IWV, ARKK, ARKG,
XLE, XLF, XLK, XLU, XLV, XLY, XLP, XLB, XLI, XLRE,
GLD, SLV, TLT, QQQM, SPYM, VWO, VGK, VPL, VNQ
```

**Files Changed:**
- `app/page.tsx`
- `package.json` (recharts dependency)

### Holdings Asset Type Labels - Added ✅
**Enhancement:** Added asset category badges to holdings display

**Features Added:**
- Color-coded badges showing Stock, ETF, or Option for each holding
- Uses same ETF detection pattern as charts
- Options take priority if ticker has both stocks and options

**Files Changed:**
- `app/page.tsx`

### Positions & Manual Entry UI Improvements - Enhanced ✅
**Enhancement:** Improved asset category labels and currency display

**Changes Made:**
1. **Positions Page** (`/positions`):
   - Type column now shows colored badges (Stock/ETF/Option) with same detection as dashboard
   - Account column no longer shows HKD/USD badge
   - Avg Cost column shows currency symbol ($ for USD, HKD for HKD)

2. **Manual Entry Page** (`/manual`):
   - Account dropdown no longer shows currency
   - Average Cost label shows currency indicator (HKD/USD) based on market selection
   - Placeholder updates based on market (HK: 400.00, US: 150.00)

**Files Changed:**
- `app/positions/page.tsx`
- `app/manual/page.tsx`

### Mobile Layout for Options Holdings - Fixed ✅
**Fix:** Fixed broken layout for options display on mobile

**Changes Made:**
- Mobile: 2-column card layout with labels on left, values on right
- Desktop: Compact table layout with rows
- Each option contract in its own card for better separation
- Responsive design using Tailwind breakpoints

**Files Changed:**
- `app/page.tsx`

### Last Update Time Display - Added ✅
**Enhancement:** Added last price update time display to dashboard

**Features Added:**
- Shows timestamp of last price fetch below Dashboard title
- Format: "Last updated: 14:30:45 HKT" (24-hour format, Hong Kong timezone UTC+8)
- Button shows "Updating..." while fetching prices
- Timestamp auto-updates on page load and manual refresh
- Displays in HKT timezone regardless of user location

**Files Changed:**
- `app/page.tsx`

---

## Summary of All Changes

| Issue | Status | Files Modified |
|-------|--------|----------------|
| Dashboard showing 0 values | ✅ Fixed | `app/api/prices/route.ts` |
| HK stocks no price data | ✅ Fixed | `app/api/prices/route.ts` |
| No avgCost fallback | ✅ Fixed | `app/page.tsx` |
| US stocks not converted to HKD | ✅ Fixed | `app/page.tsx` |
| Dashboard display needs improvement | ✅ Enhanced | `app/page.tsx` |
| Upload page navigation | ✅ Fixed | `app/layout.tsx`, `app/page.tsx`, `app/positions/page.tsx` |
| No portfolio visualization | ✅ Added | `app/page.tsx` |
| No asset type labels in holdings | ✅ Added | `app/page.tsx` |
| Asset category & currency display | ✅ Enhanced | `app/positions/page.tsx`, `app/manual/page.tsx` |
| Mobile layout broken for options | ✅ Fixed | `app/page.tsx` |
| No last update time display | ✅ Added | `app/page.tsx` |

---

## Technical Notes

### Exchange Rates
- USD to HKD: 7.8 (fixed rate)
- HKD to USD: 0.128 (fixed rate)

### Yahoo Finance API
- Base URL: `https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=1d`
- US stocks: Use ticker directly (e.g., `AAPL`)
- HK stocks: Add `.HK` suffix with proper leading zero handling

### Currency Conversion Logic
```typescript
const convertToHKD = (value: number, currency: string) => {
  if (currency === "USD") return value * 7.8
  return value  // Already in HKD
}
```

### Price Fallback Priority
1. Live price from Yahoo Finance (`prices[ticker].price`)
2. Average cost from database (`pos.avgCost`)
3. Zero (if neither available)
