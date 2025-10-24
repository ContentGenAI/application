'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';

export default function DebugUser() {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInfo() {
      try {
        // Get Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Get debug info
        const debugRes = await api.get('/api/debug');
        const debugData = await debugRes.json();

        // Try to ensure user
        const ensureRes = await api.post('/api/user/ensure', {});
        const ensureData = await ensureRes.json();

        setInfo({
          hasSession: !!session,
          sessionUserId: session?.user?.id,
          sessionUserEmail: session?.user?.email,
          debugInfo: debugData,
          ensureResult: ensureData,
        });
      } catch (error: any) {
        setInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    }
    loadInfo();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Debug Info</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(info, null, 2)}
      </pre>
      <div className="mt-4">
        <a href="/profile/setup" className="text-blue-600 hover:underline">
          Go to Profile Setup
        </a>
      </div>
    </div>
  );
}


