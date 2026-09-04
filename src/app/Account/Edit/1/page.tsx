'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Key,
  Mail,
  Phone,
  Building,
  Save,
  RotateCcw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { AuthService, CurrentUserProfile } from '@/services/authService';
import { useToast } from '@/components/ui/ToastContext';

export default function YourAccountPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    storeName: '',
    twoFactorEnabled: true,
    emailNotifications: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const current = AuthService.getCurrentUser();
    setProfile(current);
    setFormData({
      name: current.name,
      email: current.email,
      phone: current.phone,
      department: current.department,
      storeName: current.storeName,
      twoFactorEnabled: current.twoFactorEnabled,
      emailNotifications: current.emailNotifications,
    });
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      showToast('error', 'Validation Failed', 'Full Name and Email Address cannot be blank.');
      return;
    }

    if (passwordData.newPassword) {
      if (passwordData.newPassword.length < 8) {
        showToast('error', 'Weak Password', 'New password must be at least 8 characters long.');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showToast('error', 'Password Mismatch', 'New password and confirmation do not match.');
        return;
      }
    }

    setIsSaving(true);
    setTimeout(() => {
      const updated = AuthService.updateCurrentUser(formData);
      setProfile(updated);
      setIsSaving(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', 'Account Profile Saved', 'Your TicketIT account details and preferences have been updated.');
    }, 600);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
        storeName: profile.storeName,
        twoFactorEnabled: profile.twoFactorEnabled,
        emailNotifications: profile.emailNotifications,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('info', 'Changes Reverted', 'Reset form to saved profile.');
    }
  };

  if (!profile) return null;

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-ticketit-navy tracking-tight">Your Account</h1>
          <p className="text-xs text-ticketit-text-muted mt-0.5">
            Manage your personal profile, role permissions, assigned store partition, and security credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded bg-ticketit-navy text-white font-bold uppercase tracking-wider">
            {profile.role}
          </span>
          <span className="text-xs px-2.5 py-1 rounded bg-[#EAF7F0] text-ticketit-green border border-[#BDE7CE] font-bold">
            {profile.group}
          </span>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 max-w-3xl">
        {/* General Information Card */}
        <div className="bg-white border border-ticketit-border rounded-lg p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-ticketit-border mb-4">
            <User className="w-4 h-4 text-ticketit-pink" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-ticketit-navy">
              Profile Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Full Name <span className="text-ticketit-coral">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Email Address <span className="text-ticketit-coral">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Department / Operational Unit
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Assigned Store / Corporate Location
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Password Security Card */}
        <div className="bg-white border border-ticketit-border rounded-lg p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-ticketit-border mb-4">
            <Key className="w-4 h-4 text-ticketit-pink" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-ticketit-navy">
              Password & Security
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ticketit-navy mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm match"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-ticketit-border rounded focus:border-ticketit-pink focus:outline-none"
              />
            </div>
          </div>

          {passwordData.newPassword && (
            <div className="mt-3 p-2.5 bg-gray-50 rounded border border-ticketit-border text-[11px] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-ticketit-green" />
              <span>Password complexity meets retail enterprise security policies.</span>
            </div>
          )}
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="md" type="button" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="pink"
            size="md"
            type="submit"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
