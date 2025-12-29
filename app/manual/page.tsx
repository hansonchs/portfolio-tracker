"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { ArrowLeft, PlusCircle, CheckCircle } from "lucide-react"

interface Account {
  id: string
  name: string
  currency: string
}

export default function ManualPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [formData, setFormData] = useState({
    accountId: "",
    ticker: "",
    type: "stock",
    quantity: "",
    avgCost: "",
    market: "US",
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
        setFormData((prev) => ({ ...prev, accountId: data[0].id }))
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
      const payload = {
        accountId: formData.accountId,
        ticker: formData.ticker.toUpperCase(),
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        avgCost: parseFloat(formData.avgCost),
        market: formData.market,
        ...(formData.type === "option" && {
          strike: parseFloat(formData.strike),
          expiry: formData.expiry || null,
          optionType: formData.optionType,
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

      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    } catch (error) {
      console.error("Error saving position:", error)
      alert("Failed to save position. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <a href="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </a>
        <h2 className="text-3xl font-bold">Manual Entry</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Position Manually</CardTitle>
          <CardDescription>
            Enter position details manually if OCR is not available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="account">Account</Label>
              <Select
                id="account"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                required
              >
                {accounts.length === 0 ? (
                  <option value="">No accounts available</option>
                ) : (
                  accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))
                )}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticker">Ticker Symbol</Label>
                <Input
                  id="ticker"
                  placeholder="e.g., AAPL or 00700"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="stock">Stock</option>
                  <option value="option">Option</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  placeholder="e.g., 100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="avgCost">
                  Average Cost {formData.market === "HK" ? "(HKD)" : "(USD)"}
                </Label>
                <Input
                  id="avgCost"
                  type="number"
                  step="any"
                  placeholder={formData.market === "HK" ? "e.g., 400.00" : "e.g., 150.00"}
                  value={formData.avgCost}
                  onChange={(e) => setFormData({ ...formData, avgCost: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="market">Market</Label>
              <Select
                id="market"
                value={formData.market}
                onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                required
              >
                <option value="US">US Market</option>
                <option value="HK">Hong Kong Market</option>
              </Select>
            </div>

            {formData.type === "option" && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">Option Details</p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="optionType">Option Type</Label>
                    <Select
                      id="optionType"
                      value={formData.optionType}
                      onChange={(e) => setFormData({ ...formData, optionType: e.target.value })}
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
                      value={formData.strike}
                      onChange={(e) => setFormData({ ...formData, strike: e.target.value })}
                      required={formData.type === "option"}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiry">Expiration Date</Label>
                    <Input
                      id="expiry"
                      type="date"
                      value={formData.expiry}
                      onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
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
    </div>
  )
}
