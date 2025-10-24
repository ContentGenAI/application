// Plan definitions and permissions

export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 49, // Israeli Shekels
    currency: '₪',
    interval: 'month',
    features: {
      postsPerMonth: 4,
      imageGeneration: false,
      scheduling: false,
      calendar: false,
      autoPublish: false,
      analytics: false,
      prioritySupport: false,
    },
    displayFeatures: [
      '4 AI-generated posts per month',
      'Caption and hashtags',
      'All platforms (Instagram, LinkedIn, Facebook, TikTok)',
      'Community support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    currency: '₪',
    interval: 'month',
    features: {
      postsPerMonth: 8,
      imageGeneration: true,
      scheduling: true,
      calendar: true,
      autoPublish: false,
      analytics: false,
      prioritySupport: false,
    },
    displayFeatures: [
      '8 AI-generated posts per month',
      'Caption, hashtags & images',
      'Content scheduling',
      'All platforms',
      'Email support',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 149,
    currency: '₪',
    interval: 'month',
    features: {
      postsPerMonth: 12,
      imageGeneration: true,
      scheduling: true,
      calendar: true,
      autoPublish: true,
      analytics: true,
      prioritySupport: true,
    },
    displayFeatures: [
      '12 AI-generated posts per month',
      'Caption, hashtags & images',
      'Advanced scheduling',
      'Auto-publish to social media',
      'Priority support',
      'Analytics dashboard',
    ],
    highlighted: true,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanLimits(planId: string) {
  const plan = PLANS[planId as PlanId];
  if (!plan) return PLANS.basic.features;
  return plan.features;
}

export function canGeneratePost(subscription: any): {
  allowed: boolean;
  reason?: string;
  remaining?: number;
} {
  if (!subscription) {
    return { allowed: false, reason: 'No active subscription' };
  }

  const limits = getPlanLimits(subscription.plan);
  const used = subscription.postsThisMonth || 0;
  const remaining = limits.postsPerMonth - used;

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `Monthly limit reached (${limits.postsPerMonth} posts)`,
      remaining: 0,
    };
  }

  return { allowed: true, remaining };
}

export function canUseImages(planId: string): boolean {
  return getPlanLimits(planId).imageGeneration;
}

export function canSchedule(planId: string): boolean {
  return getPlanLimits(planId).scheduling;
}

export function canAutoPublish(planId: string): boolean {
  return getPlanLimits(planId).autoPublish;
}

export function canUseCalendar(planId: string): boolean {
  return getPlanLimits(planId).calendar;
}

export function canUseAnalytics(planId: string): boolean {
  return getPlanLimits(planId).analytics;
}

