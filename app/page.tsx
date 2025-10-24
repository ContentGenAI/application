'use client';

import Link from 'next/link';
import { Sparkles, Calendar, TrendingUp, Zap, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">AutoContent.AI</span>
          </div>
          <div className="flex gap-4">
            {loading ? (
              <div className="px-4 py-2 text-gray-400">Loading...</div>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Generate Social Media Content
          <br />
          <span className="text-purple-600">In Seconds with AI</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AutoContent.AI creates engaging social media posts for Instagram, LinkedIn,
          Facebook, and TikTok tailored to your business and audience.
        </p>
        {!loading && (
          <div className="flex gap-4 justify-center">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/subscription"
                  className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-semibold text-lg transition-colors"
                >
                  View Plans
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-lg transition-colors"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 font-semibold text-lg transition-colors"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          Everything You Need to Succeed
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Sparkles className="w-12 h-12 text-purple-600" />}
            title="AI-Powered Content"
            description="Generate engaging captions, hashtags, and post ideas using GPT-4."
          />
          <FeatureCard
            icon={<Calendar className="w-12 h-12 text-blue-600" />}
            title="Smart Scheduling"
            description="Plan and schedule your content calendar weeks in advance."
          />
          <FeatureCard
            icon={<TrendingUp className="w-12 h-12 text-green-600" />}
            title="Business Profiles"
            description="Customize tone, keywords, and targeting for your brand."
          />
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-yellow-600" />}
            title="Multi-Platform"
            description="Create content for Instagram, LinkedIn, Facebook, and TikTok."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          תוכניות מחיר פשוטות
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            name="Basic"
            price="₪49"
            features={[
              '4 פוסטים מותאמים אישית בחודש',
              'כיתובים והאשטאגים',
              'כל הפלטפורמות',
              'תמיכה קהילתית',
            ]}
            cta="התחל עכשיו"
            ctaLink="/auth/signup"
            isAuthenticated={!!user}
          />
          <PricingCard
            name="Pro"
            price="₪99"
            features={[
              '8 פוסטים בחודש',
              'כיתובים, האשטאגים ותמונות',
              'תזמון תוכן',
              'לוח שנה מתוזמן 📅',
              'כל הפלטפורמות',
              'תמיכה במייל',
            ]}
            cta="התחל עכשיו"
            ctaLink="/auth/signup"
            highlighted
            isAuthenticated={!!user}
          />
          <PricingCard
            name="Premium"
            price="₪149"
            features={[
              '12 פוסטים בחודש',
              'כיתובים, האשטאגים ותמונות',
              'תזמון מתקדם',
              'לוח שנה מתוזמן 📅',
              'אנליטיקס מתקדם 📊',
              'פרסום אוטומטי',
              'תמיכה עדיפה',
            ]}
            cta="התחל עכשיו"
            ctaLink="/auth/signup"
            isAuthenticated={!!user}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 AutoContent.AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  cta,
  ctaLink,
  highlighted = false,
  isAuthenticated = false,
}: {
  name: string;
  price: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
  isAuthenticated?: boolean;
}) {
  // If user is logged in, link to subscription page instead of signup
  const linkHref = isAuthenticated ? '/subscription' : ctaLink;
  const buttonText = isAuthenticated ? 'שדרג עכשיו' : cta;

  return (
    <div
      className={`p-8 rounded-xl ${
        highlighted
          ? 'bg-purple-600 text-white shadow-xl scale-105'
          : 'bg-white shadow-sm'
      }`}
    >
      <h3
        className={`text-2xl font-bold mb-2 ${
          highlighted ? 'text-white' : 'text-gray-900'
        }`}
      >
        {name}
      </h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className={highlighted ? 'text-purple-100' : 'text-gray-600'}>
          /month
        </span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-xl">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={linkHref}
        className={`block w-full py-3 text-center rounded-lg font-semibold transition-colors ${
          highlighted
            ? 'bg-white text-purple-600 hover:bg-gray-100'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
}
