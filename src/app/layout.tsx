import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import NotificationInitializer from "@/components/NotificationInitializer";

export const metadata: Metadata = {
  title: "Chotu — Apni Dukaan, Ghar Tak",
  description: "Order groceries and daily essentials from local shops near you. Fast delivery in minutes.",
  keywords: "grocery delivery, local shops, chotu, instant delivery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <NotificationInitializer />
        <LocationProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
