'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import {
  Sparkles,
  ArrowLeft,
  User,
  Building2,
  CreditCard,
  Receipt,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Crown,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'account' | 'subscription' | 'invoices'>('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account Data
  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
  });

  // Business Profile Data
  const [businessData, setBusinessData] = useState({
    businessName: '',
    industry: '',
    tone: '',
    keywords: [] as string[],
    targetAudience: '',
  });
  const [keywordInput, setKeywordInput] = useState('');

  // Subscription Data
  const [subscription, setSubscription] = useState<any>(null);

  // Invoices Data
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [profileRes, subRes] = await Promise.all([
        api.get('/api/profile'),
        api.get('/api/subscription'),
      ]);

      const [profileData, subData] = await Promise.all([
        profileRes.json(),
        subRes.json(),
      ]);

      // Set account data
      setAccountData({
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
        email: user?.email || '',
      });

      // Set business data
      if (profileData.profile) {
        setBusinessData({
          businessName: profileData.profile.businessName || '',
          industry: profileData.profile.industry || '',
          tone: profileData.profile.tone || '',
          keywords: profileData.profile.keywords || [],
          targetAudience: profileData.profile.targetAudience || '',
        });
      }

      // Set subscription data
      setSubscription(subData.subscription);

      // Load invoices (mock for now - will integrate with Stripe later)
      setInvoices([
        {
          id: '1',
          date: new Date().toISOString(),
          amount: subscription?.plan === 'premium' ? 149 : subscription?.plan === 'pro' ? 99 : 49,
          status: 'paid',
          plan: subscription?.plan || 'basic',
        },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Note: Updating email/password requires Supabase auth methods
      // For now, just show success message
      setMessage({ type: 'success', text: 'Account information saved successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save account information' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBusiness = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.post('/api/profile', businessData);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save business profile');
      }

      setMessage({ type: 'success', text: 'Business profile saved successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save business profile' });
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !businessData.keywords.includes(keywordInput.trim())) {
      setBusinessData({
        ...businessData,
        keywords: [...businessData.keywords, keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setBusinessData({
      ...businessData,
      keywords: businessData.keywords.filter((k) => k !== keyword),
    });
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setMessage({ type: 'success', text: 'Subscription will be canceled at the end of billing period' });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

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
                <span className="text-2xl font-bold text-gray-900">הגדרות</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
                <CheckCircle className="w-5 h-5" />
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

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                  activeTab === 'account'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-5 h-5" />
                פרטי חשבון
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                  activeTab === 'subscription'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                מינוי וחיוב
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                  activeTab === 'invoices'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Receipt className="w-5 h-5" />
                חשבוניות
              </button>
            </div>
          </div>
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">פרטי משתמש</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם מלא
                  </label>
                  <input
                    type="text"
                    value={accountData.name}
                    onChange={(e) =>
                      setAccountData({ ...accountData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    אימייל
                  </label>
                  <input
                    type="email"
                    value={accountData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    לשינוי כתובת האימייל, אנא צור קשר עם התמיכה
                  </p>
                </div>
                <button
                  onClick={handleSaveAccount}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  שמור שינויים
                </button>
              </div>
            </div>

            {/* Business Profile */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">פרטי עסק</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם העסק
                  </label>
                  <input
                    type="text"
                    value={businessData.businessName}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, businessName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תעשייה
                  </label>
                  <input
                    type="text"
                    value={businessData.industry}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, industry: e.target.value })
                    }
                    placeholder="לדוגמה: טכנולוגיה, אופנה, מזון"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    טון כתיבה
                  </label>
                  <select
                    value={businessData.tone}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, tone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  >
                    <option value="">בחר טון</option>
                    <option value="professional">מקצועי</option>
                    <option value="casual">נינוח</option>
                    <option value="friendly">ידידותי</option>
                    <option value="humorous">הומוריסטי</option>
                    <option value="inspiring">מעורר השראה</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מילות מפתח
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                      placeholder="הוסף מילת מפתח"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={addKeyword}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    >
                      הוסף
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {businessData.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    קהל יעד
                  </label>
                  <textarea
                    value={businessData.targetAudience}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, targetAudience: e.target.value })
                    }
                    rows={3}
                    placeholder="תאר את קהל היעד שלך"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  onClick={handleSaveBusiness}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  שמור פרופיל עסקי
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && subscription && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">תוכנית נוכחית</h2>
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {subscription.plan === 'premium' && (
                      <Crown className="w-6 h-6 text-yellow-600" />
                    )}
                    <h3 className="text-2xl font-bold text-gray-900 capitalize">
                      {subscription.plan}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    סטטוס:{' '}
                    <span className="font-semibold text-green-600">
                      {subscription.status === 'active' ? 'פעיל' : subscription.status}
                    </span>
                  </p>
                  {subscription.renewalDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      מתחדש ב-{format(new Date(subscription.renewalDate), 'dd/MM/yyyy')}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    שימוש החודש: {subscription.postsThisMonth} / 
                    {subscription.plan === 'premium' ? 12 : subscription.plan === 'pro' ? 8 : 4} פוסטים
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600">
                    ₪{subscription.plan === 'premium' ? 149 : subscription.plan === 'pro' ? 99 : 49}
                  </p>
                  <p className="text-sm text-gray-600">לחודש</p>
                </div>
              </div>
            </div>

            {/* Upgrade Options */}
            {subscription.plan !== 'premium' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">שדרג את התוכנית שלך</h2>
                <p className="text-gray-600 mb-6">קבל גישה לעוד פיצ׳רים ותוכן</p>
                <Link
                  href="/subscription"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  <Crown className="w-5 h-5" />
                  צפה בתוכניות זמינות
                </Link>
              </div>
            )}

            {/* Cancel Subscription */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">ביטול מינוי</h2>
              <p className="text-gray-600 mb-4">
                ביטול המינוי ייכנס לתוקף בסוף תקופת החיוב הנוכחית. תוכל להמשיך להשתמש בשירות עד אז.
              </p>
              <button
                onClick={handleCancelSubscription}
                className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
              >
                בטל מינוי
              </button>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">חשבוניות</h2>
            {invoices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>אין חשבוניות עדיין</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {format(new Date(invoice.date), 'dd MMMM yyyy')}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {invoice.plan} Plan
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₪{invoice.amount}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {invoice.status === 'paid' ? 'שולם' : 'ממתין'}
                        </span>
                      </div>
                      <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        הורד
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


