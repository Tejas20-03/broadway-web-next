import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from '../store/StoreProvider';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
