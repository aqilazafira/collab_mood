"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Camera, History, Save, Smile, Frown, Meh, Angry, Heart, BarChart } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Emosi yang dapat dideteksi
const emotions = [
  { id: "happy", name: "Bahagia", icon: Smile, color: "text-green-500" },
  { id: "sad", name: "Sedih", icon: Frown, color: "text-blue-500" },
  { id: "angry", name: "Marah", icon: Angry, color: "text-red-500" },
  { id: "neutral", name: "Netral", icon: Meh, color: "text-gray-500" },
  { id: "surprised", name: "Terkejut", icon: Heart, color: "text-purple-500" },
]



export default function EmotionDetectionPage() {
  const router = useRouter();
  // Akhiri sesi: update status dan redirect ke /sessions
  const handleEndSession = async () => {
    if (!activeSessionId) return;
    try {
      const res = await fetch(`/api/sessions/${activeSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!res.ok) throw new Error("Gagal mengakhiri sesi");
      toast({ title: "Sesi telah diakhiri", description: "Anda akan diarahkan ke halaman sesi." });
      router.push("/sessions");
    } catch (err: any) {
      toast({ title: "Gagal mengakhiri sesi", description: err?.message || "Terjadi kesalahan." });
    }
  };
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [autoDetect, setAutoDetect] = useState(false)
  const [detectionResult, setDetectionResult] = useState<any[]>([])
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [detectLoading, setDetectLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  // Session state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)

  // Toast
  const { toast } = useToast()
  // Ambil sesi aktif saat mount
  useEffect(() => {
    const fetchActiveSession = async () => {
      setIsSessionLoading(true)
      setSessionError(null)
      try {
        const res = await fetch("/api/sessions/active")
        if (!res.ok) {
          setActiveSessionId(null)
          if (res.status === 404) {
            setSessionError("Tidak ada sesi aktif. Mulai sesi baru untuk deteksi emosi.")
          } else {
            setSessionError("Gagal mengambil sesi aktif.")
          }
          return
        }
        const data = await res.json()
        setActiveSessionId(data.sessionId)
      } catch (err) {
        setSessionError("Gagal mengambil sesi aktif.")
        setActiveSessionId(null)
      } finally {
        setIsSessionLoading(false)
      }
    }
    fetchActiveSession()
  }, [])

  // Inisialisasi kamera
  const initCamera = async () => {
    console.log("initCamera called")
    setCameraError(null)

    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      console.log("Attempting to get user media...")
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      console.log("getUserMedia successful, stream obtained.")

      setStream(mediaStream)

    } catch (error) {
      console.error("Error accessing camera in catch block:", error)
      let errorMessage = "Tidak dapat mengakses kamera."

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Akses kamera ditolak. Silakan berikan izin kamera dan coba lagi."
        } else if (error.name === "NotFoundError") {
          errorMessage = "Kamera tidak ditemukan. Pastikan kamera terhubung dengan benar."
        } else if (error.name === "NotReadableError") {
          errorMessage = "Kamera sedang digunakan oleh aplikasi lain."
        } else if (error.name === "OverconstrainedError") {
          errorMessage = "Kamera tidak mendukung resolusi yang diminta."
        }
      }

      setCameraError(errorMessage)
    }
  }

  // Effect to handle video stream once videoRef and stream are available
  useEffect(() => {
    if (videoRef.current && stream) {
      console.log("videoRef.current and stream are available. Assigning srcObject.")
      videoRef.current.srcObject = stream

      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded.")
        videoRef.current?.play().catch((error) => {
          console.error("Error playing video:", error)
          setCameraError("Gagal memutar video dari kamera")
        })
      }

      // Attempt to play immediately as well, sometimes helps
      videoRef.current.play().catch((error) => {
        console.error("Error playing video immediately:", error)
        setCameraError("Gagal memutar video dari kamera")
      })
    }
  }, [stream, videoRef])

  // Hentikan kamera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  // Deteksi emosi
  const handleDetectEmotion = async () => {
    if (!activeSessionId) {
      toast({ title: "Tidak ada sesi aktif", description: "Mulai sesi baru sebelum deteksi emosi.", })
      return
    }
    setDetectLoading(true)
    try {
      // Ambil frame dari video (opsional, jika backend butuh gambar)
      // const imageData = ...
      const res = await fetch("/api/emotions/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId /*, image: imageData */ }),
      })
      if (!res.ok) {
        throw new Error("Gagal mendeteksi emosi")
      }
      const data = await res.json()
      // Asumsi response: { detectionResult: [...], history: [...] }
      setDetectionResult(data.detectionResult || [])
      setHistory(data.history || [])
      toast({ title: "Deteksi emosi berhasil", description: "Hasil deteksi telah disimpan." })
    } catch (error: any) {
      toast({ title: "Gagal mendeteksi emosi", description: error?.message || "Terjadi kesalahan." })
    } finally {
      setDetectLoading(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
        console.log(stream);
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop()
        })
      }
    }
  }, [stream])

  // Render ikon emosi berdasarkan hasil deteksi
  const renderEmotionIcon = () => {
    if (!detectionResult.length) return null

    const topEmotion = detectionResult[0]
    const EmotionIcon = emotions.find((e) => e.id === topEmotion.emotion)?.icon || Meh
    const emotionColor = emotions.find((e) => e.id === topEmotion.emotion)?.color || "text-gray-500"

    return (
      <div className="flex flex-col items-center">
        <div className={`text-4xl ${emotionColor}`}>
          <EmotionIcon size={64} />
        </div>
        <h3 className="text-xl font-bold mt-2">{topEmotion.name}</h3>
        <p className="text-sm text-gray-500">Confidence: {Math.round(topEmotion.score * 100)}%</p>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deteksi Emosi</h1>
          <p className="text-gray-600 mt-2">Deteksi emosi secara real-time menggunakan kamera</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kamera dan Deteksi */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Kamera</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-detect"
                        checked={autoDetect}
                        onCheckedChange={() => setAutoDetect(!autoDetect)}
                        disabled={!stream}
                      />
                      <Label htmlFor="auto-detect">Deteksi Otomatis</Label>
                    </div>
                  </div>
                </CardTitle>
                <CardDescription>Gunakan kamera untuk mendeteksi emosi secara real-time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Preview */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center min-h-[300px]">
                  {stream ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: "scaleX(-1)" }} // Mirror effect for better UX
                      />
                      {/* Camera indicator */}
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                        LIVE
                      </div>
                    </>
                  ) : (
                    <div className="text-white text-center p-8">
                      <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg mb-2">Kamera tidak aktif</p>
                      <p className="text-sm text-gray-400 mb-4">Klik tombol di bawah untuk mengaktifkan kamera</p>
                      {cameraError && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                          <p className="text-red-200 text-sm">{cameraError}</p>
                        </div>
                      )}
                      <Button onClick={initCamera} className="bg-blue-600 hover:bg-blue-700">
                        <Camera className="h-4 w-4 mr-2" />
                        Aktifkan Kamera
                      </Button>
                    </div>
                  )}

                  {/* Overlay saat loading */}
                  {detectLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <LoadingSpinner className="mx-auto mb-2" />
                        <p>Mendeteksi emosi...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kontrol Kamera */}
                <div className="flex flex-wrap gap-2">
                  {!stream ? (
                    <Button onClick={initCamera}>
                      <Camera className="h-4 w-4 mr-2" />
                      Aktifkan Kamera
                    </Button>
                  ) : (
                    <>
                      <Button onClick={stopCamera} variant="outline">
                        Matikan Kamera
                      </Button>
                  <Button
                    onClick={handleDetectEmotion}
                    disabled={detectLoading || isSessionLoading || !activeSessionId}
                  >
                    {detectLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Mendeteksi...
                      </>
                    ) : (
                      <>
                        <Smile className="h-4 w-4 mr-2" />
                        Deteksi Emosi
                      </>
                    )}
                  </Button>
        {/* Pesan status sesi */}
        {isSessionLoading ? (
          <div className="text-blue-500 text-sm mt-2">Memuat sesi aktif...</div>
        ) : sessionError ? (
          <div className="text-red-500 text-sm mt-2">{sessionError}</div>
        ) : null}
                    <Button variant="outline">
                      <Save className="h-4 w-4 mr-2" />
                      Ambil Gambar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleEndSession}
                      disabled={!activeSessionId || isSessionLoading}
                    >
                      Akhiri Sesi
                    </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hasil Deteksi */}
            <Card>
              <CardHeader>
                <CardTitle>Hasil Deteksi</CardTitle>
                <CardDescription>Analisis emosi berdasarkan ekspresi wajah</CardDescription>
              </CardHeader>
              <CardContent>
                {detectionResult.length > 0 ? (
                  <div className="space-y-6">
                    {/* Ikon dan Nama Emosi */}
                    <div className="flex justify-center py-4">{renderEmotionIcon()}</div>

                    {/* Confidence Scores */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-500">Confidence Scores</h4>
                      {detectionResult.map((result) => {
                        const EmotionIcon = emotions.find((e) => e.id === result.emotion)?.icon || Meh
                        const emotionColor = emotions.find((e) => e.id === result.emotion)?.color || "text-gray-500"
                        return (
                          <div key={result.emotion} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <EmotionIcon className={`h-4 w-4 ${emotionColor}`} />
                                <span>{result.name}</span>
                              </div>
                              <span className="text-sm font-medium">{Math.round(result.score * 100)}%</span>
                            </div>
                            <Progress value={result.score * 100} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Meh className="h-12 w-12 mx-auto mb-2" />
                    <p>Belum ada deteksi emosi</p>
                    <p className="text-sm">Aktifkan kamera dan klik "Deteksi Emosi" untuk memulai</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Riwayat dan Statistik */}
          <div className="space-y-6">
            <Tabs defaultValue="history">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  Riwayat
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <BarChart className="h-4 w-4 mr-2" />
                  Statistik
                </TabsTrigger>
              </TabsList>
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Riwayat Deteksi</CardTitle>
                    <CardDescription>Deteksi emosi terbaru</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {history.map((item) => {
                        const EmotionIcon = emotions.find((e) => e.id === item.emotion)?.icon || Meh
                        const emotionColor = emotions.find((e) => e.id === item.emotion)?.color || "text-gray-500"

                        return (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-full ${emotionColor.replace("text-", "bg-").replace("500", "100")}`}
                              >
                                <EmotionIcon className={`h-4 w-4 ${emotionColor}`} />
                              </div>
                              <div>
                                <p className="font-medium">{item.emotionName}</p>
                                <p className="text-xs text-gray-500">{item.timestamp}</p>
                              </div>
                            </div>
                            <Badge variant="outline">{Math.round(item.confidence * 100)}%</Badge>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="stats">
                <Card>
                  <CardHeader>
                    <CardTitle>Statistik Emosi</CardTitle>
                    <CardDescription>Distribusi emosi yang terdeteksi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <BarChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Statistik akan muncul setelah beberapa deteksi</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Tips Deteksi */}
            <Card>
              <CardHeader>
                <CardTitle>Tips Deteksi Emosi</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Pastikan wajah terlihat jelas dan pencahayaan cukup</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Hadap kamera secara langsung untuk hasil terbaik</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Hindari menutupi wajah dengan tangan atau objek lain</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Gunakan deteksi otomatis untuk pemantauan berkelanjutan</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Emosi yang Dapat Dideteksi */}
            <Card>
              <CardHeader>
                <CardTitle>Emosi yang Dapat Dideteksi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {emotions.map((emotion) => {
                    const EmotionIcon = emotion.icon
                    return (
                      <Badge key={emotion.id} variant="outline" className="flex items-center gap-1 px-3 py-1">
                        <EmotionIcon className={`h-3 w-3 ${emotion.color}`} />
                        <span>{emotion.name}</span>
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}