"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Users, Clock, AlertTriangle, Smile, Frown, Meh } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"





import { useApi } from "@/hooks/use-api"

export default function DashboardPage() {
  const { data: stats, loading, error } = useApi(() => fetch('/api/dashboard/stats').then(res => res.json()), [])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-red-500">{error}</span>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Ringkasan aktivitas, statistik emosi, dan sesi Anda</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Users className="inline-block mr-2" /> Total Sesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSessions ?? '-'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Smile className="inline-block mr-2" /> Deteksi Emosi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDetections ?? '-'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <TrendingUp className="inline-block mr-2" /> Emosi Terbanyak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{stats?.mostFrequentEmotion?.name ?? '-'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <Badge className="inline-block mr-2">Sesi Terakhir</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base">{stats?.lastSession?.name ?? '-'}</div>
              <div className="text-xs text-gray-500">{stats?.lastSession?.startTime ?? ''}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
