'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Sparkles, Mail, CheckCircle } from 'lucide-react';

export default function VerifyEmail() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Get email from URL params or session
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // Listen for auth state changes (when user clicks email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User confirmed email and is now signed in
          window.location.href = '/profile/setup';
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const handleResendEmail = async () => {
    if (!email) {
      alert('Email address not found. Please sign up again.');
      return;
    }

    setChecking(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      alert('Verification email resent! Check your inbox.');
    } catch (error: any) {
      alert(error.message || 'Failed to resend email');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <span className="text-3xl font-bold text-gray-900">AutoContent.AI</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h1>
          
          <p className="text-gray-600 mb-6">
            We've sent a confirmation link to{' '}
            {email && <span className="font-semibold text-gray-900">{email}</span>}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your email inbox</li>
                  <li>Look for an email from Supabase</li>
                  <li>Click the confirmation link</li>
                  <li>You'll be redirected back here automatically</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={checking || !email}
              className="w-full py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? 'Sending...' : 'Resend confirmation email'}
            </button>

            <p className="text-sm text-gray-500">
              Already confirmed?{' '}
              <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <strong>For development:</strong> You can disable email confirmation in Supabase
            </p>
            <p className="text-xs text-gray-500">
              Supabase Dashboard → Authentication → Settings → Email Auth → Disable "Enable email confirmations"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


