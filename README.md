# 🚀 AutoContent.AI

**AutoContent.AI** is a SaaS platform that automatically generates social media content for small business owners using AI. Create engaging posts for Instagram, LinkedIn, Facebook, and TikTok in seconds!

## ✨ Features

- **AI-Powered Content Generation** - Generate captions, hashtags, and post ideas using GPT-4
- **Business Profile Setup** - Customize tone, keywords, and targeting for your brand
- **Content Scheduler** - Plan and schedule your content calendar
- **Multi-Platform Support** - Create content for Instagram, LinkedIn, Facebook, and TikTok
- **Subscription Management** - Free and Pro plans with Stripe integration
- **Modern UI** - Beautiful, responsive design with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (via Prisma)
- **Authentication:** Supabase Auth
- **AI Engine:** OpenAI GPT-4o-mini
- **Payments:** Stripe
- **Deployment:** Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (local or hosted)
- Supabase account (free tier works)
- OpenAI API key
- Stripe account (test mode works)

## 🚀 Getting Started

### 1. Clone the repository

\`\`\`bash
cd post-ai
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables

Create a \`.env\` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

### 4. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key to the \`.env\` file
3. No additional Supabase setup is needed - we use Prisma for database management

### 5. Set up the database

Generate Prisma client and push the schema to your database:

\`\`\`bash
npm run db:generate
npm run db:push
\`\`\`

### 6. Set up Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your API keys from the Dashboard (use test mode keys for development)
3. Set up a webhook endpoint:
   - URL: \`https://your-domain.com/api/subscription/webhook\`
   - Events: \`checkout.session.completed\`, \`customer.subscription.updated\`, \`customer.subscription.deleted\`
4. Copy the webhook secret to your \`.env\` file

### 7. Run the development server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### For Users

1. **Sign Up** - Create an account on the platform
2. **Set Up Profile** - Enter your business details, industry, tone, and target audience
3. **Generate Content** - Choose a platform, enter a topic, and let AI create your content
4. **Schedule Posts** - Save generated content and schedule it for future posting
5. **Upgrade to Pro** - Get unlimited content generation and advanced features

### For Developers

#### Database Management

\`\`\`bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio to view/edit data
npm run db:studio
\`\`\`

#### Project Structure

\`\`\`
post-ai/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── content/      # Content generation & management
│   │   ├── profile/      # Business profile management
│   │   └── subscription/ # Stripe subscription handling
│   ├── auth/             # Auth pages (signin, signup)
│   ├── dashboard/        # Main dashboard
│   ├── profile/          # Profile setup
│   ├── subscription/     # Subscription management
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── ContentGenerator.tsx
│   └── ContentScheduler.tsx
├── hooks/                # Custom React hooks
│   └── useAuth.ts
├── lib/                  # Utility libraries
│   ├── auth.ts           # Auth helper functions
│   ├── openai.ts         # OpenAI client
│   ├── prisma.ts         # Prisma client
│   ├── stripe.ts         # Stripe client
│   └── supabase.ts       # Supabase client
└── prisma/
    └── schema.prisma     # Database schema
\`\`\`

## 🎨 Customization

### Modify AI Content Generation

Edit \`app/api/content/generate/route.ts\` to customize:
- AI model and parameters
- Content prompts and templates
- Hashtag extraction logic

### Add New Platforms

1. Add platform to \`PLATFORMS\` array in \`components/ContentGenerator.tsx\`
2. Update platform-specific prompts in the API route

### Change Subscription Plans

Edit pricing in:
- \`app/subscription/page.tsx\` (frontend display)
- \`app/api/subscription/checkout/route.ts\` (Stripe pricing)

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Post-Deployment Setup

1. Update \`NEXT_PUBLIC_APP_URL\` in environment variables
2. Update Stripe webhook URL to production endpoint
3. Configure Supabase redirect URLs for production

## 📝 Environment Variables Checklist

Make sure all these are set before deploying:

- [ ] \`DATABASE_URL\` - PostgreSQL connection string
- [ ] \`NEXT_PUBLIC_SUPABASE_URL\` - Supabase project URL
- [ ] \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` - Supabase anon key
- [ ] \`OPENAI_API_KEY\` - OpenAI API key
- [ ] \`STRIPE_SECRET_KEY\` - Stripe secret key
- [ ] \`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\` - Stripe publishable key
- [ ] \`STRIPE_WEBHOOK_SECRET\` - Stripe webhook secret
- [ ] \`NEXT_PUBLIC_APP_URL\` - Your app's URL

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Supabase for authentication
- Stripe for payment processing
- Vercel for hosting

## 📞 Support

For support, email support@autocontent.ai or join our Discord community.

---

Built with ❤️ using Next.js and AI
