"use client"

import type React from "react"
import { useState } from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, TrendingUp, CheckCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { useApi, useApiMutation } from "@/hooks/use-api"
import { feedbackApi } from "@/lib/api"

export default function FeedbackPage() {
  const [rating, setRating] = useState("")
  const [comment, setComment] = useState("")
  const [category, setCategory] = useState("")
  const [showSuggestionLink, setShowSuggestionLink] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // API hooks
  const { data: feedbackData, loading, error, refetch } = useApi(() => feedbackApi.getAll(), [])
  const { mutate: submitFeedback, loading: submitLoading, error: submitError } = useApiMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await submitFeedback(feedbackApi.submit, {
        category,
        rating,
        comment,
      })

      // Reset form
      setRating("")
      setComment("")
      setCategory("")

      // Refresh feedback list
      refetch()

      setSuccessMessage("Feedback submitted successfully!")
      setShowSuggestionLink(true)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    }
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
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

  const { feedback = [], stats = {} } = feedbackData || {}

  return (
    <MainLayout>
      <div className="space-y-6">
        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-800 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span>{successMessage}</span>
            {showSuggestionLink && (
              <a href="/suggestions" className="inline-block mt-2 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Lihat Smart Suggestions</a>
            )}
          </div>
        )}
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
          <p className="text-gray-600 mt-2">Help us improve the emotion detection and suggestion system</p>
        </div>

        {/* Feedback Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalFeedback || 0}</p>
                  <p className="text-xs text-gray-500">Total Feedback</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgRating || 0}</p>
                  <p className="text-xs text-gray-500">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.satisfaction || 0}%</p>
                  <p className="text-xs text-gray-500">Satisfaction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
              <CardDescription>Rate your experience with the emotion detection and suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              {submitError && <ErrorMessage message={submitError} />}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Feedback Category</Label>
                  <RadioGroup value={category} onValueChange={setCategory} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="emotion-detection" id="emotion-detection" />
                      <Label htmlFor="emotion-detection">Emotion Detection Accuracy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="suggestions" id="suggestions" />
                      <Label htmlFor="suggestions">Suggestion Quality</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="timing" id="timing" />
                      <Label htmlFor="timing">Suggestion Timing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="interface" id="interface" />
                      <Label htmlFor="interface">User Interface</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="general" id="general" />
                      <Label htmlFor="general">General Experience</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">Overall Rating</Label>
                  <RadioGroup value={rating} onValueChange={setRating} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5" id="rating-5" />
                      <Label htmlFor="rating-5" className="flex items-center space-x-1">
                        <span>Excellent</span>
                        <div className="flex ml-2">{renderStars(5)}</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4" id="rating-4" />
                      <Label htmlFor="rating-4" className="flex items-center space-x-1">
                        <span>Good</span>
                        <div className="flex ml-2">{renderStars(4)}</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="rating-3" />
                      <Label htmlFor="rating-3" className="flex items-center space-x-1">
                        <span>Average</span>
                        <div className="flex ml-2">{renderStars(3)}</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="rating-2" />
                      <Label htmlFor="rating-2" className="flex items-center space-x-1">
                        <span>Poor</span>
                        <div className="flex ml-2">{renderStars(2)}</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="rating-1" />
                      <Label htmlFor="rating-1" className="flex items-center space-x-1">
                        <span>Very Poor</span>
                        <div className="flex ml-2">{renderStars(1)}</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="comment" className="text-base font-medium">
                    Comments & Suggestions
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Please share your detailed feedback, suggestions for improvement, or any issues you encountered..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={!rating || !category || submitLoading}>
                  {submitLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Previous Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Your Previous Feedback</CardTitle>
              <CardDescription>Track your submitted feedback and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.length > 0 ? (
                  feedback.map((item: any) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm capitalize">{item.category?.replace("-", " ")}</p>
                          <p className="text-xs text-gray-500">{new Date(item.createdAt || item.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStars(item.rating)}</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{item.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                    <p>No feedback submitted yet</p>
                    <p className="text-sm">Your feedback will appear here after submission</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Guidelines</CardTitle>
            <CardDescription>Help us improve by providing specific and constructive feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">What helps us improve:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Specific examples of when suggestions were helpful or not</li>
                  <li>• Details about emotion detection accuracy</li>
                  <li>• Suggestions for better timing of interventions</li>
                  <li>• Ideas for new types of suggestions</li>
                  <li>• Interface usability feedback</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Current focus areas:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Improving emotion detection accuracy</li>
                  <li>• Reducing false positive suggestions</li>
                  <li>• Better timing for interventions</li>
                  <li>• More diverse suggestion types</li>
                  <li>• Enhanced user experience</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
