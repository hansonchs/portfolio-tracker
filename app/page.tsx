"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Wallet, AlertTriangle, LayoutGrid, LayoutList, Square, ChevronDown, ChevronRight, TrendingDownIcon, TrendingUpIcon, LogIn } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Label } from "recharts"
import { toast } from "sonner"

interface Position {
  id: string
  ticker: string
  type: string
  quantity: number
  avgCost: number
  market: string
  strike?: number
  expiry?: string
  optionType?: string
  account: {
    name: string
    currency: string
  }
}

interface Account {
  id: string
  name: string
  currency: string
  cashBalance: number
}

interface PriceData {
  [ticker: string]: { price: number; currency: string }
}

interface TickerGroup {
  ticker: string
  totalValue: number
  totalCost: number
  quantity: number
  pl: number
  plPercent: number
  positions: Position[]
}

export default function HomePage() {
  const { isLoaded, userId } = useAuth()
  const [positions, setPositions] = useState<Position[]>([])
  const [prices, setPrices] = useState<PriceData>({})
  const [accounts, setAccounts] = useState<Account[]>([])
  const [positionThreshold, setPositionThreshold] = useState(20)
  const [targetAllocations, setTargetAllocations] = useState<{[ticker: string]: number}>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [chartLayout, setChartLayout] = useState<'grid' | 'rows' | 'stack'>('grid')
  const [expandedTickers, setExpandedTickers] = useState<Set<string>>(new Set())
  const [chartExpandedTickers, setChartExpandedTickers] = useState<Set<string>>(new Set())

  // HKD to USD exchange rate (you can make this dynamic later)
  const HKD_TO_USD = 0.128
  const USD_TO_HKD = 7.8

  const toggleTickerExpansion = (ticker: string) => {
    setExpandedTickers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(ticker)) {
        newSet.delete(ticker)
      } else {
        newSet.add(ticker)
      }
      return newSet
    })
  }

  const toggleChartExpansion = (ticker: string) => {
    setChartExpandedTickers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(ticker)) {
        newSet.delete(ticker)
      } else {
        newSet.add(ticker)
      }
      return newSet
    })
  }

  // Convert ticker to TradingView symbol format
  const getTradingViewSymbol = (ticker: string, market: string) => {
    if (market === "HK") {
      // HK stocks: check if already 5 digits with leading zero
      if (ticker.length === 5 && ticker.startsWith('0')) {
        return `HKEX:${ticker.substring(1)}`
      }
      return `HKEX:${ticker}`
    }
    // US stocks - add exchange prefix
    const exchanges = ['NASDAQ', 'NYSE', 'AMEX']
    // Default to NASDAQ for simplicity, could be enhanced
    return `NASDAQ:${ticker}`
  }

  useEffect(() => {
    fetchPositions()
    fetchAccounts()
    fetchSettings()
  }, [])

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      window.location.href = "/landing"
    }
  }, [isLoaded, userId])

  const fetchPositions = async () => {
    try {
      const res = await fetch("/api/positions")
      if (!res.ok) {
        setPositions([])
        if (res.status !== 401) {
          toast.error("Failed to load positions")
        }
        return
      }
      const data = await res.json()
      setPositions(Array.isArray(data) ? data : [])
      await fetchPrices(Array.isArray(data) ? data : [])
    } catch (error) {
      setPositions([])
      toast.error("Failed to load positions")
    } finally {
      setLoading(false)
    }
  }

  const fetchPrices = async (positionData: Position[] = positions) => {
    if (positionData.length === 0) return

    try {
      const tickers = [...new Set(positionData.map((p) => p.ticker))]
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers }),
      })
      const data = await res.json()
      setPrices(data.prices)
      setLastUpdate(new Date())
    } catch (error) {
      toast.error("Failed to refresh prices")
    }
  }

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts")
      if (!res.ok) {
        setAccounts([])
        if (res.status !== 401) {
          toast.error("Failed to load accounts")
        }
        return
      }
      const data = await res.json()
      setAccounts(Array.isArray(data) ? data : [])
    } catch (error) {
      setAccounts([])
      toast.error("Failed to load accounts")
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings")
      if (!res.ok) {
        if (res.status !== 401) {
          toast.error("Failed to load settings")
        }
        return
      }
      const data = await res.json()
      setPositionThreshold(data.positionThreshold || 20)
      setTargetAllocations(data.targetAllocations || {})
    } catch (error) {
      toast.error("Failed to load settings")
    }
  }

  const convertToHKD = (value: number, currency: string) => {
    if (currency === "USD") return value * USD_TO_HKD
    return value
  }

  // Group positions by ticker (stocks + options together)
  const groupedData = positions.reduce<Record<string, TickerGroup>>((acc, pos) => {
    // Use live price if available, otherwise fall back to avgCost
    const priceInfo = prices[pos.ticker]
    const price = priceInfo?.price || pos.avgCost || 0
    // Use price currency for conversion, fallback to account currency
    const priceCurrency = priceInfo?.currency || pos.account.currency || "USD"

    const currentValueInOriginalCurrency = pos.quantity * price
    // Convert to HKD for total calculation
    const currentValueHKD = convertToHKD(currentValueInOriginalCurrency, priceCurrency)
    const costBasisHKD = convertToHKD(pos.quantity * pos.avgCost, priceCurrency)
    const pl = currentValueHKD - costBasisHKD
    const plPercent = costBasisHKD > 0 ? (pl / costBasisHKD) * 100 : 0

    if (!acc[pos.ticker]) {
      acc[pos.ticker] = {
        ticker: pos.ticker,
        totalValue: 0,
        totalCost: 0,
        quantity: 0,
        pl: 0,
        plPercent: 0,
        positions: [],
      }
    }

    acc[pos.ticker].totalValue += currentValueHKD
    acc[pos.ticker].totalCost += costBasisHKD
    acc[pos.ticker].quantity += pos.quantity
    acc[pos.ticker].positions.push(pos)

    // Calculate aggregate P/L
    acc[pos.ticker].pl = acc[pos.ticker].totalValue - acc[pos.ticker].totalCost
    acc[pos.ticker].plPercent = acc[pos.ticker].totalCost > 0
      ? (acc[pos.ticker].pl / acc[pos.ticker].totalCost) * 100
      : 0

    return acc
  }, {})

  const tickerGroups = Object.values(groupedData)

  // Calculate total cash across all accounts (converted to HKD)
  const totalCashHKD = accounts.reduce((sum, acc) => {
    return sum + convertToHKD(acc.cashBalance, acc.currency)
  }, 0)

  // Calculate totals
  let totalValueHKD = 0
  let totalCostHKD = 0
  let hkMarketValue = 0
  let usMarketValue = 0

  tickerGroups.forEach((group) => {
    totalValueHKD += group.totalValue
    totalCostHKD += group.totalCost

    // Calculate market breakdown
    group.positions.forEach((pos) => {
      // Use live price if available, otherwise fall back to avgCost
      const priceInfo = prices[pos.ticker]
      const price = priceInfo?.price || pos.avgCost || 0
      const priceCurrency = priceInfo?.currency || pos.account.currency || "USD"

      const valueInOriginalCurrency = pos.quantity * price
      const valueInHKD = convertToHKD(valueInOriginalCurrency, priceCurrency)
      if (pos.market === "HK") {
        hkMarketValue += valueInHKD
      } else {
        usMarketValue += valueInHKD
      }
    })
  })

  // Net worth includes positions + cash
  const netWorthHKD = totalValueHKD + totalCashHKD
  const totalPL = totalValueHKD - totalCostHKD
  const totalPLPercent = totalCostHKD > 0 ? (totalPL / totalCostHKD) * 100 : 0

  const hkPercent = totalValueHKD > 0 ? (hkMarketValue / totalValueHKD) * 100 : 0
  const usPercent = totalValueHKD > 0 ? (usMarketValue / totalValueHKD) * 100 : 0
  const cashPercent = netWorthHKD > 0 ? (totalCashHKD / netWorthHKD) * 100 : 0

  // Calculate rebalancing recommendations
  const calculateRebalancing = () => {
    const recommendations = {
      sell: [] as { ticker: string; amountHKD: number; percent: number }[],
      buy: [] as { ticker: string; amountHKD: number; percent: number }[],
    }

    // Calculate current allocation for each ticker with target
    for (const [ticker, targetPercent] of Object.entries(targetAllocations)) {
      let currentValueHKD = 0
      let currentPercent = 0

      if (ticker === "CASH") {
        // Cash is special - use total cash
        currentValueHKD = totalCashHKD
        currentPercent = cashPercent
      } else {
        // Find ticker in grouped data
        const group = tickerGroups.find(g => g.ticker === ticker)
        if (group) {
          currentValueHKD = group.totalValue
          currentPercent = netWorthHKD > 0 ? (currentValueHKD / netWorthHKD) * 100 : 0
        }
      }

      const diff = targetPercent - currentPercent
      const targetValueHKD = (targetPercent / 100) * netWorthHKD
      const diffValue = targetValueHKD - currentValueHKD

      if (diffValue > 100) { // Only show if difference is significant (> HKD 100)
        recommendations.buy.push({
          ticker,
          amountHKD: diffValue,
          percent: targetPercent,
        })
      } else if (diffValue < -100) {
        recommendations.sell.push({
          ticker,
          amountHKD: Math.abs(diffValue),
          percent: targetPercent,
        })
      }
    }

    return recommendations
  }

  const rebalancing = calculateRebalancing()

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPrices()
    setRefreshing(false)
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdate.toLocaleString("en-HK", {
                timeZone: "Asia/Hong_Kong",
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })} HKT
            </p>
          )}
        </div>
        {userId && (
          <div className="flex items-center gap-2">
            {/* Layout Toggle */}
            <div className="hidden md:flex items-center border rounded-md p-1">
              <Button
                variant={chartLayout === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartLayout('grid')}
                className="h-7 px-2"
                title="4-column grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={chartLayout === 'rows' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartLayout('rows')}
                className="h-7 px-2"
                title="2-column rows"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={chartLayout === 'stack' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartLayout('stack')}
                className="h-7 px-2"
                title="Stacked"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Updating..." : "Refresh Prices"}
            </Button>
          </div>
        )}
      </div>

      {!isLoaded ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : !userId ? (
        // Redirect to landing page for unauthenticated users
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Redirecting to landing page...</p>
          <Button onClick={() => window.location.href = "/landing"}>
            Go to Landing Page
          </Button>
        </div>
      ) : (
        <>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              HKD {netWorthHKD.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Positions + Cash
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total P/L</CardTitle>
            {totalPL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalPL >= 0 ? "+" : ""}
              {totalPL.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className={`text-xs ${totalPLPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalPLPercent >= 0 ? "+" : ""}
              {totalPLPercent.toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              HKD {totalCashHKD.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {cashPercent.toFixed(0)}% of net worth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">HK Market</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hkPercent.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              HKD {hkMarketValue.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">US Market</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usPercent.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              HKD {usMarketValue.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rebalancing Recommendations */}
      {Object.keys(targetAllocations).length > 0 && (rebalancing.sell.length > 0 || rebalancing.buy.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Rebalancing Recommendations</CardTitle>
            <CardDescription>Actions to reach your target allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sell Section */}
              {rebalancing.sell.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-red-600 mb-3 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    SELL
                  </h4>
                  <div className="space-y-2">
                    {rebalancing.sell.map((item) => (
                      <div key={item.ticker} className="flex justify-between items-center text-sm p-2 bg-red-50 rounded-lg">
                        <span className="font-medium">{item.ticker}</span>
                        <span className="text-red-600">
                          Sell HKD {item.amountHKD.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          <span className="text-xs text-muted-foreground ml-2">
                            (to {item.percent}%)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buy Section */}
              {rebalancing.buy.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-green-600 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    BUY
                  </h4>
                  <div className="space-y-2">
                    {rebalancing.buy.map((item) => (
                      <div key={item.ticker} className="flex justify-between items-center text-sm p-2 bg-green-50 rounded-lg">
                        <span className="font-medium">{item.ticker}</span>
                        <span className="text-green-600">
                          {item.ticker === "CASH" ? "Add" : "Buy"} HKD {item.amountHKD.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          <span className="text-xs text-muted-foreground ml-2">
                            (to {item.percent}%)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {(rebalancing.sell.length > 0 || rebalancing.buy.length > 0) && (
              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                Total to rebalance: HKD {(rebalancing.sell.reduce((sum, item) => sum + item.amountHKD, 0) +
                  rebalancing.buy.reduce((sum, item) => sum + item.amountHKD, 0)).toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className={`grid gap-6 ${
        chartLayout === 'grid' ? 'grid-cols-1 md:grid-cols-4' :
        chartLayout === 'rows' ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1'
      }`}>
        {/* Market Allocation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Market Allocation</CardTitle>
            <CardDescription>US vs HK market breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'HK Market', value: hkMarketValue },
                    { name: 'US Market', value: usMarketValue },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip
                  formatter={(value: number) => `HKD ${value.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {hkMarketValue > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    HK Market
                  </span>
                  <span className="font-medium">
                    HKD {hkMarketValue.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    ({hkPercent.toFixed(0)}%)
                  </span>
                </div>
              )}
              {usMarketValue > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    US Market
                  </span>
                  <span className="font-medium">
                    HKD {usMarketValue.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    ({usPercent.toFixed(0)}%)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Asset Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Type Breakdown</CardTitle>
            <CardDescription>Stocks, Options, ETFs, Cash</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={(() => {
                    // Calculate asset type breakdown
                    let stockValue = 0
                    let optionValue = 0
                    let etfValue = 0

                    positions.forEach((pos) => {
                      const priceInfo = prices[pos.ticker]
                      const price = priceInfo?.price || pos.avgCost || 0
                      const priceCurrency = priceInfo?.currency || pos.account.currency || "USD"
                      const valueInHKD = convertToHKD(pos.quantity * price, priceCurrency)

                      // Check if it's an ETF (common ETF patterns)
                      const isETF = /^(QQQ|VOO|VTI|SPY|IWM|IWV|ARKK|ARKG|XLE|XLF|XLK|XLU|XLV|XLY|XLP|XLB|XLI|XLRE|GLD|SLV|TLT|QQQM|SPYM|VWO|VGK|VPL|VNQ)$/i.test(pos.ticker)

                      if (isETF) {
                        etfValue += valueInHKD
                      } else if (pos.type === "option") {
                        optionValue += valueInHKD
                      } else {
                        stockValue += valueInHKD
                      }
                    })

                    return [
                      { name: 'Stocks', value: stockValue, color: '#8b5cf6' },
                      { name: 'Options', value: optionValue, color: '#f59e0b' },
                      { name: 'ETFs', value: etfValue, color: '#06b6d4' },
                      { name: 'Cash', value: totalCashHKD, color: '#22c55e' },
                    ].filter(item => item.value > 0)
                  })()}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(() => {
                    // Calculate asset type breakdown for colors
                    let stockValue = 0
                    let optionValue = 0
                    let etfValue = 0

                    positions.forEach((pos) => {
                      const priceInfo = prices[pos.ticker]
                      const price = priceInfo?.price || pos.avgCost || 0
                      const priceCurrency = priceInfo?.currency || pos.account.currency || "USD"
                      const valueInHKD = convertToHKD(pos.quantity * price, priceCurrency)

                      const isETF = /^(QQQ|VOO|VTI|SPY|IWM|IWV|ARKK|ARKG|XLE|XLF|XLK|XLU|XLV|XLY|XLP|XLB|XLI|XLRE|GLD|SLV|TLT|QQQM|SPYM|VWO|VGK|VPL|VNQ)$/i.test(pos.ticker)

                      if (isETF) {
                        etfValue += valueInHKD
                      } else if (pos.type === "option") {
                        optionValue += valueInHKD
                      } else {
                        stockValue += valueInHKD
                      }
                    })

                    const data = [
                      stockValue > 0 ? <Cell key="stocks" fill="#8b5cf6" /> : null,
                      optionValue > 0 ? <Cell key="options" fill="#f59e0b" /> : null,
                      etfValue > 0 ? <Cell key="etfs" fill="#06b6d4" /> : null,
                      totalCashHKD > 0 ? <Cell key="cash" fill="#22c55e" /> : null,
                    ].filter(Boolean)

                    return data
                  })()}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `HKD ${value.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {(() => {
                // Calculate asset type breakdown for summary
                let stockValue = 0
                let optionValue = 0
                let etfValue = 0
                let total = totalCashHKD

                positions.forEach((pos) => {
                  const priceInfo = prices[pos.ticker]
                  const price = priceInfo?.price || pos.avgCost || 0
                  const priceCurrency = priceInfo?.currency || pos.account.currency || "USD"
                  const valueInHKD = convertToHKD(pos.quantity * price, priceCurrency)

                  const isETF = /^(QQQ|VOO|VTI|SPY|IWM|IWV|ARKK|ARKG|XLE|XLF|XLK|XLU|XLV|XLY|XLP|XLB|XLI|XLRE|GLD|SLV|TLT|QQQM|SPYM|VWO|VGK|VPL|VNQ)$/i.test(pos.ticker)

                  if (isETF) {
                    etfValue += valueInHKD
                  } else if (pos.type === "option") {
                    optionValue += valueInHKD
                  } else {
                    stockValue += valueInHKD
                  }
                  total += valueInHKD
                })

                const items = []
                if (stockValue > 0) {
                  items.push(
                    <div key="stocks" className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        Stocks
                      </span>
                      <span className="font-medium">
                        HKD {stockValue.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        ({((stockValue / total) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  )
                }
                if (optionValue > 0) {
                  items.push(
                    <div key="options" className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        Options
                      </span>
                      <span className="font-medium">
                        HKD {optionValue.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        ({((optionValue / total) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  )
                }
                if (etfValue > 0) {
                  items.push(
                    <div key="etfs" className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                        ETFs
                      </span>
                      <span className="font-medium">
                        HKD {etfValue.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        ({((etfValue / total) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  )
                }
                if (totalCashHKD > 0) {
                  items.push(
                    <div key="cash" className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        Cash
                      </span>
                      <span className="font-medium">
                        HKD {totalCashHKD.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        ({((totalCashHKD / total) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  )
                }
                return items
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Account Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Account Breakdown</CardTitle>
            <CardDescription>Value by broker account</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={(() => {
                    // Calculate account breakdown
                    const accountValues: Record<string, number> = {}

                    positions.forEach((pos) => {
                      const priceInfo = prices[pos.ticker]
                      const price = priceInfo?.price || pos.avgCost || 0
                      const priceCurrency = priceInfo?.currency || pos.account.currency || "USD"
                      const valueInHKD = convertToHKD(pos.quantity * price, priceCurrency)

                      const accountName = pos.account.name
                      if (!accountValues[accountName]) {
                        accountValues[accountName] = 0
                      }
                      accountValues[accountName] += valueInHKD
                    })

                    return Object.entries(accountValues)
                      .map(([name, value]) => ({ name, value }))
                      .sort((a, b) => b.value - a.value)
                  })()}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#f97316" />
                  <Cell fill="#eab308" />
                  <Cell fill="#22c55e" />
                  <Cell fill="#06b6d4" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#8b5cf6" />
                  <Cell fill="#d946ef" />
                </Pie>
                <Tooltip
                  formatter={(value: number) => `HKD ${value.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {(() => {
                // Calculate account breakdown for summary
                const accountValues: Record<string, number> = {}
                let total = 0

                positions.forEach((pos) => {
                  const priceInfo = prices[pos.ticker]
                  const price = priceInfo?.price || pos.avgCost || 0
                  const priceCurrency = priceInfo?.currency || pos.account.currency || "USD"
                  const valueInHKD = convertToHKD(pos.quantity * price, priceCurrency)

                  const accountName = pos.account.name
                  if (!accountValues[accountName]) {
                    accountValues[accountName] = 0
                  }
                  accountValues[accountName] += valueInHKD
                  total += valueInHKD
                })

                const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 'bg-fuchsia-500']

                return Object.entries(accountValues)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, value], index) => (
                    <div key={name} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></span>
                        {name}
                      </span>
                      <span className="font-medium">
                        HKD {value.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        ({((value / total) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Top Holdings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Holdings</CardTitle>
            <CardDescription>Largest positions by % of net worth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={(() => {
                    // Get top holdings, group rest as "Others"
                    const sortedHoldings = [...tickerGroups]
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .map(group => ({
                        name: group.ticker,
                        value: group.totalValue,
                        percent: netWorthHKD > 0 ? (group.totalValue / netWorthHKD) * 100 : 0
                      }))

                    // Show top 8 individually, group rest as "Others"
                    const topHoldings = sortedHoldings.slice(0, 8)
                    const othersValue = sortedHoldings.slice(8).reduce((sum, h) => sum + h.value, 0)

                    const chartData = [...topHoldings]
                    if (othersValue > 0) {
                      chartData.push({
                        name: 'Others',
                        value: othersValue,
                        percent: netWorthHKD > 0 ? (othersValue / netWorthHKD) * 100 : 0
                      })
                    }

                    return chartData.filter(item => item.value > 0)
                  })()}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {(() => {
                    const colors = [
                      '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
                      '#3b82f6', '#8b5cf6', '#d946ef', '#94a3b8'
                    ]
                    return colors.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))
                  })()}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `HKD ${value.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {(() => {
                const sortedHoldings = [...tickerGroups]
                  .sort((a, b) => b.totalValue - a.totalValue)
                  .map(group => ({
                    ticker: group.ticker,
                    value: group.totalValue,
                    percent: netWorthHKD > 0 ? (group.totalValue / netWorthHKD) * 100 : 0
                  }))

                const colors = [
                  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
                  'bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-slate-400'
                ]

                const topHoldings = sortedHoldings.slice(0, 8)
                const othersValue = sortedHoldings.slice(8).reduce((sum, h) => sum + h.value, 0)
                const othersPercent = netWorthHKD > 0 ? (othersValue / netWorthHKD) * 100 : 0

                const items = topHoldings.map((holding, index) => (
                  <div key={holding.ticker} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></span>
                      {holding.ticker}
                    </span>
                    <span className="font-medium">
                      {holding.percent.toFixed(0)}%
                    </span>
                  </div>
                ))

                if (othersValue > 0) {
                  items.push(
                    <div key="others" className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                        Others ({sortedHoldings.length - 8} more)
                      </span>
                      <span className="font-medium">
                        {othersPercent.toFixed(0)}%
                      </span>
                    </div>
                  )
                }

                return items
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings by Ticker */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings by Ticker</CardTitle>
          <CardDescription>Stocks and options combined by ticker</CardDescription>
        </CardHeader>
        <CardContent>
          {tickerGroups.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No positions yet. <a href="/manual" className="text-blue-500 hover:underline">Add your first position</a>.
            </p>
          ) : (
            <div className="space-y-4">
              {tickerGroups
                .sort((a, b) => b.totalValue - a.totalValue)
                .map((group) => {
                  // Calculate position size as % of net worth (positions + cash)
                  const percentOfTotal = netWorthHKD > 0 ? (group.totalValue / netWorthHKD) * 100 : 0
                  // Get current price and currency
                  const currentPrice = prices[group.ticker]?.price || group.positions[0]?.avgCost || 0
                  const priceCurrency = prices[group.ticker]?.currency || group.positions[0]?.account.currency || "HKD"

                  // Determine alert level
                  const isOverThreshold = percentOfTotal >= positionThreshold
                  const isNearThreshold = percentOfTotal >= positionThreshold * 0.8 && percentOfTotal < positionThreshold

                  // Calculate target comparison
                  const targetPercent = targetAllocations[group.ticker]
                  const targetDiff = targetPercent !== undefined ? targetPercent - percentOfTotal : null
                  const isOverTarget = targetDiff !== null && targetDiff < -1 // Overweight by > 1%
                  const isUnderTarget = targetDiff !== null && targetDiff > 1 // Underweight by > 1%

                  return (
                    <div key={group.ticker} className={`border rounded-lg ${isOverThreshold ? "border-red-300 bg-red-50/50" : ""}`}>
                      {/* Main ticker row */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-lg">{group.ticker}</span>
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              {priceCurrency} {currentPrice.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              isOverThreshold
                                ? "bg-red-500 text-white"
                                : isNearThreshold
                                ? "bg-yellow-500 text-white"
                                : "bg-secondary"
                            }`}>
                              {percentOfTotal.toFixed(0)}% of portfolio
                            </span>
                            {/* Position Alert Badge */}
                            {isOverThreshold && (
                              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Over threshold
                              </span>
                            )}
                            {targetDiff !== null && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                isOverTarget
                                  ? "bg-red-100 text-red-700 border border-red-300"
                                  : isUnderTarget
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : "bg-gray-100 text-gray-700 border border-gray-300"
                              }`}>
                                Target: {targetPercent}% ({targetDiff > 0 ? '+' : ''}{targetDiff.toFixed(1)}%)
                              </span>
                            )}
                            {/* Asset Type Badge */}
                            {(() => {
                              const isETF = /^(QQQ|VOO|VTI|SPY|IWM|IWV|ARKK|ARKG|XLE|XLF|XLK|XLU|XLV|XLY|XLP|XLB|XLI|XLRE|GLD|SLV|TLT|QQQM|SPYM|VWO|VGK|VPL|VNQ)$/i.test(group.ticker)
                              const hasOptions = group.positions.some(p => p.type === "option")

                              if (hasOptions) {
                                return <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded">Option</span>
                              } else if (isETF) {
                                return <span className="text-xs bg-cyan-500 text-white px-2 py-1 rounded">ETF</span>
                              } else {
                                return <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">Stock</span>
                              }
                            })()}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {group.quantity} shares/contracts
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            HKD {group.totalValue.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </div>
                          <div className={`text-sm ${group.pl >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {group.pl >= 0 ? "+" : ""}
                            {group.pl.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (
                            {group.plPercent >= 0 ? "+" : ""}
                            {group.plPercent.toFixed(0)}%)
                          </div>
                        </div>
                      </div>

                      {/* Option contracts list */}
                      {group.positions.some(p => p.type === "option") && (
                        <div className="border-t bg-muted/30">
                          <button
                            onClick={() => toggleTickerExpansion(group.ticker)}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-sm font-medium flex items-center gap-2">
                              {expandedTickers.has(group.ticker) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              Option Contracts ({group.positions.filter(p => p.type === "option").length})
                            </span>
                          </button>
                          {expandedTickers.has(group.ticker) && (
                            <div className="px-4 pb-4">
                              <div className="space-y-3">
                            {group.positions.filter(p => p.type === "option").map((pos) => {
                              const posPriceInfo = prices[pos.ticker]
                              const posPrice = posPriceInfo?.price || pos.avgCost || 0
                              const posCurrency = posPriceInfo?.currency || pos.account.currency || "USD"
                              const posValueHKD = convertToHKD(pos.quantity * posPrice, posCurrency)

                              return (
                                <div key={pos.id} className="bg-background border rounded-lg p-3">
                                  {/* Mobile: Card layout */}
                                  <div className="grid grid-cols-2 gap-2 text-sm md:hidden">
                                    <div className="text-muted-foreground">Type</div>
                                    <div className="font-medium capitalize text-right">{pos.optionType}</div>

                                    <div className="text-muted-foreground">Strike</div>
                                    <div className="font-medium text-right">${pos.strike}</div>

                                    <div className="text-muted-foreground">Expiry</div>
                                    <div className="font-medium text-right">{pos.expiry ? new Date(pos.expiry).toLocaleDateString() : "-"}</div>

                                    <div className="text-muted-foreground">Quantity</div>
                                    <div className="font-medium text-right">{pos.quantity}</div>

                                    <div className="text-muted-foreground">Avg Cost</div>
                                    <div className="font-medium text-right">
                                      {pos.account.currency === "HKD" ? "HKD " : "$"}
                                      {pos.avgCost.toFixed(0)}
                                    </div>

                                    <div className="text-muted-foreground">Value</div>
                                    <div className="font-medium text-right">
                                      HKD {posValueHKD.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                  </div>

                                  {/* Desktop: Table layout */}
                                  <table className="w-full text-sm hidden md:table">
                                    <tbody>
                                      <tr className="border-b">
                                        <td className="py-2 text-muted-foreground w-20">Type</td>
                                        <td className="py-2 font-medium capitalize">{pos.optionType}</td>
                                        <td className="py-2 text-muted-foreground w-20">Strike</td>
                                        <td className="py-2 font-medium">${pos.strike}</td>
                                        <td className="py-2 text-muted-foreground w-20">Expiry</td>
                                        <td className="py-2 font-medium">{pos.expiry ? new Date(pos.expiry).toLocaleDateString() : "-"}</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 text-muted-foreground">Quantity</td>
                                        <td className="py-2 font-medium">{pos.quantity}</td>
                                        <td className="py-2 text-muted-foreground">Avg Cost</td>
                                        <td className="py-2 font-medium">
                                          {pos.account.currency === "HKD" ? "HKD " : "$"}
                                          {pos.avgCost.toFixed(0)}
                                        </td>
                                        <td className="py-2 text-muted-foreground">Value (HKD)</td>
                                        <td className="py-2 font-medium">
                                          HKD {posValueHKD.toLocaleString("zh-HK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              )
                            })}
                            </div>
                          </div>
                          )}
                        </div>
                      )}

                      {/* TradingView Chart Link */}
                      <div className="border-t">
                        <a
                          href={`https://www.tradingview.com/chart/?symbol=${getTradingViewSymbol(group.ticker, group.positions[0]?.market || 'US')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                        >
                          <span className="text-sm font-medium flex items-center gap-2">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="M3 9h18M9 21V9" />
                            </svg>
                            TradingView Chart
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            View on TradingView
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M7 17L17 7M7 7h10m-3 5l5-5" />
                            </svg>
                          </span>
                        </a>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </div>
  )
}
