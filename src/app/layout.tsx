import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartDrawer } from "@/components/CartDrawer";
import { VideoPreloadProvider } from "@/context/VideoPreloadContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kerala Vedics | Luxury Ayurvedic Rituals & Formulations",
  description: "Classical Ayurvedic manufacture anchored in the virgin rainforests of Kerala. Formulated with reverence to ancient Vaidyas and the healing intelligence of nature.",
  icons: {
    icon: "/favicon-kv.png",
    shortcut: "/favicon-kv.png",
    apple: "/favicon-kv.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className="antialiased font-sans bg-[#F4EFE6] text-[#1F3D2B]"
        suppressHydrationWarning
      >
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <VideoPreloadProvider>
                {children}
                <CartDrawer />
              </VideoPreloadProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
