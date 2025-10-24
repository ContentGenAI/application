'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Trash2, Clock, Send, CheckCircle } from 'lucide-react';

interface Props {
  contents: any[];
  onDelete: (id: string) => void;
}

export default function ContentScheduler({ contents, onDelete }: Props) {
  const [schedulingContent, setSchedulingContent] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const res = await fetch('/api/social/accounts');
      const data = await res.json();
      setConnectedAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleSchedule = async (contentId: string) => {
    if (!scheduleDate) {
      setError('Please select a date and time');
      return;
    }

    setError('');

    try {
      const res = await fetch('/api/content/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          scheduledAt: scheduleDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule content');
      }

      setSchedulingContent(null);
      setScheduleDate('');
      // Reload page to update content list
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePublish = async (contentId: string, platform: string) => {
    const hasAccount = connectedAccounts.some((acc) => acc.platform === platform);
    
    if (!hasAccount) {
      setError(`No ${platform} account connected. Please connect your account first.`);
      return;
    }

    if (!confirm(`Publish this post to ${platform} now?`)) {
      return;
    }

    setPublishing(contentId);
    setError('');

    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          platform,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish content');
      }

      alert('✅ Published successfully!');
      // Reload page to update content list
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(null);
    }
  };

  if (contents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
        <p className="text-gray-600">Generate your first piece of content to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {contents.map((content) => (
        <div key={content.id} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                  {content.platform}
                </span>
                {content.scheduledAt && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Scheduled for {format(new Date(content.scheduledAt), 'MMM d, yyyy h:mm a')}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{content.title}</h3>
              <p className="text-gray-700 whitespace-pre-wrap mb-3">{content.text}</p>
              {content.hashtags.length > 0 && (
                <p className="text-purple-600 text-sm">{content.hashtags.join(' ')}</p>
              )}
            </div>

            <button
              onClick={() => onDelete(content.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete content"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Schedule Section */}
          {schedulingContent === content.id ? (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
                <button
                  onClick={() => handleSchedule(content.id)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setSchedulingContent(null);
                    setScheduleDate('');
                    setError('');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
              {content.status === 'published' ? (
                <span className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Published {content.publishedAt && `on ${format(new Date(content.publishedAt), 'MMM d')}`}
                </span>
              ) : (
                <>
                  <button
                    onClick={() => setSchedulingContent(content.id)}
                    className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <Calendar className="w-4 h-4" />
                    {content.scheduledAt ? 'Reschedule' : 'Schedule Post'}
                  </button>
                  <button
                    onClick={() => handlePublish(content.id, content.platform)}
                    disabled={publishing === content.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {publishing === content.id ? 'Publishing...' : 'Publish Now'}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">
            Created {format(new Date(content.createdAt), 'MMM d, yyyy')}
          </div>
        </div>
      ))}
    </div>
  );
}

