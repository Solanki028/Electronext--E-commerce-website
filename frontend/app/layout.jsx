import './globals.css';

export const metadata = {
  title: {
    default: 'Aspar — Premium Electronics',
    template: '%s | Aspar',
  },
  description:
    'Shop the latest electronics at Aspar. Best prices on smartphones, laptops, tablets, and more.',
  keywords: ['electronics', 'smartphones', 'laptops', 'tablets', 'gadgets', 'online shopping'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Aspar',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:wght@300;400;500;600&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// Providers component (client component)
import Providers from '@/components/Providers';
