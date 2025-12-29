# Portfolio Tracker - Requirements Document

## Project Overview
A personal portfolio tracker to monitor stock and options positions across 3 broker accounts (Futu, WeBull, Tiger).

**Current Scope (Revised):**
- Manual position entry (OCR/upload feature removed)
- Real-time price tracking via Yahoo Finance
- Dashboard with totals, P/L, market allocation
- Multi-currency support (HKD, USD) with base currency conversion

---

## Core Features

### 1. Manual Position Entry
**Status:** ✅ Implemented
**Description:** Users can manually add stock and option positions.

**Fields:**
- Ticker symbol (e.g., AAPL, 00700)
- Type: Stock or Option
- Quantity: Number of shares/contracts
- Average Cost: Cost basis per share
- Market: HK or US
- Account: Auto-assigned to "Portfolio" (no manual selection needed)

**Option-specific fields:**
- Strike price
- Expiration date
- Option type: Call or Put

---

### 2. Positions Management
**Status:** ✅ Implemented
**Description:** View, edit, and delete all positions.

**Features:**
- List view of all positions with account, ticker, type, market, quantity, avg cost
- Edit ticker, quantity, avg cost inline
- Delete positions with confirmation
- Quick access to Manual Entry and Upload pages

---

### 3. Dashboard
**Status:** ✅ Implemented
**Description:** Overview of portfolio performance and allocation.

**Displays:**
- **Total Portfolio Value** - Combined value in base currency (HKD)
- **Total P/L** - Profit/Loss in amount and percentage
- **HK Market %** - Allocation to Hong Kong stocks
- **US Market %** - Allocation to US stocks
- **Holdings by Ticker** - Stocks and options grouped by ticker showing:
  - Ticker symbol
  - Total quantity (stocks + options combined)
  - Total value
  - Total cost basis
  - P/L amount and percentage
  - % allocation of total portfolio
  - Source accounts

**Calculations:**
- Base currency: HKD (USD converted at 7.8 rate)
- P/L = (Current Price × Quantity) - (Avg Cost × Quantity)
- P/L % = P/L / Cost Basis × 100

---

### 4. Price Refresh
**Status:** ⚠️ Partial (Yahoo Finance API has issues)
**Description:** Fetch latest prices for all positions.

**Features:**
- "Refresh Prices" button on dashboard
- Yahoo Finance integration (delayed prices OK)
- Supports US stocks and HK stocks (.HK suffix)
- Fallback to cached prices on API failure

**Known Issues:**
- Some tickers return null prices
- Need better error handling
- May need alternative data source

---

### 5. Settings (API Key & Preferences)
**Status:** ✅ Implemented
**Description:** Manage API keys and portfolio preferences.

**Features:**
- Store API key in browser localStorage
- Test API key button
- OpenRouter integration for vision models
- Show/hide password toggle
- Clear key option
- **Cash Balance Management** - Set cash balance for each account
- **Position Size Alert Threshold** - Configure position size alert percentage (5-50%)

---

### 6. Cash Balance Tracking
**Status:** ✅ Implemented (New)
**Description:** Track cash balances across all broker accounts.

**Features:**
- Set cash balance for each account (Futu, WeBull, Tiger, Portfolio)
- Multi-currency support (HKD, USD)
- Automatic conversion to base currency (HKD)
- Dashboard shows total cash as % of net worth
- Manual update via Settings page

---

### 7. Position Size Analysis
**Status:** ✅ Implemented (New)
**Description:** Monitor position sizes relative to total portfolio value.

**Features:**
- Shows each holding's size as % of net worth (positions + cash)
- Configurable alert threshold (default: 20%, range: 5-50%)
- Visual alert badges:
  - **Red**: Over threshold (≥ configured %)
  - **Yellow**: Near threshold (80-100%)
  - **Gray**: Normal (< 80%)
- Alert badge with icon on oversized positions
- Highlighted background for oversized holdings

---

## Data Model

### Accounts
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| name | String | "Futu", "WeBull", "Tiger", or "Portfolio" |
| currency | String | "HKD" or "USD" |
| cashBalance | Float | Cash balance in account currency (default: 0) |

### Positions
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| accountId | String | FK to Accounts (auto-assigned to "Portfolio") |
| ticker | String | Stock/Option symbol (uppercase) |
| type | String | "stock" or "option" |
| quantity | Float | Number of shares/contracts |
| avgCost | Float | Average cost per share |
| market | String | "HK" or "US" |
| strike | Float? | Strike price (options only) |
| expiry | Date? | Expiration date (options only) |
| optionType | String? | "call" or "put" |

### UserSettings
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| positionThreshold | Float | Alert threshold % (default: 20, range: 5-50) |

---

## Pages/Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Dashboard | ✅ Active |
| `/manual` | Manual position entry | ✅ Active |
| `/positions` | List/edit/delete positions | ✅ Active |
| `/settings` | API key, cash balance, threshold | ✅ Active |
| `/upload` | OCR upload (deprecated) | ⚠️ Removed |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui (Card, Button, Input, Table, etc.) |
| Charts | Recharts (PieChart for visualizations) |
| Database | SQLite (Prisma ORM) |
| Price API | Yahoo Finance (via fetch) |
| Deployment | Vercel-ready |

---

## Current Limitations

1. **No OCR/Upload** - Removed per user request
2. **Yahoo Finance API** - Some tickers fail to return prices
3. **No Authentication** - Single user, local only
4. **Manual Currency Conversion** - Fixed rate (7.8 USD→HKD)
5. **No Historical Data** - Only current prices
6. **Manual Cash Updates** - Cash balances must be updated manually via Settings
7. **Single User Settings** - Position threshold is global, not per-account

---

## Future Enhancements (Out of Scope)

- User authentication
- Historical P/L charts
- Dividend tracking
- Multiple portfolios
- Export to CSV/Excel
- Real-time WebSocket prices
- Mobile app
- Transaction history
- **Sector breakdown** analysis
- **Historical performance** tracking
