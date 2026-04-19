'use client';

import { Button, Card, CardHeader, CardTitle, CardContent, Input, Switch, Separator } from '@legalmeet/ui';
import { useUIStore } from '@/stores/uiStore';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useUIStore();
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Full Name" value="Demo User" readOnly />
          <Input label="Email" value="demo@legalmeet.com" readOnly />
          <Input label="Company" placeholder="Your company name" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Dark Mode</p>
              <p className="text-xs text-slate-500">Toggle dark theme</p>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base text-red-600">Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>Delete Account</Button>
        </CardContent>
      </Card>

      <ConfirmDialog open={showDelete} onOpenChange={setShowDelete} title="Delete Account"
        description="This will permanently delete your account, all projects, meetings, recordings, and documents. This action is irreversible."
        onConfirm={() => fetch('/api/users/delete', { method: 'POST' })}
        confirmText="Delete My Account" variant="destructive" />
    </div>
  );
}
