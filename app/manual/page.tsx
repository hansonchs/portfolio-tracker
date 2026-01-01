"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { ArrowLeft, PlusCircle, CheckCircle, LogIn } from "lucide-react"

interface Account {
  id: string
  name: string
  currency: string
}

export default function ManualPage() {
  const { isLoaded, userId } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [positionForm, setPositionForm] = useState({
    ticker: "",
    type: "stock",
    quantity: "",
    avgCost: "",
    market: "US",
    cashCurrency: "HKD",
    cashAmount: "",
    strike: "",
    expiry: "",
    optionType: "call",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts")
      const data = await res.json()
      setAccounts(data)
      if (data.length > 0) {
        setPositionForm((prev) => ({ ...prev, accountId: data[0].id }))
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      if (positionForm.type === "cash") {
        // Find account with matching currency, or create one
        let account = accounts.find((acc) => acc.currency === positionForm.cashCurrency)

        if (!account) {
          // Create new account for this currency
          const createRes = await fetch("/api/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: `${positionForm.cashCurrency} Account`,
              currency: positionForm.cashCurrency,
            }),
          })
          if (!createRes.ok) {
            throw new Error("Failed to create account")
          }
          account = await createRes.json()
        }

        const currentCash = account?.cashBalance || 0
        const newCashBalance = currentCash + parseFloat(positionForm.cashAmount)

        const res = await fetch("/api/accounts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: account.id,
            cashBalance: newCashBalance,
          }),
        })

        if (!res.ok) {
          throw new Error("Failed to update cash balance")
        }
      } else {
        // Create stock/option position
        const payload = {
          ticker: positionForm.ticker.toUpperCase(),
          type: positionForm.type,
          quantity: parseFloat(positionForm.quantity),
          avgCost: parseFloat(positionForm.avgCost),
          market: positionForm.market,
          ...(positionForm.type === "option" && {
            strike: parseFloat(positionForm.strike),
            expiry: positionForm.expiry || null,
            optionType: positionForm.optionType,
          }),
        }

        const res = await fetch("/api/positions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          throw new Error("Failed to save position")
        }
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/positions"
      }, 1500)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to save. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <a href="/positions" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </a>
        <h2 className="text-3xl font-bold">Add Position</h2>
      </div>

      {!isLoaded ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : !userId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <LogIn className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Sign In Required</h3>
            <p className="text-muted-foreground text-center">
              You need to sign in to add positions to your portfolio.
            </p>
            <Button onClick={() => window.location.href = "/sign-in"}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add Position Manually</CardTitle>
            <CardDescription>
              Add stock, option, or cash position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  id="type"
                  value={positionForm.type}
                  onChange={(e) => setPositionForm({ ...positionForm, type: e.target.value })}
                  required
                >
                  <option value="stock">Stock</option>
                  <option value="option">Option</option>
                  <option value="cash">Cash</option>
                </Select>
              </div>

              {positionForm.type === "cash" ? (
                <>
                  <div>
                    <Label htmlFor="cashCurrency">Currency</Label>
                    <Select
                      id="cashCurrency"
                      value={positionForm.cashCurrency}
                      onChange={(e) => setPositionForm({ ...positionForm, cashCurrency: e.target.value })}
                      required
                    >
                      <option value="HKD">HKD</option>
                      <option value="USD">USD</option>
                    </Select>
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="ticker">Ticker Symbol</Label>
                  <Input
                    id="ticker"
                    placeholder="e.g., AAPL or 00700"
                    value={positionForm.ticker}
                    onChange={(e) => setPositionForm({ ...positionForm, ticker: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              )}
            </div>

            {positionForm.type === "cash" ? (
              <div>
                <Label htmlFor="cashAmount">Cash Amount</Label>
                <Input
                  id="cashAmount"
                  type="number"
                  step="any"
                  placeholder="e.g., 10000"
                  value={positionForm.cashAmount}
                  onChange={(e) => setPositionForm({ ...positionForm, cashAmount: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be added to the selected account's current cash balance.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="any"
                      placeholder="e.g., 100"
                      value={positionForm.quantity}
                      onChange={(e) => setPositionForm({ ...positionForm, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="avgCost">
                      Average Cost {positionForm.market === "HK" ? "(HKD)" : "(USD)"}
                    </Label>
                    <Input
                      id="avgCost"
                      type="number"
                      step="any"
                      placeholder={positionForm.market === "HK" ? "e.g., 400.00" : "e.g., 150.00"}
                      value={positionForm.avgCost}
                      onChange={(e) => setPositionForm({ ...positionForm, avgCost: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="market">Market</Label>
                  <Select
                    id="market"
                    value={positionForm.market}
                    onChange={(e) => setPositionForm({ ...positionForm, market: e.target.value })}
                    required
                  >
                    <option value="US">US Market</option>
                    <option value="HK">Hong Kong Market</option>
                  </Select>
                </div>
              </>
            )}

            {positionForm.type === "option" && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">Option Details</p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="optionType">Option Type</Label>
                    <Select
                      id="optionType"
                      value={positionForm.optionType}
                      onChange={(e) => setPositionForm({ ...positionForm, optionType: e.target.value })}
                      required
                    >
                      <option value="call">Call</option>
                      <option value="put">Put</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="strike">Strike Price</Label>
                    <Input
                      id="strike"
                      type="number"
                      step="any"
                      placeholder="e.g., 150"
                      value={positionForm.strike}
                      onChange={(e) => setPositionForm({ ...positionForm, strike: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiry">Expiration Date</Label>
                    <Input
                      id="expiry"
                      type="date"
                      value={positionForm.expiry}
                      onChange={(e) => setPositionForm({ ...positionForm, expiry: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || success}
              className="w-full"
              size="lg"
            >
              {loading ? (
                "Saving..."
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved! Redirecting...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Position
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
