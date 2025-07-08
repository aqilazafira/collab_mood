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


import { useApi } from "@/hooks/use-api"
import { reportsApi } from "@/lib/api"
import { downloadSessionReport } from "@/lib/download-report"


export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const { data, loading, error } = useApi(() => reportsApi.getAll(), [])
  const reports = data?.reports || []
  const stats = data?.stats || {}

  const getValenceIndicator = (valence: number) => {
    if (valence >= 0.7) return { icon: TrendingUp, color: "text-green-600", label: "High" }
    if (valence >= 0.5) return { icon: TrendingUp, color: "text-yellow-600", label: "Medium" }
    return { icon: TrendingDown, color: "text-red-600", label: "Low" }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <span>Loading...</span>
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
                  <p className="text-2xl font-bold">{stats.totalParticipants ?? '-'}</p>
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
                  <p className="text-2xl font-bold">{stats.totalDuration ?? '-'}</p>
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
                  <p className="text-2xl font-bold">{stats.avgValence ?? '-'}</p>
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
                  <p className="text-2xl font-bold">{stats.totalSuggestions ?? '-'}</p>
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
                {reports.map((report: any) => {
                  const valence = report.session?.emotions && report.session.emotions.length > 0
                    ? (report.session.emotions.reduce((sum: number, e: any) => sum + (e.valence || 0), 0) / report.session.emotions.length)
                    : 0;
                  const valenceIndicator = getValenceIndicator(valence)
                  const ValenceIcon = valenceIndicator.icon
                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.session?.name || '-'}</p>
                          <p className="text-sm text-gray-500">{report.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{report.session?.startTime || '-'}</TableCell>
                      <TableCell>{report.session?.duration || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {Array.isArray(report.session?.participants) ? report.session.participants.length : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <ValenceIcon className={`h-4 w-4 ${valenceIndicator.color}`} />
                          <span>{valence.toFixed(2)}</span>
                          <Badge variant="outline" className="text-xs">
                            {valenceIndicator.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.session?.suggestions?.length ?? 0}</Badge>
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
                                <DialogTitle>{report.session?.name || '-'}</DialogTitle>
                                <DialogDescription>Session Report - {report.session?.startTime || '-'}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Report Header */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="font-medium">{report.session?.duration || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Participants</p>
                                    <p className="font-medium">{Array.isArray(report.session?.participants) ? report.session.participants.length : '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Avg Valence</p>
                                    <p className="font-medium">{valence.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Suggestions</p>
                                    <p className="font-medium">{report.session?.suggestions?.length ?? 0}</p>
                                  </div>
                                </div>

                                {/* Highlights, Concerns, Recommendations */}
                                <div>
                                  <h4 className="font-semibold text-green-700 mb-2">Highlights</h4>
                                  <ul className="space-y-1">
                                    {report.summary?.highlights?.map?.((highlight: string, index: number) => (
                                      <li key={index} className="text-sm text-gray-600 flex items-start">
                                        <span className="text-green-500 mr-2">•</span>
                                        {highlight}
                                      </li>
                                    )) || <li className="text-sm text-gray-400">-</li>}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-orange-700 mb-2">Areas of Concern</h4>
                                  <ul className="space-y-1">
                                    {report.summary?.concerns?.map?.((concern: string, index: number) => (
                                      <li key={index} className="text-sm text-gray-600 flex items-start">
                                        <span className="text-orange-500 mr-2">•</span>
                                        {concern}
                                      </li>
                                    )) || <li className="text-sm text-gray-400">-</li>}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-blue-700 mb-2">Recommendations</h4>
                                  <ul className="space-y-1">
                                    {report.summary?.recommendations?.map?.((rec: string, index: number) => (
                                      <li key={index} className="text-sm text-gray-600 flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        {rec}
                                      </li>
                                    )) || <li className="text-sm text-gray-400">-</li>}
                                  </ul>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadSessionReport(report)}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download PDF
                                  </Button>
                                  <Button size="sm">Share Report</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadSessionReport(report)}
                          >
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
