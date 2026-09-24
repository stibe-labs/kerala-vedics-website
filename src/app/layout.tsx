import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartDrawer } from "@/components/CartDrawer";
import { ConsultVaidyaPortal } from "@/components/ConsultVaidyaPortal";
import { VideoPreloadProvider } from "@/context/VideoPreloadContext";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kerala Vedics | Luxury Ayurvedic Rituals & Formulations",
  description: "Classical Ayurvedic manufacture anchored in the virgin rainforests of Kerala. Formulated with reverence to ancient Vaidyas and the healing intelligence of nature.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/favicon.png?v=2", type: "image/png" },
      { url: "/favicon-kv.png?v=2", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-touch-icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased font-sans bg-[#F4EFE6] text-[#1F3D2B]"
        suppressHydrationWarning
      >
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <VideoPreloadProvider>
                <SmoothScrollProvider>
                  {children}
                  <CartDrawer />
                  <ConsultVaidyaPortal />
                </SmoothScrollProvider>
              </VideoPreloadProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
