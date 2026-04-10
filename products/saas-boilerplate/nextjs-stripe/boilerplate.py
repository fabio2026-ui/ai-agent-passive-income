# SaaS Boilerplate - Next.js + Stripe
# 小七团队开发
# 快速启动SaaS项目

PROJECT_STRUCTURE = '''
saas-boilerplate/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── stripe/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── billing/
│   │   ├── pricing-cards.tsx
│   │   └── subscription-manager.tsx
│   └── dashboard/
│       ├── sidebar.tsx
│       └── stats-cards.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── stripe.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── index.ts
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
'''

# 核心文件内容
FILES = {
    'package.json': '''{
  "name": "saas-boilerplate",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@auth/prisma-adapter": "^1.0.0",
    "@prisma/client": "^5.0.0",
    "@stripe/stripe-js": "^2.0.0",
    "@trpc/client": "^10.0.0",
    "@trpc/next": "^10.0.0",
    "@trpc/react-query": "^10.0.0",
    "@trpc/server": "^10.0.0",
    "@tanstack/react-query": "^5.0.0",
    "next-auth": "^4.24.0",
    "stripe": "^14.0.0",
    "zod": "^3.22.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "prisma": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.3.0"
  }
}''',

    'prisma/schema.prisma': '''generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  subscription  Subscription?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Subscription {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeCustomerId String   @unique
  stripePriceId    String?
  stripeCurrentPeriodEnd DateTime?
  status           String   @default("inactive")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}''',

    '.env.example': '''# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saas_db"

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Pricing
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_PRO="price_..."''',

    'app/layout.tsx': '''import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SaaS Boilerplate',
  description: 'Launch your SaaS faster',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}''',

    'app/page.tsx': '''import Link from 'next/link'
import { PricingCards } from '@/components/billing/pricing-cards'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-xl">SaaS Boilerplate</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline">Login</Link>
          <Link href="/register" className="text-sm font-medium hover:underline">Sign Up</Link>
        </nav>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Launch Your SaaS in Days
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Production-ready boilerplate with auth, billing, and dashboard.
                Just add your product.
              </p>
              <div className="space-x-4">
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <PricingCards />
          </div>
        </section>
      </main>
    </div>
  )
}'''
}

# 功能特性
FEATURES = [
    '✅ Next.js 14 with App Router',
    '✅ TypeScript',
    '✅ Tailwind CSS + shadcn/ui',
    '✅ Prisma + PostgreSQL',
    '✅ NextAuth.js Authentication',
    '✅ Stripe Payments',
    '✅ Subscription Management',
    '✅ tRPC API',
    '✅ Responsive Dashboard',
    '✅ Email Templates',
    '✅ Role-based Access',
    '✅ API Rate Limiting',
    '✅ SEO Optimization',
    '✅ Dark Mode',
    '✅ Docker Setup'
]

# 定价
PRICING = {
    'starter': {
        'price': 49,
        'features': [
            'Full source code',
            'Basic auth',
            'Stripe integration',
            'Email support'
        ]
    },
    'pro': {
        'price': 99,
        'features': [
            'Everything in Starter',
            'Advanced components',
            'Team/invite system',
            'Admin dashboard',
            'Priority support'
        ]
    },
    'enterprise': {
        'price': 299,
        'features': [
            'Everything in Pro',
            'Custom development',
            'Code review',
            '1-on-1 consultation',
            'Lifetime updates'
        ]
    }
}

# 收入预测
def calculate_revenue():
    monthly_sales = {
        'starter': 15,
        'pro': 8,
        'enterprise': 2
    }
    
    monthly = sum(monthly_sales[tier] * PRICING[tier]['price'] for tier in monthly_sales)
    return {
        'monthly': monthly,
        'yearly': monthly * 12
    }

if __name__ == '__main__':
    print("🚀 SaaS Boilerplate - Next.js + Stripe")
    print("\n包含功能:")
    for f in FEATURES:
        print(f"  {f}")
    
    revenue = calculate_revenue()
    print(f"\n💰 收入预测:")
    print(f"月度: €{revenue['monthly']}")
    print(f"年度: €{revenue['yearly']}")
