"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/hooks/use-api"
import { settingsApi } from "@/lib/api"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Settings, Bell, Camera, Mic, Shield, Trash2, Save } from "lucide-react"

export default function SettingsPage() {
  const { data, loading, error, refetch } = useApi(() => settingsApi.get(), [])
  const [settings, setSettings] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (data?.settings) setSettings(data.settings)
  }, [data])

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await settingsApi.update(settings)
      refetch()
      alert("Settings saved successfully!")
    } catch (e) {
      alert("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    // Mock account deletion
    console.log("Account deletion requested")
    alert("Account deletion request submitted. You will receive a confirmation email.")
  }

  if (loading || !settings) {
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
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Customize your COLLAB-MOOD experience</p>
          </div>
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emotion Detection Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Emotion Detection</span>
              </CardTitle>
              <CardDescription>Configure how the system detects and analyzes emotions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Detection Sensitivity</Label>
                <div className="mt-2">
                  <Slider
                    value={[settings.breakFrequency]}
                    onValueChange={(value) => handleSettingChange("breakFrequency", value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Current: {settings.breakFrequency}%</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="webcam">Enable Webcam Detection</Label>
                </div>
                <Switch
                  id="webcam"
                  checked={settings.enableWebcam}
                  onCheckedChange={(checked) => handleSettingChange("enableWebcam", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mic className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="microphone">Enable Microphone Detection</Label>
                </div>
                <Switch
                  id="microphone"
                  checked={settings.enableMicrophone}
                  onCheckedChange={(checked) => handleSettingChange("enableMicrophone", checked)}
                />
              </div>

              <div>
                <Label className="text-base font-medium">Detection Frequency</Label>
                <Select
                  value={settings.detectionFrequency}
                  onValueChange={(value) => handleSettingChange("detectionFrequency", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Every 30 seconds)</SelectItem>
                    <SelectItem value="medium">Medium (Every 15 seconds)</SelectItem>
                    <SelectItem value="high">High (Every 5 seconds)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Control when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <Switch
                  id="notifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => handleSettingChange("enableNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="suggestion-notifications">Suggestion Notifications</Label>
                  <Switch
                    id="suggestion-notifications"
                    checked={settings.suggestionNotifications}
                    onCheckedChange={(checked) => handleSettingChange("suggestionNotifications", checked)}
                    disabled={!settings.enableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="conflict-alerts">Conflict Alerts</Label>
                  <Switch
                    id="conflict-alerts"
                    checked={settings.conflictAlerts}
                    onCheckedChange={(checked) => handleSettingChange("conflictAlerts", checked)}
                    disabled={!settings.enableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="session-reminders">Session Reminders</Label>
                  <Switch
                    id="session-reminders"
                    checked={settings.sessionReminders}
                    onCheckedChange={(checked) => handleSettingChange("sessionReminders", checked)}
                    disabled={!settings.enableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & Data</span>
              </CardTitle>
              <CardDescription>Manage your data privacy and retention preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Data Retention Period</Label>
                <Select
                  value={settings.dataRetention}
                  onValueChange={(value) => handleSettingChange("dataRetention", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="anonymous-data">Share Anonymous Data</Label>
                  <p className="text-xs text-gray-500">Help improve the system with anonymized usage data</p>
                </div>
                <Switch
                  id="anonymous-data"
                  checked={settings.shareAnonymousData}
                  onCheckedChange={(checked) => handleSettingChange("shareAnonymousData", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-recording">Allow Session Recording</Label>
                  <p className="text-xs text-gray-500">Enable recording for detailed analysis</p>
                </div>
                <Switch
                  id="allow-recording"
                  checked={settings.allowRecording}
                  onCheckedChange={(checked) => handleSettingChange("allowRecording", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Interface Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Interface Preferences</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Language</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save">Auto-save Reports</Label>
                <Switch
                  id="auto-save"
                  checked={settings.autoSaveReports}
                  onCheckedChange={(checked) => handleSettingChange("autoSaveReports", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Manage your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={settings.displayName}
                  onChange={(e) => handleSettingChange("displayName", e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange("email", e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={settings.role} onValueChange={(value) => handleSettingChange("role", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Facilitator">Facilitator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions that will permanently affect your account</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data
                    from our servers, including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All session data and emotion tracking history</li>
                      <li>Feedback and preferences</li>
                      <li>Account information and settings</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
