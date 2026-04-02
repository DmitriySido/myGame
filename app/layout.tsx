import "./globals.css";
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  weight: ['400', '500', '700'], 
  variable: '--font-montserrat', 
});

// Настройки вьюпорта для предотвращения зума
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: 'black', // Опционально: цвет статус-бара
};

export const metadata = {
  title: 'Bulls and Cows',
  description: 'Игра Быки и Коровы',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
