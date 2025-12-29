# Portfolio Tracker - Test Plan

## Test Execution Status

| Test Section | Status | Date | Notes |
|--------------|--------|------|-------|
| Backend API Tests | ✅ Passed | 2025-12-28 | All APIs working |
| Cash & Settings API | ✅ Passed | 2025-12-29 | New endpoints verified |
| Manual Entry | ⏳ Pending | - | User to test in browser |
| Dashboard | ⏳ Pending | - | User to test in browser |
| Positions Page | ⏳ Pending | - | User to test in browser |
| Settings (New) | ⏳ Pending | - | User to test cash & threshold |
| Dashboard (New) | ⏳ Pending | - | User to test alerts & cash |

---

## 1. Backend API Tests ✅

### 1.1 Accounts API
**Test Command:**
```bash
curl http://localhost:3000/api/accounts
```
**Expected:** Returns list of 4 accounts (Futu, WeBull, Tiger, Portfolio)
**Result:** ✅ PASS - 4 accounts returned, Portfolio has 25+ positions

### 1.2 Create Position API
**Test Command:**
```bash
curl -X POST http://localhost:3000/api/positions \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","type":"stock","quantity":10,"avgCost":150,"market":"US"}'
```
**Expected:** Creates position, returns position object with account
**Result:** ✅ PASS - Position created, auto-assigned to "Portfolio" account

### 1.3 Get Positions API
**Test Command:**
```bash
curl http://localhost:3000/api/positions
```
**Expected:** Returns all positions with account details
**Result:** ✅ PASS - 30 positions returned, grouped by ticker works

### 1.4 Delete Position API
**Test Command:**
```bash
curl -X DELETE "http://localhost:3000/api/positions?id=<position_id>"
```
**Expected:** Deletes position, returns success
**Result:** ✅ PASS - Position deleted successfully

---

## 2. Manual Entry (Browser Test)

### 2.1 Add Stock Position
**Steps:**
1. Go to http://localhost:3000/manual
2. Enter:
   - Account: "Portfolio" (or any available)
   - Ticker: "TSLA"
   - Type: "Stock"
   - Quantity: "50"
   - Avg Cost: "200"
   - Market: "US"
3. Click "Add Position"

**Expected:** Redirects to dashboard, TSLA appears in holdings

### 2.2 Add Option Position
**Steps:**
1. Go to http://localhost:3000/manual
2. Enter:
   - Ticker: "NVDA"
   - Type: "Option"
   - Quantity: "2"
   - Avg Cost: "10"
   - Market: "US"
   - Option Type: "Call"
   - Strike: "150"
   - Expiry: Select a future date
3. Click "Add Position"

**Expected:** Redirects to dashboard, NVDA option appears

### 2.3 Add HK Stock Position
**Steps:**
1. Go to http://localhost:3000/manual
2. Enter:
   - Ticker: "09988" (HK stock)
   - Type: "Stock"
   - Quantity: "1000"
   - Avg Cost: "5"
   - Market: "HK"
3. Click "Add Position"

**Expected:** HK stock added, appears in HK market allocation

---

## 3. Dashboard Tests (Browser)

### 3.1 Total Portfolio Value
**Steps:** Go to http://localhost:3000/
**Expected:** Shows total value in HKD
**Verify:** Sum of all positions (quantity × current price) converted to HKD

### 3.2 P/L Calculation
**Steps:** Look at P/L card on dashboard
**Expected:** Shows amount and percentage, green if positive, red if negative
**Verify:** P/L = Total Value - Total Cost Basis

### 3.3 Market Allocation (HK vs US)
**Steps:** Look at HK Market and US Market cards
**Expected:** Shows percentage breakdown
**Verify:**
- HK stocks counted in HK Market %
- US stocks counted in US Market %
- Percentages add up to ~100%

### 3.4 Holdings by Ticker
**Steps:** Scroll to "Holdings by Ticker" section
**Expected:**
- Each ticker listed once with combined quantities
- Shows % of total portfolio
- Groups stocks + options by same ticker
- Shows P/L per ticker

### 3.5 Price Refresh
**Steps:** Click "Refresh Prices" button
**Expected:**
- Button shows loading state
- P/L recalculates with new prices
- Shows success or error message

---

## 4. Positions Page Tests (Browser)

### 4.1 List View
**Steps:** Go to http://localhost:3000/positions
**Expected:** Table showing all positions with:
- Ticker, Account, Type, Market, Quantity, Avg Cost
- Edit and Delete buttons

### 4.2 Inline Edit
**Steps:**
1. Click Edit button on any position
2. Modify Quantity or Avg Cost
3. Click Check (save) button
**Expected:** Position updates, data persists

### 4.3 Delete Position
**Steps:**
1. Click Delete (trash) button on a position
2. Confirm deletion
**Expected:** Position removed from list

### 4.4 Navigation
**Steps:** Click "Manual Entry" and "Upload" buttons
**Expected:** Navigates to respective pages

---

## 5. Settings Tests (Browser)

### 5.1 Save API Key
**Steps:**
1. Go to http://localhost:3000/settings
2. Enter OpenRouter API key (sk-or-v1-...)
3. Click "Save"
**Expected:** Button shows "Saved", key persists after refresh

### 5.2 Test API Key
**Steps:** Click "Test Key" button
**Expected:** Shows green success or red error message

### 5.3 Clear Key
**Steps:** Click "Clear Key" button
**Expected:** Key removed from storage

### 5.4 Update Cash Balance (New)
**Steps:**
1. Go to http://localhost:3000/settings
2. Find "Cash Balance Management" section
3. For an account (e.g., Futu), enter cash balance: "50000"
4. Click "Update"
**Expected:**
- Button shows loading state
- Balance updates successfully
- Current balance displays below input

### 5.5 Update Multi-Currency Cash Balance (New)
**Steps:**
1. For a USD account (e.g., WeBull), enter: "5000"
2. Click "Update"
**Expected:**
- Balance saved in USD
- Dashboard correctly converts to HKD

### 5.6 Set Position Alert Threshold (New)
**Steps:**
1. Go to http://localhost:3000/settings
2. Find "Position Size Alert Threshold" section
3. Enter threshold: "25"
4. Click "Save"
**Expected:**
- Button shows loading state
- Shows "Saved" confirmation
- Threshold persists after refresh

### 5.7 Threshold Validation (New)
**Steps:**
1. Try entering invalid threshold: "60" (over max)
2. Try entering: "3" (under min)
**Expected:** Input rejects invalid values (range: 5-50)

---

## 6. Dashboard Tests - Cash & Alerts (New)

### 6.1 Net Worth Calculation
**Steps:** Go to http://localhost:3000/
**Expected:**
- "Net Worth" card shows: Total Value + Cash
- "Positions + Cash" subtitle displayed
- Value in HKD with proper formatting

### 6.2 Cash Summary Card
**Steps:** Look at "Cash" card in summary section
**Expected:**
- Shows total cash across all accounts (converted to HKD)
- Shows cash as % of net worth
- Wallet icon displayed

### 6.3 Asset Type Chart Includes Cash
**Steps:** Look at "Asset Type Breakdown" chart
**Expected:**
- Cash appears as a green slice
- Summary shows "Cash: HKD X (Y%)"

### 6.4 Position Size Display
**Steps:** Scroll to "Holdings by Ticker" section
**Expected:**
- Each holding shows "% of portfolio" badge
- Percentage calculated as: position value / net worth × 100
- Calculation includes cash in denominator

### 6.5 Position Alert - Normal State
**Steps:** Set threshold to 20%, view small positions
**Expected:**
- Gray "% of portfolio" badge
- No alert icon

### 6.6 Position Alert - Near Threshold
**Steps:** Set threshold to 20%, view position at 16-19%
**Expected:**
- Yellow "% of portfolio" badge

### 6.7 Position Alert - Over Threshold
**Steps:** Set threshold to 20%, view position >20%
**Expected:**
- Red "% of portfolio" badge
- "Over threshold" badge with AlertTriangle icon
- Highlighted red border and background

### 6.8 Cash Conversion Accuracy
**Steps:**
1. Set USD account cash: $10,000
2. Set HKD account cash: HKD 50,000
**Expected:**
- Total Cash = (10000 × 7.8) + 50000 = HKD 128,000
- Dashboard displays correct total

---

## 7. API Tests - New Endpoints

### 7.1 GET /api/settings (New)
**Test Command:**
```bash
curl http://localhost:3000/api/settings
```
**Expected:** Returns `{"positionThreshold": 20}` (default)
**Result:** ✅ PASS

### 7.2 POST /api/settings (New)
**Test Command:**
```bash
curl -X POST http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"positionThreshold": 25}'
```
**Expected:** Returns updated threshold, persists to database
**Result:** ✅ PASS

### 7.3 PUT /api/accounts - Update Cash Balance (New)
**Test Command:**
```bash
curl -X PUT http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"id":"<account_id>","cashBalance": 50000}'
```
**Expected:** Returns account with updated cashBalance
**Result:** ✅ PASS

### 7.4 Threshold Validation (API)
**Test Command:**
```bash
curl -X POST http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"positionThreshold": 60}'
```
**Expected:** Returns error "Threshold must be between 5 and 50"
**Result:** ✅ PASS

---

## Known Issues & Workarounds

| Issue | Workaround |
|-------|------------|
| Yahoo Finance API returns null for some HK tickers | Dashboard uses avgCost as fallback, values still display |
| Some HK stock tickers return 404 | Dashboard uses avgCost as fallback |
| Dashboard buttons not clickable (fixed) | Fixed - use hard refresh if cached (Cmd+Shift+R) |
| **Price showing as 0 (FIXED)** | Fixed - Yahoo Finance now returns prices for US stocks, avgCost fallback for others |

### Recent Fixes (2025-12-28):
- ✅ **Fixed:** Dashboard showing 0 values - Yahoo Finance price fetching improved with multiple field attempts
- ✅ **Fixed:** Added fallback to avgCost when live prices unavailable - dashboard now shows cost basis
- ✅ **Fixed:** US stocks (AAPL, TSLA, QQQ, VOO, etc.) now fetch live prices correctly
- ✅ **Fixed:** HK stocks (00700, 09988, 01137, etc.) now fetch live prices correctly - fixed leading zero handling

---

## Test Data Setup

### Sample Positions for Testing
```
US Stocks:
- AAPL: 10 shares @ $150
- TSLA: 50 shares @ $200
- QQQ: 20 shares @ $400

HK Stocks:
- 00700: 100 shares @ $400 HKD
- 09988: 1000 shares @ $5 HKD

Options:
- AAPL PUT: 1 contract @ $5, strike $200, exp 2025-06-20
- NVDA CALL: 2 contracts @ $10, strike $150, exp 2025-03-15
```

---

## Sign-off Criteria

The app is considered "ready" when:
- [ ] Manual entry works (stocks + options)
- [ ] Dashboard displays correct totals
- [ ] P/L calculations are accurate
- [ ] HK/US market split works
- [ ] Edit/Delete positions works
- [ ] Refresh prices fetches data (even with some failures)
- [ ] Settings page persists API key
- [ ] **Cash balance updates via Settings**
- [ ] **Net worth includes positions + cash**
- [ ] **Position alerts trigger at configured threshold**
- [ ] **Asset Type chart shows Cash category**
