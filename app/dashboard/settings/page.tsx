"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Bell,
  Shield,
  Palette,
  Trash2,
  Globe,
  Moon,
  Mail,
  AlertTriangle,
  Download,
  Key,
} from "lucide-react";

export default function SettingsPage() {
  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    analysisComplete: true,
    weeklyReport: false,
    productUpdates: true,
    securityAlerts: true,
  });

  // Appearance preferences state
  const [appearance, setAppearance] = useState({
    theme: "dark",
    language: "id",
    compactMode: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAppearanceChange = (key: keyof typeof appearance, value: string) => {
    setAppearance((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account settings and preferences
          </p>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="account" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="gap-2 text-red-600 data-[state=active]:text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Danger Zone</span>
              </TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Change Password */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        <Key className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Password & Security</h3>
                        <p className="text-xs text-slate-500">Update your password and security settings</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>
                  </div>

                  {/* Connected Accounts */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                        <Globe className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Connected Accounts</h3>
                        <p className="text-xs text-slate-500">Manage your connected Google account</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                          <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Google</p>
                          <p className="text-xs text-slate-500">Connected</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  {/* Data Export */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                        <Download className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Export Data</h3>
                        <p className="text-xs text-slate-500">Download all your account data</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Export My Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Notifications Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Email Notifications</h3>
                        <p className="text-xs text-slate-500">Receive notifications via email</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-xs text-slate-500">Receive all notifications via email</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notifications.emailNotifications}
                          onCheckedChange={() => handleNotificationChange("emailNotifications")}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="analysis-complete">Analysis Complete</Label>
                          <p className="text-xs text-slate-500">Get notified when analysis is complete</p>
                        </div>
                        <Switch
                          id="analysis-complete"
                          checked={notifications.analysisComplete}
                          onCheckedChange={() => handleNotificationChange("analysisComplete")}
                          disabled={!notifications.emailNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="weekly-report">Weekly Report</Label>
                          <p className="text-xs text-slate-500">Receive weekly summary of your analyses</p>
                        </div>
                        <Switch
                          id="weekly-report"
                          checked={notifications.weeklyReport}
                          onCheckedChange={() => handleNotificationChange("weeklyReport")}
                          disabled={!notifications.emailNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="product-updates">Product Updates</Label>
                          <p className="text-xs text-slate-500">Learn about new features and improvements</p>
                        </div>
                        <Switch
                          id="product-updates"
                          checked={notifications.productUpdates}
                          onCheckedChange={() => handleNotificationChange("productUpdates")}
                          disabled={!notifications.emailNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="security-alerts">Security Alerts</Label>
                          <p className="text-xs text-slate-500">Important security notifications</p>
                        </div>
                        <Switch
                          id="security-alerts"
                          checked={notifications.securityAlerts}
                          onCheckedChange={() => handleNotificationChange("securityAlerts")}
                          disabled={!notifications.emailNotifications}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how VidSense looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                        <Moon className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Theme</h3>
                        <p className="text-xs text-slate-500">Choose your preferred theme</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleAppearanceChange("theme", "light")}
                        className={`rounded-lg border-2 p-4 text-center transition-all ${
                          appearance.theme === "light"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="mb-2 flex h-8 w-full items-center justify-center rounded bg-white shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-200" />
                        </div>
                        <span className="text-xs font-medium">Light</span>
                      </button>
                      <button
                        onClick={() => handleAppearanceChange("theme", "dark")}
                        className={`rounded-lg border-2 p-4 text-center transition-all ${
                          appearance.theme === "dark"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="mb-2 flex h-8 w-full items-center justify-center rounded bg-slate-900 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                        </div>
                        <span className="text-xs font-medium">Dark</span>
                      </button>
                      <button
                        onClick={() => handleAppearanceChange("theme", "system")}
                        className={`rounded-lg border-2 p-4 text-center transition-all ${
                          appearance.theme === "system"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="mb-2 flex h-8 w-full items-center justify-center rounded bg-gradient-to-r from-white to-slate-900 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-slate-200 to-slate-400" />
                        </div>
                        <span className="text-xs font-medium">System</span>
                      </button>
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                        <Globe className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Language</h3>
                        <p className="text-xs text-slate-500">Select your preferred language</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAppearanceChange("language", "id")}
                        className={`rounded-lg border-2 p-3 text-center transition-all ${
                          appearance.language === "id"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-sm font-medium">Bahasa Indonesia</span>
                      </button>
                      <button
                        onClick={() => handleAppearanceChange("language", "en")}
                        className={`rounded-lg border-2 p-3 text-center transition-all ${
                          appearance.language === "en"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-sm font-medium">English</span>
                      </button>
                    </div>
                  </div>

                  {/* Compact Mode */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="compact-mode">Compact Mode</Label>
                        <p className="text-xs text-slate-500">Reduce spacing and font sizes</p>
                      </div>
                      <Switch
                        id="compact-mode"
                        checked={appearance.compactMode}
                        onCheckedChange={(checked) =>
                          handleAppearanceChange("compactMode", checked ? "true" : "false")
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Danger Zone */}
            <TabsContent value="danger" className="mt-6">
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-red-900">Danger Zone</CardTitle>
                      <CardDescription className="text-red-700">
                        Irreversible and destructive actions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Delete Account */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-900">Delete Account</h3>
                        <p className="mt-1 text-xs text-red-700">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-red-200" />
                    <div className="flex justify-end">
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>

                  {/* Clear All Data */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-orange-900">Clear All Data</h3>
                        <p className="mt-1 text-xs text-orange-700">
                          Delete all your analysis history and reset your account to default state.
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-orange-200" />
                    <div className="flex justify-end">
                      <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" size="sm">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Clear All Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
