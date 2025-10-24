import { NextRequest } from 'next/server';
import { createServerClient } from './supabase-server';

// Get user from Authorization header (more reliable than cookies)
export async function getUserFromHeader(req: NextRequest) {
  // Get token from Authorization header
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No Authorization header found');
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('getUserFromHeader error:', error.message);
      return null;
    }

    console.log('getUserFromHeader result:', user ? `Found user ${user.id}` : 'No user');
    return user;
  } catch (error: any) {
    console.error('getUserFromHeader exception:', error.message);
    return null;
  }
}

