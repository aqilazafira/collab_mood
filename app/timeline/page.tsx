"use client"

import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Download, Filter, Lightbulb } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { useApi } from "@/hooks/use-api"
import { emotionsApi } from "@/lib/api"

export default function TimelinePage() {
  const { data: timelineData, loading, error, refetch } = useApi(() => emotionsApi.getTimeline(), [])

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
        <ErrorMessage message={error} onRetry={refetch} />
      </MainLayout>
    )
  }

  const { timelineData: chartData, emotionPeaks, stats } = timelineData || {}

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Emotion Timeline</h1>
            <p className="text-gray-600 mt-2">Detailed view of emotional patterns over time</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Valence & Arousal Timeline</CardTitle>
            <CardDescription>Real-time emotional state tracking with highlighted intervention points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{`Time: ${label}`}</p>
                            <p className="text-blue-600">{`Valence: ${payload[0].value?.toFixed(2)}`}</p>
                            <p className="text-red-600">{`Arousal: ${payload[1]?.value?.toFixed(2)}`}</p>
                            {data.event && (
                              <p className="text-orange-600 text-sm mt-1">Event: {data.event.replace("_", " ")}</p>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="valence"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Valence"
                    dot={(props) => {
                      const { payload } = props
                      if (payload.event) {
                        return <circle {...props} r={6} fill="#f59e0b" stroke="#f59e0b" strokeWidth={2} />
                      }
                      return <circle {...props} r={3} />
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="arousal"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Arousal"
                    dot={(props) => {
                      const { payload } = props
                      if (payload.event) {
                        return <circle {...props} r={6} fill="#f59e0b" stroke="#f59e0b" strokeWidth={2} />
                      }
                      return <circle {...props} r={3} />
                    }}
                  />
                  <ReferenceLine y={0.5} stroke="#6b7280" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Emotion Peaks and Interventions */}
        <Card>
          <CardHeader>
            <CardTitle>Emotion Peaks & Interventions</CardTitle>
            <CardDescription>Significant emotional events and system responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emotionPeaks?.map((peak: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={peak.status === "resolved" ? "secondary" : "destructive"}>{peak.type}</Badge>
                        <span className="text-sm text-gray-500">{peak.time}</span>
                        <Badge
                          variant="outline"
                          className={peak.status === "resolved" ? "text-green-600" : "text-orange-600"}
                        >
                          {peak.status}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{peak.description}</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-600">Suggestion: {peak.suggestion}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center py-4">No significant emotional events detected</p>}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Peak Emotions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Highest Valence</span>
                  <span className="font-medium">{stats?.highestValence?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lowest Valence</span>
                  <span className="font-medium">{stats?.lowestValence?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Peak Arousal</span>
                  <span className="font-medium">{stats?.peakArousal?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interventions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Suggestions</span>
                  <span className="font-medium">{stats?.totalSuggestions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Successful</span>
                  <span className="font-medium text-green-600">{stats?.successfulSuggestions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-medium text-orange-600">{stats?.pendingSuggestions || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Overall Score</span>
                  <span className="font-medium text-green-600">
                    {stats?.highestValence > 0.7 ? "Good" : stats?.highestValence > 0.5 ? "Fair" : "Needs Attention"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stability</span>
                  <span className="font-medium">
                    {Math.round(((stats?.highestValence || 0) - (stats?.lowestValence || 0)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Engagement</span>
                  <span className="font-medium">{Math.round((stats?.peakArousal || 0) * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
