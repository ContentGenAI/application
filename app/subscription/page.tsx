'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Check, ArrowLeft, Crown } from 'lucide-react';
import Link from 'next/link';

export default function Subscription() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      const data = await res.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(true);
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      alert(error.message);
      setUpgrading(false);
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

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Subscription & Billing</h1>
          <p className="text-xl text-gray-600">
            {isPro
              ? 'You are currently on the Pro plan'
              : 'Upgrade to Pro for unlimited content generation'}
          </p>
        </div>

        {/* Current Plan Status */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Current Plan</h2>
                <div className="flex items-center gap-3">
                  {isPro ? (
                    <>
                      <Crown className="w-6 h-6 text-purple-600" />
                      <span className="text-xl font-semibold text-purple-600">Pro Plan</span>
                    </>
                  ) : (
                    <span className="text-xl font-semibold text-gray-700">Free Plan</span>
                  )}
                </div>
              </div>
              {isPro && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
              )}
            </div>

            {isPro && subscription?.renewalDate && (
              <p className="text-gray-600">
                Your subscription will renew on{' '}
                {new Date(subscription.renewalDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">בחר תוכנית</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className={`bg-white rounded-xl shadow-lg p-8 ${subscription?.plan === 'basic' ? 'ring-2 ring-purple-600' : ''}`}>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₪49</span>
                <span className="text-gray-600">/חודש</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>4 פוסטים בחודש</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>כיתובים והאשטאגים</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>כל הפלטפורמות</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>תמיכה קהילתית</span>
                </li>
              </ul>
              <button
                disabled={subscription?.plan === 'basic'}
                className="w-full py-3 border-2 border-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
              >
                {subscription?.plan === 'basic' ? 'תוכנית נוכחית' : 'Basic'}
              </button>
            </div>

            {/* Pro Plan */}
            <div className={`bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-xl p-8 text-white relative overflow-hidden ${subscription?.plan === 'pro' ? 'ring-4 ring-yellow-300' : ''}`}>
              <div className="absolute top-4 right-4">
                <Crown className="w-8 h-8 text-yellow-300" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₪99</span>
                <span className="text-purple-100">/חודש</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 mt-0.5" />
                  <span>8 פוסטים בחודש</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 mt-0.5" />
                  <span>תמונות AI</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 mt-0.5" />
                  <span>תזמון תוכן</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 mt-0.5" />
                  <span>לוח שנה מתוזמן</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 mt-0.5" />
                  <span>כל הפלטפורמות</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-300 mt-0.5" />
                  <span>תמיכה במייל</span>
                </li>
              </ul>
              <button
                onClick={() => subscription?.plan !== 'pro' && handleUpgrade('pro')}
                disabled={upgrading || subscription?.plan === 'pro'}
                className="w-full py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-semibold transition-colors disabled:opacity-50"
              >
                {subscription?.plan === 'pro' ? 'תוכנית נוכחית' : upgrading ? 'מעבד...' : 'שדרוג ל-Pro'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className={`bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200 ${subscription?.plan === 'premium' ? 'ring-2 ring-purple-600' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
                <Crown className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">₪149</span>
                <span className="text-gray-600">/חודש</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>12 פוסטים בחודש</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>תמונות AI</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>תזמון מתקדם</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>לוח שנה מתוזמן</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>אנליטיקס מתקדם 📊</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>פרסום אוטומטי</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span>תמיכה עדיפה</span>
                </li>
              </ul>
              <button
                onClick={() => subscription?.plan !== 'premium' && handleUpgrade('premium')}
                disabled={upgrading || subscription?.plan === 'premium'}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors disabled:opacity-50"
              >
                {subscription?.plan === 'premium' ? 'תוכנית נוכחית' : upgrading ? 'מעבד...' : 'שדרוג ל-Premium'}
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes! You can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards through Stripe, our secure payment processor."
            />
            <FAQItem
              question="Can I change plans later?"
              answer="Absolutely! You can upgrade or downgrade your plan at any time from this page."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="We offer a 14-day money-back guarantee. If you're not satisfied, contact our support team for a full refund."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}

