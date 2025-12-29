"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2, Edit2, Check, X } from "lucide-react"

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
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    ticker: "",
    quantity: "",
    avgCost: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [posRes, accRes] = await Promise.all([
        fetch("/api/positions"),
        fetch("/api/accounts"),
      ])
      setPositions(await posRes.json())
      setAccounts(await accRes.json())
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return

    try {
      await fetch(`/api/positions?id=${id}`, { method: "DELETE" })
      setPositions(positions.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error deleting position:", error)
    }
  }

  const handleEdit = (position: Position) => {
    setEditingId(position.id)
    setEditForm({
      ticker: position.ticker,
      quantity: position.quantity.toString(),
      avgCost: position.avgCost.toString(),
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ ticker: "", quantity: "", avgCost: "" })
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch("/api/positions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...editForm,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setPositions(positions.map((p) => (p.id === id ? updated : p)))
        setEditingId(null)
      }
    } catch (error) {
      console.error("Error updating position:", error)
    }
  }

  const getAssetCategory = (ticker: string, type: string) => {
    const isETF = /^(QQQ|VOO|VTI|SPY|IWM|IWV|ARKK|ARKG|XLE|XLF|XLK|XLU|XLV|XLY|XLP|XLB|XLI|XLRE|GLD|SLV|TLT|QQQM|SPYM|VWO|VGK|VPL|VNQ)$/i.test(ticker)

    if (type === "option") {
      return { label: "Option", color: "bg-amber-500 text-white" }
    } else if (isETF) {
      return { label: "ETF", color: "bg-cyan-500 text-white" }
    } else {
      return { label: "Stock", color: "bg-purple-500 text-white" }
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </a>
          <h2 className="text-3xl font-bold">Positions</h2>
        </div>
        <div className="flex gap-2">
          <a href="/manual">
            <Button>Add Position</Button>
          </a>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Positions</CardTitle>
          <CardDescription>
            {positions.length} position{positions.length !== 1 ? "s" : ""} across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No positions yet. <a href="/manual" className="text-blue-500 hover:underline">Add your first position</a>.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Avg Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    {editingId === position.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={editForm.ticker}
                            onChange={(e) => setEditForm({ ...editForm, ticker: e.target.value.toUpperCase() })}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>{position.account.name}</TableCell>
                        <TableCell>
                          <Badge variant={position.type === "stock" ? "default" : "secondary"}>
                            {position.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{position.market}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="any"
                            value={editForm.quantity}
                            onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="any"
                            value={editForm.avgCost}
                            onChange={(e) => setEditForm({ ...editForm, avgCost: e.target.value })}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveEdit(position.id)}
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{position.ticker}</TableCell>
                        <TableCell>{position.account.name}</TableCell>
                        <TableCell>
                          <Badge className={getAssetCategory(position.ticker, position.type).color}>
                            {getAssetCategory(position.ticker, position.type).label}
                          </Badge>
                          {position.type === "option" && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {position.optionType} ${position.strike}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{position.market}</TableCell>
                        <TableCell>{position.quantity}</TableCell>
                        <TableCell>
                          {position.account.currency === "HKD" ? "HKD " : "$"}
                          {position.avgCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(position)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(position.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
