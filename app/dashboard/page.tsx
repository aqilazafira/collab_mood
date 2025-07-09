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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time collaborative mood tracking overview</p>
        </div>

        {/* Alerts */}
        {stats?.avgValence < 0.4 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Low emotional valence detected. Consider suggesting a break or positive activity.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeParticipants || 0}</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.sessionDuration || "0m"}</div>
              <p className="text-xs text-muted-foreground">Current session</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Valence</CardTitle>
              <Smile className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgValence?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Emotional positivity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Suggestions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.suggestionsGiven || 0}</div>
              <p className="text-xs text-muted-foreground">Pending interventions</p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Emotion Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Real-time Emotion Summary</CardTitle>
            <CardDescription>Valence and arousal levels over the current session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.emotionData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="valence" stroke="#3b82f6" strokeWidth={2} name="Valence" />
                  <Line type="monotone" dataKey="arousal" stroke="#ef4444" strokeWidth={2} name="Arousal" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Current Mood Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Mood Distribution</CardTitle>
              <CardDescription>Emotional states of active participants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smile className="h-5 w-5 text-green-500" />
                  <span>Positive</span>
                </div>
                <Badge variant="secondary">
                  {Math.round((stats?.avgValence || 0) * stats?.activeParticipants * 0.6)} participants
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Meh className="h-5 w-5 text-yellow-500" />
                  <span>Neutral</span>
                </div>
                <Badge variant="secondary">{Math.round((stats?.activeParticipants || 0) * 0.3)} participants</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Frown className="h-5 w-5 text-red-500" />
                  <span>Negative</span>
                </div>
                <Badge variant="secondary">{Math.round((stats?.activeParticipants || 0) * 0.1)} participants</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest system alerts and suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-orange-100 p-1 rounded">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Emotion data updated</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
              {stats?.suggestionsGiven > 0 && (
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-1 rounded">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Suggestions available</p>
                    <p className="text-xs text-gray-500">Check smart suggestions</p>
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-1 rounded">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Dashboard refreshed</p>
                  <p className="text-xs text-gray-500">Data up to date</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}