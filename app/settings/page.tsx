"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Key, Check, Eye, EyeOff, Loader2, XCircle, CheckCircle, Wallet, AlertTriangle } from "lucide-react"

interface Account {
  id: string
  name: string
  currency: string
  cashBalance: number
}

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Cash balance state
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [updatingAccountId, setUpdatingAccountId] = useState<string | null>(null)
  const [cashBalances, setCashBalances] = useState<Record<string, string>>({})

  // Position threshold state
  const [positionThreshold, setPositionThreshold] = useState(20)
  const [loadingThreshold, setLoadingThreshold] = useState(true)
  const [savingThreshold, setSavingThreshold] = useState(false)
  const [thresholdSaved, setThresholdSaved] = useState(false)

  useEffect(() => {
    // Load saved key from localStorage
    const savedKey = localStorage.getItem("api_key")
    if (savedKey) {
      setApiKey(savedKey)
    }

    // Load accounts and settings
    fetchAccounts()
    fetchSettings()
  }, [])

  const fetchAccounts = async () => {
    setLoadingAccounts(true)
    try {
      const res = await fetch("/api/accounts")
      const data = await res.json()
      setAccounts(data)

      // Initialize cash balances state
      const initialBalances: Record<string, string> = {}
      data.forEach((acc: Account) => {
        initialBalances[acc.id] = acc.cashBalance.toString()
      })
      setCashBalances(initialBalances)
    } catch (error) {
      console.error("Error fetching accounts:", error)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const fetchSettings = async () => {
    setLoadingThreshold(true)
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setPositionThreshold(data.positionThreshold)
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoadingThreshold(false)
    }
  }

  const handleUpdateCashBalance = async (accountId: string) => {
    const cashBalance = parseFloat(cashBalances[accountId])
    if (isNaN(cashBalance)) return

    setUpdatingAccountId(accountId)
    try {
      const res = await fetch("/api/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: accountId, cashBalance }),
      })

      if (res.ok) {
        // Update local state
        setAccounts(accounts.map(acc =>
          acc.id === accountId ? { ...acc, cashBalance } : acc
        ))
      }
    } catch (error) {
      console.error("Error updating cash balance:", error)
      alert("Failed to update cash balance")
    } finally {
      setUpdatingAccountId(null)
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
      alert("Failed to save threshold")
    } finally {
      setSavingThreshold(false)
    }
  }

  const handleSave = () => {
    localStorage.setItem("api_key", apiKey)
    setSaved(true)
    setTestResult(null) // Clear previous test result
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    setApiKey("")
    localStorage.removeItem("api_key")
    setTestResult(null)
  }

  const handleTest = async () => {
    if (!apiKey) return

    setTesting(true)
    setTestResult(null)

    try {
      const res = await fetch("/api/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })

      const data = await res.json()

      if (res.ok) {
        setTestResult({ success: true, message: "API key is valid and working!" })
      } else {
        setTestResult({ success: false, message: data.error || "Invalid API key" })
      }
    } catch (error) {
      setTestResult({ success: false, message: "Failed to connect. Try again." })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <a href="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </a>
        <h2 className="text-3xl font-bold">Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenRouter API Key
          </CardTitle>
          <CardDescription>
            Add your OpenRouter API key to enable screenshot OCR for automatic position extraction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value)
                    setTestResult(null)
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleSave} disabled={!apiKey || saved}>
                {saved ? (
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
              Your key is stored locally in your browser and never sent to any server except OpenAI.
            </p>
          </div>

          {apiKey && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleTest} disabled={testing || !apiKey}>
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Key"
                )}
              </Button>
              <Button variant="ghost" onClick={handleClear}>
                Clear Key
              </Button>
            </div>
          )}

          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                testResult.success
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an API key? Get one at{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                openrouter.ai
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cash Balance Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Cash Balance Management
          </CardTitle>
          <CardDescription>
            Manage cash balances for each broker account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingAccounts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accounts found. Create an account first.</p>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor={`cash-${account.id}`} className="text-base">
                      {account.name} ({account.currency})
                    </Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id={`cash-${account.id}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={cashBalances[account.id] || ""}
                        onChange={(e) =>
                          setCashBalances((prev) => ({ ...prev, [account.id]: e.target.value }))
                        }
                        className="max-w-xs"
                      />
                      <Button
                        onClick={() => handleUpdateCashBalance(account.id)}
                        disabled={
                          updatingAccountId === account.id ||
                          !cashBalances[account.id] ||
                          parseFloat(cashBalances[account.id]) === account.cashBalance
                        }
                      >
                        {updatingAccountId === account.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: {account.cashBalance.toFixed(2)} {account.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  )
}
