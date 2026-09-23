import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { LanguageProvider } from '@/context/language-context';
import { PWAInstallPrompt } from '@/components/dashboard/pwa-install-prompt';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F2847',
};

export const metadata: Metadata = {
  title: 'ENSUB - Gestión de Proyectos de Grado',
  description: 'Plataforma oficial para la trazabilidad, supervisión y éxito de los trabajos de investigación formativa de la Escuela Naval de Suboficiales ARC Barranquilla.',
  keywords: ['ENSUB', 'Escuela Naval', 'Proyectos de Grado', 'Barranquilla', 'Tesis'],
  manifest: '/manifest.json',
  applicationName: 'ENSUB Proyectos',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ENSUB Proyectos',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'ENSUB - Proyectos de Grado',
    description: 'Plataforma institucional para gestión de tesis e investigaciones.',
    type: 'website',
    locale: 'es_CO',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen" suppressHydrationWarning>
        <FirebaseClientProvider>
          <LanguageProvider>
            {children}
            <PWAInstallPrompt />
            <Toaster />
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
