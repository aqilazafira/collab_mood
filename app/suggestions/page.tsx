"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lightbulb, Clock, Users, Play, CheckCircle, AlertCircle, Coffee, GamepadIcon, Heart } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { useApi, useApiMutation } from "@/hooks/use-api"
import { suggestionsApi } from "@/lib/api"

const suggestionIcons = {
  Break: Coffee,
  Game: GamepadIcon,
  Mindfulness: Heart,
}

export default function SuggestionsPage() {
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null)

  // API hooks
  const { data: suggestionsData, loading, error, refetch } = useApi(() => suggestionsApi.getAll(), [])
  const { mutate: updateSuggestion, loading: updateLoading } = useApiMutation()

  const handleUpdateSuggestion = async (id: string, status: string) => {
    try {
      await updateSuggestion(suggestionsApi.updateStatus, { id, status })
      refetch() // Refresh the suggestions list
    } catch (error) {
      console.error("Failed to update suggestion:", error)
    }
  }

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

  const { suggestions = [], stats = {} } = suggestionsData || {}

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "declined":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <AlertCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Suggestions</h1>
          <p className="text-gray-600 mt-2">AI-powered adaptive recommendations for collaborative sessions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalSent || 0}</p>
                  <p className="text-xs text-gray-500">Total Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.successful || 0}</p>
                  <p className="text-xs text-gray-500">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending || 0}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.declined || 0}</p>
                  <p className="text-xs text-gray-500">Declined</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgResponseTime || "N/A"}</p>
                  <p className="text-xs text-gray-500">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Suggestions</CardTitle>
            <CardDescription>Adaptive recommendations based on real-time emotional analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion: any) => {
                  const IconComponent = suggestionIcons[suggestion.type as keyof typeof suggestionIcons] || Lightbulb
                  return (
                    <div key={suggestion.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                              <Badge variant="outline">{suggestion.type}</Badge>
                              <Badge className={getStatusColor(suggestion.status)}>
                                {getStatusIcon(suggestion.status)}
                                <span className="ml-1 capitalize">{suggestion.status}</span>
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{suggestion.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {suggestion.timestamp}
                              </span>
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {suggestion.participants.join(", ")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedSuggestion(suggestion)}>
                                <Play className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <IconComponent className="h-5 w-5 text-blue-600" />
                                  <span>{suggestion.title}</span>
                                </DialogTitle>
                                <DialogDescription>
                                  Detailed suggestion information and implementation guide
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">Reason</h4>
                                  <p className="text-sm text-gray-600">{suggestion.details.reason}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">Expected Outcome</h4>
                                  <p className="text-sm text-gray-600">{suggestion.details.expectedOutcome}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">Duration</h4>
                                  <p className="text-sm text-gray-600">{suggestion.details.duration}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">Instructions</h4>
                                  <p className="text-sm text-gray-600">{suggestion.details.instructions}</p>
                                </div>
                                <div className="flex space-x-2 pt-2">
                                  <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleUpdateSuggestion(suggestion.id, "completed")}
                                    disabled={updateLoading}
                                  >
                                    {updateLoading ? <LoadingSpinner size="sm" className="mr-1" /> : null}
                                    Implement Now
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleUpdateSuggestion(suggestion.id, "declined")}
                                    disabled={updateLoading}
                                  >
                                    Decline
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {suggestion.status === "active" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateSuggestion(suggestion.id, "completed")}
                              disabled={updateLoading}
                            >
                              {updateLoading ? <LoadingSpinner size="sm" className="mr-1" /> : null}
                              Implement
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="h-12 w-12 mx-auto mb-2" />
                  <p>No suggestions available</p>
                  <p className="text-sm">Suggestions will appear based on emotional analysis</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
