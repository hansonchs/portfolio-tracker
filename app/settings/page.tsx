"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { ArrowLeft, AlertTriangle, Loader2, Check, Plus, Trash2, Target } from "lucide-react"

interface TargetAllocation {
  ticker: string
  target: number
  current?: number
}

interface PositionData {
  ticker: string
  valueHKD: number
  percent: number
}

export default function SettingsPage() {

  // Position threshold state
  const [positionThreshold, setPositionThreshold] = useState(20)
  const [loadingThreshold, setLoadingThreshold] = useState(true)
  const [savingThreshold, setSavingThreshold] = useState(false)
  const [thresholdSaved, setThresholdSaved] = useState(false)

  // Target allocations state
  const [targets, setTargets] = useState<TargetAllocation[]>([])
  const [newTicker, setNewTicker] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [loadingTargets, setLoadingTargets] = useState(true)
  const [savingTargets, setSavingTargets] = useState(false)
  const [targetsSaved, setTargetsSaved] = useState(false)
  const [currentAllocations, setCurrentAllocations] = useState<PositionData[]>([])
  const [isCustomTicker, setIsCustomTicker] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchCurrentAllocations()
  }, [])

  const fetchSettings = async () => {
    setLoadingThreshold(true)
    setLoadingTargets(true)
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setPositionThreshold(data.positionThreshold)

      // Parse targetAllocations into array
      if (data.targetAllocations) {
        const targetList = Object.entries(data.targetAllocations).map(([ticker, target]) => ({
          ticker,
          target: target as number,
        }))
        setTargets(targetList)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoadingThreshold(false)
      setLoadingTargets(false)
    }
  }

  const fetchCurrentAllocations = async () => {
    try {
      const res = await fetch("/api/positions")
      const positions = await res.json()

      // Get prices for positions
      const tickers = [...new Set(positions.map((p: any) => p.ticker))]
      const priceRes = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers }),
      })
      const priceData = await priceRes.json()
      const prices = priceData.prices

      // Group by ticker and calculate values
      const USD_TO_HKD = 7.8
      const allocations: Record<string, { valueHKD: number; percent: number }> = {}

      let totalValueHKD = 0

      positions.forEach((pos: any) => {
        const priceInfo = prices[pos.ticker]
        const price = priceInfo?.price || pos.avgCost || 0
        const currency = priceInfo?.currency || pos.account.currency || "USD"
        const valueHKD = currency === "USD" ? pos.quantity * price * USD_TO_HKD : pos.quantity * price

        if (!allocations[pos.ticker]) {
          allocations[pos.ticker] = { valueHKD: 0, percent: 0 }
        }
        allocations[pos.ticker].valueHKD += valueHKD
        totalValueHKD += valueHKD
      })

      // Calculate percentages
      const allocationList = Object.entries(allocations).map(([ticker, data]) => ({
        ticker,
        valueHKD: data.valueHKD,
        percent: totalValueHKD > 0 ? (data.valueHKD / totalValueHKD) * 100 : 0,
      }))

      setCurrentAllocations(allocationList)

      // Update current values in targets
      setTargets(prev => prev.map(t => ({
        ...t,
        current: allocations[t.ticker]?.percent || 0,
      })))

      console.log("Current allocations loaded:", allocationList.map(a => `${a.ticker}: ${a.percent.toFixed(1)}%`))
    } catch (error) {
      console.error("Error fetching allocations:", error)
    }
  }

  const handleSaveThreshold = async () => {
    setSavingThreshold(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionThreshold }),
      })

      if (res.ok) {
        setThresholdSaved(true)
        setTimeout(() => setThresholdSaved(false), 2000)
      }
    } catch (error) {
      console.error("Error saving threshold:", error)
      toast.error("Failed to save threshold")
    } finally {
      setSavingThreshold(false)
    }
  }

  const handleSaveTargets = async () => {
    setSavingTargets(true)
    try {
      // Convert targets array to object
      const targetObj: Record<string, number> = {}
      targets.forEach(t => {
        targetObj[t.ticker] = t.target
      })

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAllocations: targetObj }),
      })

      if (res.ok) {
        setTargetsSaved(true)
        setTimeout(() => setTargetsSaved(false), 2000)
      }
    } catch (error) {
      console.error("Error saving targets:", error)
      toast.error("Failed to save targets")
    } finally {
      setSavingTargets(false)
    }
  }

  const handleAddTarget = () => {
    if (!newTicker || !newTarget) return

    let ticker = newTicker.toUpperCase()
    const target = parseFloat(newTarget)

    if (isNaN(target) || target <= 0 || target > 100) {
      toast.error("Target must be between 0 and 100")
      return
    }

    // Check if ticker already exists
    if (targets.find(t => t.ticker === ticker)) {
      toast.error(`Ticker ${ticker} already exists`)
      return
    }

    const current = currentAllocations.find(a => a.ticker === ticker)?.percent || 0

    setTargets([...targets, { ticker, target, current }])
    setNewTicker("")
    setNewTarget("")
    setIsCustomTicker(false)
    toast.success(`Added ${ticker} with target ${target}%`)
  }

  const handleTickerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === "__custom__") {
      setIsCustomTicker(true)
      setNewTicker("")
    } else {
      setIsCustomTicker(false)
      setNewTicker(value)
    }
  }

  const handleRemoveTarget = (ticker: string) => {
    setTargets(targets.filter(t => t.ticker !== ticker))
  }

  const handleUpdateTarget = (ticker: string, newTarget: number) => {
    setTargets(targets.map(t =>
      t.ticker === ticker ? { ...t, target: newTarget } : t
    ))
  }

  const getTotalTarget = () => {
    return targets.reduce((sum, t) => sum + t.target, 0)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <a href="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </a>
        <h2 className="text-3xl font-bold">Settings</h2>
      </div>

      {/* Position Size Alert Threshold */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Position Size Alert Threshold
          </CardTitle>
          <CardDescription>
            Set the threshold for position size alerts. Holdings exceeding this percentage of your portfolio will be highlighted on the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingThreshold ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="threshold" className="text-base">
                  Alert Threshold (%)
                </Label>
                <div className="mt-2 flex gap-2 items-center">
                  <Input
                    id="threshold"
                    type="number"
                    min="5"
                    max="50"
                    step="1"
                    value={positionThreshold}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      if (!isNaN(val) && val >= 5 && val <= 50) {
                        setPositionThreshold(val)
                      }
                    }}
                    className="max-w-xs"
                  />
                  <Button
                    onClick={handleSaveThreshold}
                    disabled={savingThreshold || thresholdSaved}
                  >
                    {savingThreshold ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : thresholdSaved ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Range: 5% - 50%. Current value: {positionThreshold}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Target Allocation
          </CardTitle>
          <CardDescription>
            Set target percentage for each ticker. Dashboard will show current vs target and rebalancing recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingTargets ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Add new target */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="newTicker">Ticker</Label>
                  {!isCustomTicker ? (
                    <Select
                      id="newTicker"
                      value={newTicker}
                      onChange={handleTickerChange}
                      className="mt-1"
                    >
                      <option value="" disabled>Select a ticker...</option>
                      {currentAllocations
                        .filter(a => !targets.find(t => t.ticker === a.ticker))
                        .sort((a, b) => b.valueHKD - a.valueHKD)
                        .map(a => (
                          <option key={a.ticker} value={a.ticker}>
                            {a.ticker} (Current: {a.percent.toFixed(1)}%)
                          </option>
                        ))}
                      {!targets.find(t => t.ticker === "CASH") && (
                        <option value="CASH">CASH (Cash allocation)</option>
                      )}
                      <option value="__custom__">+ Custom ticker...</option>
                    </Select>
                  ) : (
                    <Input
                      id="newTicker"
                      placeholder="e.g., BTC or new ticker"
                      value={newTicker}
                      onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                      className="mt-1"
                    />
                  )}
                </div>
                <div className="w-24">
                  <Label htmlFor="newTarget">Target %</Label>
                  <Input
                    id="newTarget"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="10"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleAddTarget}
                  disabled={!newTicker || !newTarget}
                  className="mb-0.5"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Targets list */}
              {targets.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Ticker</th>
                        <th className="px-4 py-2 text-left">Target %</th>
                        <th className="px-4 py-2 text-left">Current %</th>
                        <th className="px-4 py-2 text-left">Diff</th>
                        <th className="px-4 py-2 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {targets.map((t) => {
                        const diff = t.target - (t.current || 0)
                        return (
                          <tr key={t.ticker} className="border-t">
                            <td className="px-4 py-2 font-medium">{t.ticker}</td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={t.target}
                                onChange={(e) => handleUpdateTarget(t.ticker, parseFloat(e.target.value) || 0)}
                                className="w-20 h-8"
                              />
                            </td>
                            <td className="px-4 py-2">{t.current?.toFixed(1) || 0}%</td>
                            <td className={`px-4 py-2 ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : ''}`}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                            </td>
                            <td className="px-4 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTarget(t.ticker)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Total and validation */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                Math.abs(getTotalTarget() - 100) < 0.1
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className="font-medium">
                  Total Target: {getTotalTarget().toFixed(1)}%
                </span>
                {Math.abs(getTotalTarget() - 100) >= 0.1 && (
                  <span className="text-sm">
                    ⚠️ Should equal 100%
                  </span>
                )}
              </div>

              {/* Save button */}
              <Button
                onClick={handleSaveTargets}
                disabled={savingTargets || targetsSaved}
                className="w-full"
              >
                {savingTargets ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : targetsSaved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  "Save Targets"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
