import './globals.css';

export const metadata = {
  title: {
    default: 'ElectroNest — Premium Electronics',
    template: '%s | ElectroNest',
  },
  description:
    'Shop the latest electronics at ElectroNest. Best prices on smartphones, laptops, tablets, and more.',
  keywords: ['electronics', 'smartphones', 'laptops', 'tablets', 'gadgets', 'online shopping'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'ElectroNest',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// Providers component (client component)
import Providers from '@/components/Providers';
