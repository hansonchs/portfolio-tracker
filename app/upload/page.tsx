"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, ArrowLeft, CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react"

interface ExtractedPosition {
  ticker: string
  quantity: number
  avgCost: number
  type: "stock" | "option" | "cash"
  market: "HK" | "US"
  strike?: number
  expiry?: string
  optionType?: "call" | "put"
}

interface ProcessingFile {
  file: File
  preview: string
  status: "pending" | "processing" | "done" | "error"
  error?: string
  positions?: ExtractedPosition[]
  platform?: string
}

export default function UploadPage() {
  const [files, setFiles] = useState<ProcessingFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [allPositions, setAllPositions] = useState<ExtractedPosition[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Aggregate positions from all processed files
  useEffect(() => {
    const positions: ExtractedPosition[] = []
    files.forEach((f) => {
      if (f.positions) {
        positions.push(...f.positions)
      }
    })
    setAllPositions(positions)
  }, [files])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    addFiles(selectedFiles)
  }

  const addFiles = (selectedFiles: File[]) => {
    const newFiles: ProcessingFile[] = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }))

    setFiles((prev) => [...prev, ...newFiles])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files || []).filter(
      (file) => file.type.startsWith("image/")
    )

    if (droppedFiles.length > 0) {
      addFiles(droppedFiles)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const processAllFiles = async () => {
    setProcessing(true)

    // Process files one by one
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "done") continue

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "processing" as const } : f
        )
      )

      try {
        const base64String = await readFileAsBase64(files[i].file)
        const apiKey = localStorage.getItem("api_key") || ""

        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64String, apiKey }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "OCR failed")
        }

        const data = await res.json()

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "done" as const,
                  positions: data.positions || [],
                  platform: data.platform,
                }
              : f
          )
        )
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "error" as const,
                  error: err.message || "Failed to process",
                }
              : f
          )
        )
      }
    }

    setProcessing(false)
  }

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSaveAll = async () => {
    if (allPositions.length === 0) return

    setSaving(true)

    try {
      // Save all positions (will be assigned to a default account)
      for (const position of allPositions) {
        await fetch("/api/positions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(position),
        })
      }

      setSaveSuccess(true)
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    } catch (err) {
      console.error("Failed to save:", err)
    } finally {
      setSaving(false)
    }
  }

  const clearAll = () => {
    setFiles([])
    setAllPositions([])
    setSaveSuccess(false)
  }

  const pendingCount = files.filter((f) => f.status === "pending").length
  const doneCount = files.filter((f) => f.status === "done").length
  const errorCount = files.filter((f) => f.status === "error").length
  const canProcess = files.length > 0 && pendingCount > 0
  const canSave = doneCount > 0 && allPositions.length > 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </a>
          <h2 className="text-3xl font-bold">Upload Screenshots</h2>
        </div>
        {files.length > 0 && (
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Broker Screenshots</CardTitle>
          <CardDescription>
            Upload multiple screenshots from your broker apps. AI will extract all positions automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag & Drop Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <div className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">
                  {isDragging ? "Drop screenshots here" : "Select or drag screenshots here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PNG, JPG, JPEG • You can select multiple files
                </p>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById("file-upload")?.click()
                  }}
                  className="cursor-pointer mt-4"
                  variant={files.length > 0 ? "outline" : "default"}
                >
                  Browse Files
                </Button>
              </div>
            </label>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {files.length} screenshot{files.length > 1 ? "s" : ""}
                </h3>
                {doneCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {doneCount} processed • {errorCount} failed
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`relative border rounded-lg overflow-hidden ${
                      file.status === "error"
                        ? "border-red-300"
                        : file.status === "done"
                        ? "border-green-300"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={file.preview}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-80 hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="p-2 bg-background border-t">
                      <div className="text-xs truncate">{file.file.name}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {file.status === "pending" && (
                          <span className="text-xs text-muted-foreground">Waiting...</span>
                        )}
                        {file.status === "processing" && (
                          <span className="text-xs text-blue-500 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Processing
                          </span>
                        )}
                        {file.status === "done" && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {file.positions?.length || 0} positions
                          </span>
                        )}
                        {file.status === "error" && (
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Process and Save buttons */}
              <div className="flex gap-4 pt-4 border-t">
                {canProcess && (
                  <Button
                    onClick={processAllFiles}
                    disabled={processing}
                    className="flex-1"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Extract All ({pendingCount})
                      </>
                    )}
                  </Button>
                )}

                {canSave && (
                  <Button
                    onClick={handleSaveAll}
                    disabled={saving || saveSuccess}
                    className="flex-1"
                    size="lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Saved! Redirecting...
                      </>
                    ) : (
                      `Save All ${allPositions.length} Positions`
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Aggregate results */}
          {allPositions.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">All Positions Found ({allPositions.length})</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {allPositions.map((pos, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold">{pos.ticker}</span>
                        <span className="text-muted-foreground ml-2">
                          {pos.type}
                          {pos.type === "option" && (
                            <>
                              {" "}
                              {pos.optionType} ${pos.strike}
                              {pos.expiry && ` (${new Date(pos.expiry).toLocaleDateString()})`}
                            </>
                          )}
                        </span>
                      </div>
                      <div className="text-right">
                        <div>Qty: {pos.quantity}</div>
                        <div className="text-muted-foreground">
                          Avg: ${pos.avgCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help text */}
          {files.length === 0 && (
            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
              <p className="font-medium mb-2">Supported brokers:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Futu (富途牛牛)</li>
                <li>WeBull (微牛證券)</li>
                <li>Tiger Brokers (老虎證券)</li>
              </ul>
              <p className="mt-3 text-xs">
                Note: Add your OpenRouter API key in <a href="/settings" className="text-blue-500 hover:underline">Settings</a> to enable OCR.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
