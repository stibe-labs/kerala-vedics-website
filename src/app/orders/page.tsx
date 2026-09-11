"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { OrderRecord } from "@/app/api/orders/route";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Printer,
  ShoppingBag,
  MapPin,
  Calendar,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

export default function OrdersPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const url = user ? `/api/orders?userId=${encodeURIComponent(user.id)}` : "/api/orders";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders)) {
            setOrders(data.orders);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedId(tracking);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStageIndex = (status: string): number => {
    switch (status) {
      case "Processing":
        return 0;
      case "Decoction":
        return 1;
      case "Dispatched":
        return 2;
      case "Out for Delivery":
        return 3;
      case "Delivered":
        return 4;
      default:
        return 1;
    }
  };

  const STAGES = [
    "Order Placed",
    "Copper Decoction",
    "Dispatched",
    "Out for Delivery",
    "Delivered",
  ];

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex flex-col justify-between selection:bg-[#C89D4A] selection:text-[#14281C]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#4C6B3D]/15">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8BA664]">
              <Link href="/" className="hover:text-[#1F3D2B] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/sanctuary" className="hover:text-[#1F3D2B] transition-colors">
                Sanctuary
              </Link>
              <span>/</span>
              <span className="text-[#1F3D2B] font-semibold">Orders</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F3D2B]">
              Order Fulfillment & Botanical Tracking
            </h1>
            <p className="text-xs sm:text-sm text-[#4C6B3D] font-light">
              Follow your classical Ayurvedic compounding, Sahyadri dispatch, and doorstep arrival.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-full bg-white border border-[#4C6B3D]/15 text-[#1F3D2B] shadow-xs">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"} Recorded
            </span>
          </div>
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-[#1F3D2B] border-t-[#C89D4A] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-mono">Synchronizing dispatch ledger...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty Orders State */
          <div className="py-20 text-center space-y-6 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#1F3D2B]/5 border border-[#4C6B3D]/20 flex items-center justify-center mx-auto text-[#8BA664]">
              <Package className="w-10 h-10 stroke-1" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-[#1F3D2B]">
                No Sacred Orders Found
              </h2>
              <p className="text-xs text-[#4C6B3D] leading-relaxed">
                You have not placed any orders yet. Discover our classical oils and rejuvenating rasayanas in the sacred catalog.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all shadow-md"
            >
              <span>Explore Formulations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Orders Cards List */
          <div className="mt-8 space-y-8">
            {orders.map((ord) => {
              const currentStage = getStageIndex(ord.status);

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4C6B3D]/15 shadow-sm space-y-6 hover:shadow-md transition-shadow"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#1F3D2B] text-[#E0BA6A] flex items-center justify-center font-bold text-sm font-mono shadow-xs">
                        KV
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono font-bold text-base text-[#1F3D2B]">
                            {ord.id}
                          </h3>
                          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {ord.payment_status || "Completed"} • {ord.payment_method}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">
                          Placed on{" "}
                          {new Date(ord.created_at).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#8BA664] block">
                          Total Investment
                        </span>
                        <span className="font-serif font-bold text-xl text-[#1F3D2B]">
                          ₹{ord.total_amount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        onClick={() => window.print()}
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Visual 5-Stage Fulfillment Tracker (Myntra Feature) */}
                  <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#4C6B3D]/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#1F3D2B]">
                        <Clock className="w-4 h-4 text-[#C89D4A]" />
                        <span>Fulfillment Status: {ord.status}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                        <span>AWB: {ord.tracking_number}</span>
                        <button
                          onClick={() => handleCopyTracking(ord.tracking_number)}
                          className="hover:text-black transition-colors"
                          title="Copy AWB Tracking Number"
                        >
                          {copiedId === ord.tracking_number ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Step Visualizer */}
                    <div className="grid grid-cols-5 gap-2 pt-2">
                      {STAGES.map((stageName, idx) => {
                        const isPastOrCurrent = idx <= currentStage;
                        const isCurrent = idx === currentStage;

                        return (
                          <div key={stageName} className="space-y-2 text-center">
                            <div
                              className={`h-2 rounded-full transition-colors ${
                                isPastOrCurrent ? "bg-[#1F3D2B]" : "bg-gray-200"
                              } ${isCurrent ? "ring-2 ring-[#C89D4A]" : ""}`}
                            />
                            <span
                              className={`text-[10px] font-medium block truncate ${
                                isPastOrCurrent ? "text-[#1F3D2B] font-bold" : "text-gray-400"
                              }`}
                            >
                              {stageName}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {ord.estimated_delivery && (
                      <p className="text-[11px] text-gray-500 pt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C89D4A]" />
                        <span>Expected Arrival: {ord.estimated_delivery}</span>
                      </p>
                    )}
                  </div>

                  {/* Line Items List */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-[#8BA664]">
                      Formulations in this Dispatch ({ord.items?.length || 0})
                    </h4>
                    <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
                      {(ord.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <img
                              src={item.poster_image || "/products/vitality.png"}
                              alt={item.product_name}
                              className="w-14 h-14 rounded-xl object-cover bg-gray-100 border border-gray-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/products/vitality.png";
                              }}
                            />
                            <div className="min-w-0">
                              <h5 className="text-sm font-serif font-bold text-[#1F3D2B] truncate">
                                {item.product_name}
                              </h5>
                              <span className="text-xs text-gray-500 font-mono">
                                Quantity: {item.quantity} × ₹{item.unit_price.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <span className="font-serif font-bold text-base text-[#1F3D2B]">
                              ₹{item.total_price.toLocaleString("en-IN")}
                            </span>

                            <button
                              onClick={() => {
                                addToCart({
                                  id: item.product_id,
                                  name: item.product_name,
                                  price: item.unit_price,
                                  poster_image: item.poster_image,
                                }, 1);
                              }}
                              className="text-xs font-semibold px-4 py-1.5 rounded-full border border-[#4C6B3D]/30 text-[#1F3D2B] hover:bg-[#1F3D2B] hover:text-white transition-all cursor-pointer"
                            >
                              Reorder
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address Footer */}
                  {ord.shipping_address && (
                    <div className="pt-2 text-xs text-gray-500 flex items-start gap-2 border-t border-gray-100">
                      <MapPin className="w-3.5 h-3.5 text-[#C89D4A] shrink-0 mt-0.5" />
                      <span>Delivery Address: {ord.shipping_address}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
