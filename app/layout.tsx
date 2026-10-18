import type { Metadata, Viewport } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import './globals.css';
import { env } from '@/lib/env';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' });

export const viewport: Viewport = {
  themeColor: '#4A1942',
};

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: 'Lunara — Your cycle. Your comfort.',
  description:
    'Track periods, pain, mood, and rest in one private place, and let a trusted partner know how to support you.',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' },
    ],
    shortcut: '/icon.png',
  },
  openGraph: {
    title: 'Lunara — cycle tracking with partner support',
    description:
      'Gentle period and symptom tracking plus optional comfort sharing with someone you trust.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunara — Your cycle. Your comfort.',
    description:
      'Private cycle, pain, and mood tracking with optional partner comfort sharing.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="antialiased selection:bg-lunara-rose selection:text-primary">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

