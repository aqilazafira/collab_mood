"use client"

import { useState } from "react"
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
import { Download, Eye, Calendar, Users, Clock, TrendingUp, TrendingDown } from "lucide-react"

// Mock session reports data
const sessionReports = [
  {
    id: "RPT-001",
    sessionName: "Team Alpha - Sprint Planning",
    date: "2024-01-15",
    duration: "2h 15m",
    participants: 8,
    avgValence: 0.72,
    avgArousal: 0.58,
    suggestionsGiven: 3,
    status: "completed",
    summary: {
      highlights: [
        "High engagement throughout the session",
        "Successful conflict resolution at 45min mark",
        "Positive trend in final 30 minutes",
      ],
      concerns: ["Initial stress spike during task assignment", "One participant showed consistent low valence"],
      recommendations: ["Consider shorter task assignment discussions", "Check in with Sarah about workload concerns"],
    },
  },
  {
    id: "RPT-002",
    sessionName: "Cross-team Collaboration Meeting",
    date: "2024-01-14",
    duration: "1h 45m",
    participants: 12,
    avgValence: 0.65,
    avgArousal: 0.71,
    suggestionsGiven: 5,
    status: "completed",
    summary: {
      highlights: [
        "Good cross-team communication",
        "Effective use of break suggestions",
        "Strong finish with action items",
      ],
      concerns: ["Mid-session energy dip", "Some participants seemed disengaged"],
      recommendations: ["Schedule shorter meetings for better focus", "Use more interactive elements"],
    },
  },
  {
    id: "RPT-003",
    sessionName: "Team Beta - Retrospective",
    date: "2024-01-13",
    duration: "1h 30m",
    participants: 6,
    avgValence: 0.58,
    avgArousal: 0.63,
    suggestionsGiven: 2,
    status: "completed",
    summary: {
      highlights: ["Open and honest feedback sharing", "Good emotional regulation", "Constructive problem-solving"],
      concerns: ["Some tension during feedback phase", "Lower than average valence scores"],
      recommendations: ["Implement feedback guidelines", "Consider anonymous feedback options"],
    },
  },
]

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<(typeof sessionReports)[0] | null>(null)

  const getValenceIndicator = (valence: number) => {
    if (valence >= 0.7) return { icon: TrendingUp, color: "text-green-600", label: "High" }
    if (valence >= 0.5) return { icon: TrendingUp, color: "text-yellow-600", label: "Medium" }
    return { icon: TrendingDown, color: "text-red-600", label: "Low" }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Session Reports</h1>
            <p className="text-gray-600 mt-2">Comprehensive analysis of collaborative sessions</p>
          </div>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Filter by Date
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">26</p>
                  <p className="text-xs text-gray-500">Total Participants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">5h 30m</p>
                  <p className="text-xs text-gray-500">Total Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">0.65</p>
                  <p className="text-xs text-gray-500">Avg Valence</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">10</p>
                  <p className="text-xs text-gray-500">Total Suggestions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Session Reports</CardTitle>
            <CardDescription>Detailed reports from completed collaborative sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Avg Valence</TableHead>
                  <TableHead>Suggestions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionReports.map((report) => {
                  const valenceIndicator = getValenceIndicator(report.avgValence)
                  const ValenceIcon = valenceIndicator.icon

                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.sessionName}</p>
                          <p className="text-sm text-gray-500">{report.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>{report.duration}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {report.participants}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <ValenceIcon className={`h-4 w-4 ${valenceIndicator.color}`} />
                          <span>{report.avgValence.toFixed(2)}</span>
                          <Badge variant="outline" className="text-xs">
                            {valenceIndicator.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.suggestionsGiven}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{report.sessionName}</DialogTitle>
                                <DialogDescription>Session Report - {report.date}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Report Header */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="font-medium">{report.duration}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Participants</p>
                                    <p className="font-medium">{report.participants}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Avg Valence</p>
                                    <p className="font-medium">{report.avgValence.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Suggestions</p>
                                    <p className="font-medium">{report.suggestionsGiven}</p>
                                  </div>
                                </div>

                                {/* Highlights */}
                                <div>
                                  <h4 className="font-semibold text-green-700 mb-2">Highlights</h4>
                                  <ul className="space-y-1">
                                    {report.summary.highlights.map((highlight, index) => (
                                      <li key={index} className="text-sm text-gray-600 flex items-start">
                                        <span className="text-green-500 mr-2">•</span>
                                        {highlight}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Concerns */}
                                <div>
                                  <h4 className="font-semibold text-orange-700 mb-2">Areas of Concern</h4>
                                  <ul className="space-y-1">
                                    {report.summary.concerns.map((concern, index) => (
                                      <li key={index} className="text-sm text-gray-600 flex items-start">
                                        <span className="text-orange-500 mr-2">•</span>
                                        {concern}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Recommendations */}
                                <div>
                                  <h4 className="font-semibold text-blue-700 mb-2">Recommendations</h4>
                                  <ul className="space-y-1">
                                    {report.summary.recommendations.map((rec, index) => (
                                      <li key={index} className="text-sm text-gray-600 flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-1" />
                                    Download PDF
                                  </Button>
                                  <Button size="sm">Share Report</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
