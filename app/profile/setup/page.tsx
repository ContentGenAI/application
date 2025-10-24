'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Sparkles } from 'lucide-react';

const INDUSTRIES = [
  'E-commerce',
  'Technology',
  'Healthcare',
  'Education',
  'Real Estate',
  'Food & Beverage',
  'Fashion',
  'Finance',
  'Fitness',
  'Marketing',
  'Travel',
  'Other',
];

const TONES = [
  'Professional',
  'Casual',
  'Friendly',
  'Inspirational',
  'Humorous',
  'Educational',
  'Bold',
  'Empathetic',
];

export default function ProfileSetup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    tone: '',
    targetAudience: '',
    keywords: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Ensure user exists in database when component loads
  useEffect(() => {
    const ensureUser = async () => {
      try {
        const res = await api.post('/api/user/ensure', {});
        const data = await res.json();
        console.log('User ensure result:', data);
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to ensure user exists');
        }
        
        if (!data.success) {
          throw new Error('User could not be created');
        }
        
        setInitialized(true);
      } catch (err: any) {
        console.error('Failed to ensure user:', err);
        setError('Failed to initialize your account. Please try signing in again.');
        setInitialized(true);
      }
    };
    ensureUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const keywordsArray = formData.keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k);

      // Use api client which automatically adds auth header
      const res = await api.post('/api/profile', {
        businessName: formData.businessName,
        industry: formData.industry,
        tone: formData.tone,
        targetAudience: formData.targetAudience,
        keywords: keywordsArray,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <span className="text-3xl font-bold text-gray-900">AutoContent.AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Set up your business profile</h1>
          <p className="text-gray-600">
            Help us understand your business so we can create better content for you
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                id="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                placeholder="Your business name"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                Content Tone *
              </label>
              <select
                id="tone"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
              >
                <option value="">Select your preferred tone</option>
                {TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience *
              </label>
              <textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none"
                placeholder="Describe your target audience (e.g., small business owners, millennials interested in fitness)"
              />
            </div>

            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (optional)
              </label>
              <input
                id="keywords"
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                placeholder="Enter keywords separated by commas (e.g., growth, success, innovation)"
              />
              <p className="text-sm text-gray-500 mt-1">
                These keywords will be included in your generated content
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

