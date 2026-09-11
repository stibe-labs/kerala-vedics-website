"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import confetti from "canvas-confetti";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  CheckCircle2,
  Sparkles,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Printer,
  MapPin,
  Clock,
} from "lucide-react";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Trigger celebration confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#C89D4A", "#1F3D2B", "#E0BA6A", "#8BA664"],
    });

    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#C89D4A", "#1F3D2B"],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#C89D4A", "#E0BA6A"],
      });
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  // Fetch placed order details
  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders?orderId=${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setOrder(data.order);
            return;
          }
        }
      } catch (e) {
        console.warn("Could not fetch order details:", e);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) loadOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex flex-col justify-between selection:bg-[#C89D4A] selection:text-[#14281C]">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-24 sm:py-32">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#4C6B3D]/15 shadow-xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
          {/* Success Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#1F3D2B] text-[#E0BA6A] flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest font-mono font-semibold text-[#8BA664]">
              Sacred Order Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F3D2B]">
              Namaste & Congratulations
            </h1>
            <p className="text-xs sm:text-sm text-[#4C6B3D] max-w-md mx-auto leading-relaxed">
              Your classical Ayurvedic formulations have been scheduled for copper vat decoction and artisanal compounding.
            </p>
          </div>

          {/* Order Snapshot Card */}
          <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#4C6B3D]/15 text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#4C6B3D]/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8BA664] block">
                  Order Identifier
                </span>
                <span className="font-mono font-bold text-lg text-[#1F3D2B]">
                  {orderId || "KV-89241"}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-[#8BA664] block">
                  Estimated Botanical Arrival
                </span>
                <span className="font-semibold text-xs text-[#1F3D2B] flex items-center gap-1 sm:justify-end">
                  <Calendar className="w-3.5 h-3.5 text-[#C89D4A]" />
                  <span>{order?.estimated_delivery || "Within 3-4 Business Days"}</span>
                </span>
              </div>
            </div>

            {/* Tracking Status Timeline Preview */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1F3D2B] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C89D4A]" />
                  <span>Current Status: In Classical Decoction</span>
                </span>
                <span className="font-mono text-gray-500 text-[11px]">
                  Tracking: {order?.tracking_number || "KV-EXP-77192"}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#1F3D2B] h-full rounded-full w-1/4" />
              </div>
              <p className="text-[11px] text-gray-500">
                Wildcrafted herbs are undergoing gentle Taila Paka Vidhi extractions in our Kerala sanctuary.
              </p>
            </div>

            {/* Shipping Address & Method */}
            {order?.shipping_address && (
              <div className="pt-3 border-t border-[#4C6B3D]/10 text-xs text-gray-600 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C89D4A] shrink-0 mt-0.5" />
                <span>Shipping to: {order.shipping_address}</span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/orders"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Track Order in Sanctuary</span>
            </Link>

            <Link
              href="/products"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-[#1F3D2B] border border-[#4C6B3D]/25 hover:bg-black/5 transition-all cursor-pointer"
            >
              <span>Explore More Formulations</span>
            </Link>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto p-3.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              title="Print Order Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {/* Guarantee Footer Strip */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C89D4A]" />
              AYUSH Certified
            </span>
            <span>•</span>
            <span>Miron Violet Light-Protected Glass</span>
            <span>•</span>
            <span>Sustainably Wildcrafted</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
