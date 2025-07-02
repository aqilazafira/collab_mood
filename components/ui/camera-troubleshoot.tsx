"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"

interface CameraTroubleshootProps {
  onRetry: () => void
}

export function CameraTroubleshoot({ onRetry }: CameraTroubleshootProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null)

  const checkPermissions = async () => {
    setIsChecking(true)
    try {
      const permissions = await navigator.permissions.query({ name: "camera" as PermissionName })
      setPermissionStatus(permissions.state)
    } catch (error) {
      setPermissionStatus("not-supported")
    }
    setIsChecking(false)
  }

  const troubleshootSteps = [
    {
      title: "Periksa Izin Kamera",
      description: "Pastikan browser memiliki izin untuk mengakses kamera",
      action: checkPermissions,
      status: permissionStatus,
    },
    {
      title: "Refresh Halaman",
      description: "Coba refresh halaman dan berikan izin kamera kembali",
      action: () => window.location.reload(),
    },
    {
      title: "Periksa Kamera Lain",
      description: "Pastikan kamera tidak sedang digunakan aplikasi lain",
    },
    {
      title: "Coba Browser Lain",
      description: "Gunakan Chrome, Firefox, atau Edge untuk kompatibilitas terbaik",
    },
  ]

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>Masalah Kamera</span>
        </CardTitle>
        <CardDescription>Ikuti langkah-langkah berikut untuk mengatasi masalah kamera</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissionStatus && (
          <Alert
            className={permissionStatus === "granted" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
          >
            <AlertDescription className="flex items-center">
              {permissionStatus === "granted" ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-green-800">Izin kamera diberikan</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-red-800">Izin kamera: {permissionStatus}</span>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {troubleshootSteps.map((step, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                </div>
                {step.action && (
                  <Button variant="outline" size="sm" onClick={step.action} disabled={isChecking}>
                    {isChecking && step.title.includes("Izin") ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      "Coba"
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 pt-2">
          <Button onClick={onRetry} className="flex-1">
            <Camera className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Tips:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Pastikan kamera tidak digunakan aplikasi lain</li>
            <li>Coba tutup tab browser lain yang menggunakan kamera</li>
            <li>Restart browser jika masalah berlanjut</li>
            <li>Periksa pengaturan privasi browser</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
