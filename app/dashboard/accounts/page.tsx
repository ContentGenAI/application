'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import {
  Sparkles,
  ArrowLeft,
  Facebook,
  Instagram,
  Linkedin,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface SocialAccount {
  id: string;
  platform: string;
  accountId: string | null;
  accountName: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AccountsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadAccounts();
    }

    // Check for OAuth callback messages
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      setMessage({ type: 'success', text: 'Account connected successfully!' });
      // Clear URL params
      window.history.replaceState({}, '', '/dashboard/accounts');
    } else if (error) {
      setMessage({ type: 'error', text: `Error: ${error}` });
      window.history.replaceState({}, '', '/dashboard/accounts');
    }
  }, [user, searchParams]);

  const loadAccounts = async () => {
    try {
      const res = await api.get('/api/social/accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      const res = await api.post('/api/social/connect', { platform });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect');
      }

      // Redirect to OAuth
      window.location.href = data.authUrl;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setConnecting(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) {
      return;
    }

    try {
      const res = await api.delete(`/api/social/accounts?id=${accountId}`);
      
      if (!res.ok) {
        throw new Error('Failed to disconnect');
      }

      setMessage({ type: 'success', text: 'Account disconnected' });
      loadAccounts();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="w-6 h-6 text-blue-600" />;
      case 'instagram':
        return <Instagram className="w-6 h-6 text-pink-600" />;
      case 'linkedin':
        return <Linkedin className="w-6 h-6 text-blue-700" />;
      default:
        return <Sparkles className="w-6 h-6 text-gray-600" />;
    }
  };

  const isConnected = (platform: string) => {
    return accounts.some((acc) => acc.platform === platform);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  const platforms = [
    { id: 'facebook', name: 'Facebook', color: 'blue' },
    { id: 'instagram', name: 'Instagram', color: 'pink' },
    { id: 'linkedin', name: 'LinkedIn', color: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                חזרה ללוח הבקרה
              </Link>
              <div className="flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">חשבונות מחוברים</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Connect New Account */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">חבר חשבון חדש</h2>
          <p className="text-gray-600 mb-6">
            חבר את החשבונות שלך כדי לפרסם אוטומטית פוסטים שנוצרו באמצעות AI
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleConnect(platform.id)}
                disabled={isConnected(platform.id) || connecting === platform.id}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-3 transition-all ${
                  isConnected(platform.id)
                    ? 'border-green-200 bg-green-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                } ${connecting === platform.id ? 'opacity-50' : ''}`}
              >
                {getPlatformIcon(platform.id)}
                <span className="font-semibold text-gray-900">{platform.name}</span>
                {isConnected(platform.id) ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    מחובר
                  </span>
                ) : connecting === platform.id ? (
                  <span className="text-xs text-gray-600">מתחבר...</span>
                ) : (
                  <Plus className="w-4 h-4 text-purple-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">חשבונות מחוברים</h2>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>אין חשבונות מחוברים עדיין</p>
              <p className="text-sm">חבר חשבון כדי להתחיל לפרסם</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {getPlatformIcon(account.platform)}
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {account.platform}
                      </h3>
                      {account.accountName && (
                        <p className="text-sm text-gray-600">{account.accountName}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        מחובר {format(new Date(account.createdAt), 'MMM d, yyyy')}
                      </p>
                      {account.expiresAt && (
                        <p className="text-xs text-orange-600">
                          פג תוקף {format(new Date(account.expiresAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect(account.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Disconnect"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">איך זה עובד?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>חבר את חשבונות המדיה החברתית שלך</li>
                <li>צור תוכן עם AI בלוח הבקרה</li>
                <li>פרסם ישירות או תזמן לפרסום אוטומטי</li>
                <li>עקוב אחר הביצועים באנליטיקס</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


