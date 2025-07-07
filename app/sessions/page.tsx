"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Play, Square, Users, Plus, Settings, Eye } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { useApi, useApiMutation } from "@/hooks/use-api"
import { sessionsApi } from "@/lib/api"

export default function SessionsPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSession, setNewSession] = useState({
    name: "",
    description: "",
    duration: "",
    participants: "",
  })

  // API hooks
  const { data: sessionsData, loading, error, refetch } = useApi(() => sessionsApi.getAll(), [])
  const { mutate: createSession, loading: createLoading } = useApiMutation()
  const { mutate: updateSession, loading: updateLoading } = useApiMutation()

  const sessions = sessionsData?.sessions || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateSession = async () => {
    try {
      await createSession(sessionsApi.create, newSession)
      setIsCreateDialogOpen(false)
      setNewSession({ name: "", description: "", duration: "", participants: "" })
      refetch()
    } catch (error) {
      console.error("Failed to create session:", error)
    }
  }

  const handleStartSession = async (sessionId: string) => {
    try {
      await updateSession(sessionsApi.updateStatus, { id: sessionId, status: "active" })
      refetch()
      router.push('/emotion-detection')
    } catch (error) {
      console.error("Failed to start session:", error)
    }
  }

  const handleEndSession = async (sessionId: string) => {
    try {
      await updateSession(sessionsApi.updateStatus, { id: sessionId, status: "completed" })
      refetch()
    } catch (error) {
      console.error("Failed to end session:", error)
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Session Management</h1>
            <p className="text-gray-600 mt-2">Manage collaborative learning sessions and participants</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
                <DialogDescription>Set up a new collaborative learning session</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    placeholder="Enter session name"
                    value={newSession.name}
                    onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="session-description">Description</Label>
                  <Textarea
                    id="session-description"
                    placeholder="Describe the session purpose and goals"
                    value={newSession.description}
                    onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="session-duration">Expected Duration</Label>
                  <Input
                    id="session-duration"
                    placeholder="e.g., 60 minutes"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="session-participants">Participants (emails)</Label>
                  <Textarea
                    id="session-participants"
                    placeholder="Enter participant emails, one per line"
                    value={newSession.participants}
                    onChange={(e) => setNewSession({ ...newSession, participants: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSession} disabled={createLoading}>
                    {createLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    Create Session
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Session Alert */}
        {sessions.some((s: any) => s.status === "active") && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 rounded-full h-3 w-3 animate-pulse"></div>
                  <div>
                    <p className="font-medium text-green-800">Active Session in Progress</p>
                    <p className="text-sm text-green-600">
                      {sessions.find((s: any) => s.status === "active")?.name} -{" "}
                      {sessions.find((s: any) => s.status === "active")?.participants.length} participants
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-green-300 text-green-700">
                  <Eye className="h-4 w-4 mr-1" />
                  Monitor
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Sessions</CardTitle>
            <CardDescription>Current and past collaborative learning sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Current Mood</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session: any) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{session.name}</p>
                        <p className="text-sm text-gray-500">{session.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                    </TableCell>
                    <TableCell>{session.startTime}</TableCell>
                    <TableCell>{session.duration}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {session.participants.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.currentMood ? (
                        <div className="text-sm">
                          <div>V: {session.currentMood.valence.toFixed(2)}</div>
                          <div>A: {session.currentMood.arousal.toFixed(2)}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {session.status === "scheduled" && (
                          <Button size="sm" onClick={() => handleStartSession(session.id)} disabled={updateLoading}>
                            {updateLoading ? (
                              <LoadingSpinner size="sm" className="mr-1" />
                            ) : (
                              <Play className="h-4 w-4 mr-1" />
                            )}
                            Start
                          </Button>
                        )}
                        {session.status === "active" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleEndSession(session.id)}
                            disabled={updateLoading}
                          >
                            {updateLoading ? (
                              <LoadingSpinner size="sm" className="mr-1" />
                            ) : (
                              <Square className="h-4 w-4 mr-1" />
                            )}
                            End
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{session.name}</DialogTitle>
                              <DialogDescription>Session details and participant information</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="text-sm text-gray-500">Status</p>
                                  <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Start Time</p>
                                  <p className="font-medium">{session.startTime}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Duration</p>
                                  <p className="font-medium">{session.duration}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Participants</p>
                                  <p className="font-medium">{session.participants.length}</p>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-500 mb-2">Description</p>
                                <p className="text-gray-700">{session.description}</p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-500 mb-3">Participants</p>
                                <div className="space-y-2">
                                  {session.participants.map((participant: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                    >
                                      <div>
                                        <p className="font-medium">{participant.name}</p>
                                        <p className="text-sm text-gray-500">{participant.role}</p>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {participant.status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {session.currentMood && (
                                <div>
                                  <p className="text-sm text-gray-500 mb-2">Current Emotional State</p>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-blue-50 rounded">
                                      <p className="text-sm text-blue-600">Valence</p>
                                      <p className="text-xl font-bold text-blue-700">
                                        {session.currentMood.valence.toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded">
                                      <p className="text-sm text-red-600">Arousal</p>
                                      <p className="text-xl font-bold text-red-700">
                                        {session.currentMood.arousal.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
