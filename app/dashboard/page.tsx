'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, LogOut, Settings, PlusCircle, Calendar, Trash2, BarChart3, CalendarDays } from 'lucide-react';
import ContentGenerator from '@/components/ContentGenerator';
import ContentScheduler from '@/components/ContentScheduler';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'generate' | 'schedule'>('generate');
  const [contents, setContents] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usageInfo, setUsageInfo] = useState<{limit: number, used: number, remaining: number} | null>(null);

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
      const [profileRes, contentsRes, subscriptionRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/content'),
        fetch('/api/subscription'),
      ]);

      const [profileData, contentsData, subscriptionData] = await Promise.all([
        profileRes.json(),
        contentsRes.json(),
        subscriptionRes.json(),
      ]);

      setProfile(profileData.profile);
      setContents(contentsData.contents || []);
      setSubscription(subscriptionData.subscription);

      // Calculate usage
      if (subscriptionData.subscription) {
        const limits: Record<string, number> = {
          basic: 4,
          pro: 8,
          premium: 12,
        };
        const limit = limits[subscriptionData.subscription.plan] || 4;
        const used = subscriptionData.subscription.postsThisMonth || 0;
        setUsageInfo({
          limit,
          used,
          remaining: Math.max(0, limit - used),
        });
      }

      // If no profile, redirect to setup
      if (!profileData.profile) {
        router.push('/profile/setup');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  };

  const handleContentGenerated = (newContent: any) => {
    setContents([newContent, ...contents]);
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      await fetch(`/api/content?id=${contentId}`, { method: 'DELETE' });
      setContents(contents.filter((c) => c.id !== contentId));
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">AutoContent.AI</span>
            </div>
            <div className="flex items-center gap-4">
              {usageInfo && (
                <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                  {usageInfo.remaining}/{usageInfo.limit} פוסטים נותרו
                </span>
              )}
              <span className="text-sm text-gray-600">
                {subscription?.plan === 'premium' ? (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    Premium Plan
                  </span>
                ) : subscription?.plan === 'pro' ? (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    Pro Plan
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                    Basic Plan
                  </span>
                )}
              </span>
              <button
                onClick={() => router.push('/settings')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            {profile ? `Creating content for ${profile.businessName}` : 'Get started by generating content'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/dashboard/accounts"
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-green-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">חשבונות</h3>
            </div>
            <p className="text-sm text-gray-600">חבר חשבונות מדיה חברתית</p>
          </Link>

          <Link
            href="/dashboard/calendar"
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarDays className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">לוח שנה</h3>
            </div>
            <p className="text-sm text-gray-600">פוסטים מתוזמנים</p>
            {subscription && (subscription.plan === 'basic') && (
              <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                Pro & Premium
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/analytics"
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">אנליטיקס</h3>
            </div>
            <p className="text-sm text-gray-600">ביצועי פוסטים</p>
            {subscription && (subscription.plan !== 'premium') && (
              <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                Premium
              </span>
            )}
          </Link>

          <Link
            href="/subscription"
            className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">שדרג תוכנית</h3>
            </div>
            <p className="text-sm text-purple-100">פיצ׳רים נוספים</p>
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('generate')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'generate'
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Generate Content
              </div>
              {activeTab === 'generate' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'schedule'
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Content Library
              </div>
              {activeTab === 'schedule' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'generate' ? (
          <ContentGenerator onContentGenerated={handleContentGenerated} />
        ) : (
          <ContentScheduler contents={contents} onDelete={handleDeleteContent} />
        )}
      </div>
    </div>
  );
}

