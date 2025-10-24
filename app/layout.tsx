import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoContent.AI - AI-Powered Social Media Content Generator',
  description:
    'Generate engaging social media content for Instagram, LinkedIn, Facebook, and TikTok using AI. Perfect for small business owners.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
