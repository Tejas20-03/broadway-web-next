import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from '../store/StoreProvider';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: "Broadway Pizza - Modern Pizza Ordering",
  description: "Order the best pizza in town with Broadway Pizza. Premium ingredients, fast delivery, and exclusive online deals.",
  keywords: "pizza, order pizza online, Broadway Pizza, Karachi pizza, fast food delivery",
  openGraph: {
    type: "website",
    title: "Broadway Pizza - Modern Pizza Ordering",
    description: "Taste the perfection in every slice. Order your favorite pizza now with our modern ordering interface.",
    images: ["https://www.broadwaypizza.com.pk/assets/broadwayPizzaLogo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
