'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { canUseAnalytics } from '@/lib/plans';
import { Sparkles, TrendingUp, ArrowLeft, BarChart3, Calendar, Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import Link from 'next/link';
import { format, subDays } from 'date-fns';

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [subRes, contentRes] = await Promise.all([
        api.get('/api/subscription'),
        api.get('/api/content'),
      ]);

      const [subData, contentData] = await Promise.all([
        subRes.json(),
        contentRes.json(),
      ]);

      setSubscription(subData.subscription);
      setContents(contentData.contents || []);

      // Check permissions - only Premium can access
      if (subData.subscription && !canUseAnalytics(subData.subscription.plan)) {
        router.push('/subscription?upgrade=analytics');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  // Calculate statistics
  const totalPosts = contents.length;
  const scheduledPosts = contents.filter((c) => c.scheduledAt).length;
  const last30Days = contents.filter((c) => {
    const createdDate = new Date(c.createdAt);
    return createdDate >= subDays(new Date(), 30);
  }).length;

  const platformBreakdown = contents.reduce((acc: any, content) => {
    acc[content.platform] = (acc[content.platform] || 0) + 1;
    return acc;
  }, {});

  // Mock analytics data (In production, this would come from social media APIs)
  const mockAnalytics = {
    totalViews: Math.floor(Math.random() * 10000) + 5000,
    totalLikes: Math.floor(Math.random() * 1000) + 500,
    totalComments: Math.floor(Math.random() * 300) + 100,
    totalShares: Math.floor(Math.random() * 200) + 50,
    engagementRate: (Math.random() * 5 + 2).toFixed(1),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                חזרה ללוח הבקרה
              </Link>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">אנליטיקס</span>
              </div>
            </div>
            <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Premium Feature
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<Eye className="w-6 h-6 text-blue-600" />}
            title="סה״כ צפיות"
            value={mockAnalytics.totalViews.toLocaleString()}
            change="+12.5%"
            trend="up"
          />
          <StatsCard
            icon={<Heart className="w-6 h-6 text-red-600" />}
            title="לייקים"
            value={mockAnalytics.totalLikes.toLocaleString()}
            change="+8.3%"
            trend="up"
          />
          <StatsCard
            icon={<MessageCircle className="w-6 h-6 text-green-600" />}
            title="תגובות"
            value={mockAnalytics.totalComments.toLocaleString()}
            change="+15.7%"
            trend="up"
          />
          <StatsCard
            icon={<Share2 className="w-6 h-6 text-purple-600" />}
            title="שיתופים"
            value={mockAnalytics.totalShares.toLocaleString()}
            change="+5.2%"
            trend="up"
          />
        </div>

        {/* Engagement Rate */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">שיעור מעורבות</h3>
            <span className="text-3xl font-bold text-purple-600">{mockAnalytics.engagementRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full transition-all"
              style={{ width: `${mockAnalytics.engagementRate}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            שיעור מעורבות ממוצע בכל הפלטפורמות
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Content Statistics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">סטטיסטיקת תוכן</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">סה״כ פוסטים</span>
                <span className="font-bold text-blue-600">{totalPosts}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">פוסטים מתוזמנים</span>
                <span className="font-bold text-purple-600">{scheduledPosts}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">פוסטים ב-30 יום</span>
                <span className="font-bold text-green-600">{last30Days}</span>
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">חלוקה לפי פלטפורמה</h3>
            <div className="space-y-3">
              {Object.entries(platformBreakdown).map(([platform, count]: [string, any]) => {
                const percentage = ((count / totalPosts) * 100).toFixed(1);
                return (
                  <div key={platform}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-700 capitalize">{platform}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Best Performing Posts */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">פוסטים מובילים</h3>
          <div className="space-y-3">
            {contents.slice(0, 5).map((post, index) => (
              <div key={post.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{post.title}</h4>
                  <p className="text-sm text-gray-600 capitalize">{post.platform}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {Math.floor(Math.random() * 5000) + 1000} צפיות
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(post.createdAt), 'MMM d')}
                  </div>
                </div>
              </div>
            ))}
            {contents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>אין מספיק נתונים עדיין</p>
                <p className="text-sm">צור פוסטים כדי לראות אנליטיקס</p>
              </div>
            )}
          </div>
        </div>

        {/* Note about mock data */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>הערה:</strong> האנליטיקס המוצג כרגע הוא הדגמה. בפרודקשן, נתונים אלו יתחברו ישירות לפלטפורמות המדיה החברתית שלך כדי להציג נתונים אמיתיים.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  icon,
  title,
  value,
  change,
  trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}


