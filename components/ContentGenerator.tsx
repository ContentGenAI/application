'use client';

import { useState } from 'react';
import { Sparkles, Instagram, Linkedin, Facebook } from 'lucide-react';

interface Props {
  onContentGenerated: (content: any) => void;
}

export default function ContentGenerator({ onContentGenerated }: Props) {
  const [platform, setPlatform] = useState<string>('instagram');
  const [topic, setTopic] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-100 text-pink-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-100 text-blue-600' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-100 text-blue-700' },
  ];

  const handleGenerate = async () => {
    if (!topic && !customPrompt) {
      setError('Please enter a topic or custom prompt');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          topic,
          customPrompt: customPrompt || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.upgradeRequired) {
          setError(`${data.error} - Remaining: ${data.remaining || 0}`);
        } else {
          throw new Error(data.error || 'Failed to generate content');
        }
        return;
      }

      // Clear form
      setTopic('');
      setCustomPrompt('');
      
      // Notify parent component
      onContentGenerated(data.content);

      // Show success message
      alert('✨ Content generated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Generate AI Content
        </h2>
        <p className="text-gray-600">
          Create engaging social media posts powered by AI
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Platform Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Platform
        </label>
        <div className="grid grid-cols-3 gap-4">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  platform === p.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full ${p.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-gray-900">{p.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic Input */}
      <div className="mb-6">
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
          Topic or Main Idea
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., New product launch, Summer sale, Tips for productivity..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
          disabled={generating}
        />
      </div>

      {/* Advanced Options Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {showAdvanced ? '− Hide' : '+ Show'} Advanced Options
        </button>
      </div>

      {/* Custom Prompt (Advanced) */}
      {showAdvanced && (
        <div className="mb-6">
          <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Prompt (Optional)
          </label>
          <textarea
            id="customPrompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter specific instructions for the AI... (This will override the topic)"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none"
            disabled={generating}
          />
          <p className="text-xs text-gray-500 mt-1">
            Provide detailed instructions to customize the generated content exactly as you want it.
          </p>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating || (!topic && !customPrompt)}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {generating ? (
          <>
            <Sparkles className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Content
          </>
        )}
      </button>

      {/* Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Tips for Better Results</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Be specific with your topic or idea</li>
          <li>• Use custom prompts for more control over the output</li>
          <li>• Your business profile settings will be used to personalize content</li>
          <li>• Generated content includes captions and hashtags</li>
        </ul>
      </div>
    </div>
  );
}

