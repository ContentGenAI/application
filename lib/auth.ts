import { createServerClient } from './supabase-server';
import { prisma } from './prisma';

export async function getUser() {
  try {
    const supabaseServer = await createServerClient();
    const { data: { user }, error } = await supabaseServer.auth.getUser();
    
    if (error) {
      console.error('getUser error:', error.message);
      return null;
    }
    
    console.log('getUser result:', user ? `Found user ${user.id}` : 'No user');
    return user;
  } catch (error: any) {
    console.error('getUser exception:', error.message);
    return null;
  }
}

export async function ensureUserInDatabase(userId: string, email: string, name?: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (existingUser) {
    console.log('User already exists in database:', userId);
    return existingUser;
  }

  // Create user in database if they don't exist
  try {
    console.log('Creating NEW user in database:', { userId, email, name });
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        name: name || null,
        subscription: {
          create: {
            plan: 'basic',
            status: 'active',
            postsThisMonth: 0,
            resetDate: new Date(),
          },
        },
      },
    });
    console.log('✅ User created successfully in database:', newUser.id);
    return newUser;
  } catch (dbError: any) {
    console.error('❌ Database error creating user:', dbError.message);
    throw dbError;
  }
}

export async function getUserWithSubscription(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      business: true,
    },
  });
}

