'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { canUseCalendar } from '@/lib/plans';
import { Sparkles, Calendar as CalendarIcon, ArrowLeft, Clock, Instagram, Linkedin, Facebook } from 'lucide-react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

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

      // Check permissions
      if (subData.subscription && !canUseCalendar(subData.subscription.plan)) {
        router.push('/subscription?upgrade=calendar');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getScheduledPosts = (date: Date) => {
    return contents.filter((content) => {
      if (!content.scheduledAt) return false;
      const scheduledDate = parseISO(content.scheduledAt);
      return isSameDay(scheduledDate, date);
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
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

  const days = getDaysInMonth();
  const today = new Date();

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
                <CalendarIcon className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">לוח שנה</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Month Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← חודש קודם
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              חודש הבא →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Calendar Days */}
            {days.map((day) => {
              const scheduledPosts = getScheduledPosts(day);
              const isToday = isSameDay(day, today);
              const isPast = day < today && !isToday;

              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square border rounded-lg p-2 ${
                    isToday ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                  } ${isPast ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {scheduledPosts.slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center gap-1 bg-purple-100 text-purple-700 rounded px-1 py-0.5 text-xs"
                        title={post.title}
                      >
                        {getPlatformIcon(post.platform)}
                        <Clock className="w-3 h-3" />
                      </div>
                    ))}
                    {scheduledPosts.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{scheduledPosts.length - 3} עוד
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Posts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">פוסטים מתוזמנים</h3>
          <div className="space-y-3">
            {contents
              .filter((c) => c.scheduledAt)
              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
              .slice(0, 10)
              .map((post) => (
                <div key={post.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300">
                  <div className="flex-shrink-0">
                    {getPlatformIcon(post.platform)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{post.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">{post.text}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(parseISO(post.scheduledAt), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            {contents.filter((c) => c.scheduledAt).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>אין פוסטים מתוזמנים</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


