import "./globals.css";
import { Montserrat } from 'next/font/google';
import { ReactNode } from "react";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-montserrat',
});

export const metadata = {
  title: 'Bulls and Cows',
  description: 'Игра Быки и Коровы',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
