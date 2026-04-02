import "./globals.css";
import { Montserrat } from 'next/font/google';
import Head from "next/head"; // <- импортируем Head

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-montserrat',
});

export const metadata = {
  title: 'Bulls and Cows',
  description: 'Игра Быки и Коровы',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
