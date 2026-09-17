"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { loadRazorpayScript } from "@/lib/razorpay";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  Truck,
  Sparkles,
  Tag,
  Check,
  Building,
  Home,
  Phone,
  User,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface AddressData {
  recipient_name: string;
  phone: string;
  pincode: string;
  flat: string;
  street: string;
  city: string;
  state: string;
  address_type: "Home" | "Work";
}

const DEFAULT_SAVED_ADDRESS: AddressData = {
  recipient_name: "",
  phone: "",
  pincode: "",
  flat: "",
  street: "",
  city: "",
  state: "",
  address_type: "Home",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, subtotal, savings, clearCart } = useCart();

  const [step, setStep] = useState<"address" | "payment">("address");
  const [address, setAddress] = useState<AddressData>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kv_user_address");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return DEFAULT_SAVED_ADDRESS;
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "COD">("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [codCaptcha, setCodCaptcha] = useState("");
  const [userEnteredCaptcha, setUserEnteredCaptcha] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Generate 4-digit captcha for COD
  useEffect(() => {
    setCodCaptcha(`${Math.floor(1000 + Math.random() * 9000)}`);
  }, [step]);

  // Autofill city/state on pincode
  const handlePincodeChange = (pin: string) => {
    setAddress((prev) => ({ ...prev, pincode: pin }));
    if (pin === "682001" || pin.startsWith("68")) {
      setAddress((prev) => ({ ...prev, pincode: pin, city: "Kochi", state: "Kerala" }));
    } else if (pin.startsWith("56")) {
      setAddress((prev) => ({ ...prev, pincode: pin, city: "Bengaluru", state: "Karnataka" }));
    } else if (pin.startsWith("11")) {
      setAddress((prev) => ({ ...prev, pincode: pin, city: "New Delhi", state: "Delhi" }));
    } else if (pin.startsWith("40")) {
      setAddress((prev) => ({ ...prev, pincode: pin, city: "Mumbai", state: "Maharashtra" }));
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();

    if (code === "VEDIC10") {
      const discountVal = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code: "VEDIC10", discount: discountVal });
    } else if (code === "AYUR200") {
      setAppliedCoupon({ code: "AYUR200", discount: 200 });
    } else if (code === "FIRSTKERALA") {
      setAppliedCoupon({ code: "FIRSTKERALA", discount: 150 });
    } else {
      setCouponError("Invalid coupon code. Try VEDIC10 or AYUR200.");
    }
  };

  const couponDiscount = appliedCoupon?.discount || 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.recipient_name || !address.phone || !address.pincode || !address.flat) {
      alert("Please fill in all mandatory delivery address fields.");
      return;
    }
    // Save address locally
    try {
      localStorage.setItem("kv_user_address", JSON.stringify(address));
    } catch (e) {}

    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const executeCreateOrder = async (paymentId?: string) => {
    const fullShippingAddress = `${address.flat}, ${address.street}, ${address.city}, ${address.state} - ${address.pincode} (${address.address_type})`;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || null,
          guest_email: user?.email || "guest@keralavedics.com",
          recipient_name: address.recipient_name,
          phone: address.phone,
          total_amount: finalTotal,
          subtotal: subtotal,
          discount_amount: savings + couponDiscount,
          shipping_cost: 0,
          payment_method: paymentMethod,
          payment_id: paymentId,
          shipping_address: fullShippingAddress,
          items: cart,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order.");
      }

      // Clear cart
      clearCart();

      // Redirect to confirmation screen
      router.push(`/order-success/${data.order.id}`);
    } catch (err: any) {
      setIsProcessing(false);
      setOrderError(err.message || "Something went wrong while placing your order. Please retry.");
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === "COD") {
      if (userEnteredCaptcha.trim() !== codCaptcha) {
        setOrderError("Verification code does not match. Please re-enter.");
        return;
      }
    }

    setIsProcessing(true);
    setOrderError(null);

    if (paymentMethod !== "COD") {
      try {
        const orderRes = await fetch("/api/payment/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
            currency: "INR",
            receipt: `order_${Date.now()}`,
            notes: {
              customer_name: address.recipient_name,
              customer_email: user?.email || "guest@keralavedics.com",
              phone: address.phone,
              items_count: cart.length,
            },
          }),
        });

        const orderData = await orderRes.json();
        const isRzpLoaded = await loadRazorpayScript();

        if (isRzpLoaded && (window as any).Razorpay && orderData.success && !orderData.is_sandbox) {
          const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency || "INR",
            name: "Kerala Vedics",
            description: `Order Checkout (${cart.length} item${cart.length > 1 ? "s" : ""})`,
            image: "https://keralavedics.com/favicon.ico",
            order_id: orderData.order_id,
            prefill: {
              name: address.recipient_name,
              email: user?.email || "",
              contact: address.phone || "",
            },
            theme: {
              color: "#1F3D2B",
            },
            handler: async function (response: any) {
              try {
                await fetch("/api/payment/razorpay/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
              } catch (e) {
                console.warn("Signature verification warning:", e);
              }
              await executeCreateOrder(response.razorpay_payment_id);
            },
            modal: {
              ondismiss: function () {
                setIsProcessing(false);
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          return;
        }
      } catch (e) {
        console.warn("Razorpay order creation fallback:", e);
      }
    }

    await executeCreateOrder();
  };

  if (cart.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#1F3D2B]/5 text-[#C89D4A] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold">Your Bag is Empty</h2>
          <p className="text-xs text-[#4C6B3D]">
            Add our classical formulations to your sacred cart before proceeding to checkout.
          </p>
          <Link
            href="/products"
            className="inline-block px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all"
          >
            Explore Sacred Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex flex-col justify-between selection:bg-[#C89D4A] selection:text-[#14281C]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Modern 3-Step Wizard Navigation (Myntra-Style) */}
        <div className="max-w-3xl mx-auto pb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 -z-0" />
            
            {/* Step 1: Bag */}
            <Link
              href="/cart"
              className="relative z-10 flex flex-col items-center gap-1.5 bg-[#F4EFE6] px-4 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-700">1. Sacred Bag</span>
            </Link>

            {/* Step 2: Address */}
            <button
              onClick={() => setStep("address")}
              className="relative z-10 flex flex-col items-center gap-1.5 bg-[#F4EFE6] px-4 cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-colors ${
                  step === "address"
                    ? "bg-[#1F3D2B] text-[#E0BA6A] ring-4 ring-[#C89D4A]/30"
                    : "bg-emerald-700 text-white"
                }`}
              >
                {step === "payment" ? <Check className="w-4 h-4" /> : "2"}
              </div>
              <span className={`text-xs font-semibold ${step === "address" ? "text-[#1F3D2B]" : "text-gray-600"}`}>
                2. Delivery Address
              </span>
            </button>

            {/* Step 3: Payment */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 bg-[#F4EFE6] px-4">
              <div
                className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center transition-colors ${
                  step === "payment"
                    ? "bg-[#1F3D2B] text-[#E0BA6A] ring-4 ring-[#C89D4A]/30"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
              <span className={`text-xs font-semibold ${step === "payment" ? "text-[#1F3D2B]" : "text-gray-400"}`}>
                3. Secure Payment
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Grid Layout: Form on Left, Summary on Right */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: STEP CONTENT (Col 1-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* STEP 2: DELIVERY ADDRESS FORM */}
            {step === "address" && (
              <form onSubmit={handleProceedToPayment} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4C6B3D]/15 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#4C6B3D]/10">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-[#C89D4A]" />
                    <h2 className="text-xl font-serif font-bold text-[#1F3D2B]">
                      Delivery Shipping Details
                    </h2>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">Step 2 of 3</span>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs uppercase font-bold text-[#8BA664]">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={address.recipient_name}
                        onChange={(e) => setAddress({ ...address, recipient_name: e.target.value })}
                        placeholder="Recipient full name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C89D4A]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-[#8BA664]">
                      10-Digit Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="Mobile for delivery OTP"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C89D4A]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-[#8BA664]">
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={address.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="e.g. 682001"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#C89D4A]"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs uppercase font-bold text-[#8BA664]">
                      Flat / House No. / Building / Floor *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.flat}
                      onChange={(e) => setAddress({ ...address, flat: e.target.value })}
                      placeholder="e.g. Flat 4B, Lotus Heights"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C89D4A]"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs uppercase font-bold text-[#8BA664]">
                      Area / Street / Sector / Locality *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="e.g. MG Road, Near Marine Walk"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C89D4A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-[#8BA664]">City / Town *</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="e.g. Kochi"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C89D4A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-[#8BA664]">State *</label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="e.g. Kerala"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C89D4A]"
                    />
                  </div>
                </div>

                {/* Address Tag Selector */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs uppercase font-bold text-[#8BA664]">
                    Address Type
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAddress({ ...address, address_type: "Home" })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        address.address_type === "Home"
                          ? "bg-[#1F3D2B] text-white border-[#1F3D2B]"
                          : "bg-white text-gray-700 border-gray-200"
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span>Home (All day delivery)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddress({ ...address, address_type: "Work" })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        address.address_type === "Work"
                          ? "bg-[#1F3D2B] text-white border-[#1F3D2B]"
                          : "bg-white text-gray-700 border-gray-200"
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>Work (Delivery 9 AM - 6 PM)</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href="/cart"
                    className="text-xs text-gray-500 hover:text-black flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Bag</span>
                  </Link>

                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: PAYMENT GATEWAY SIMULATION */}
            {step === "payment" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4C6B3D]/15 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#4C6B3D]/10">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#C89D4A]" />
                    <h2 className="text-xl font-serif font-bold text-[#1F3D2B]">
                      Secure Ayurvedic Payment
                    </h2>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">Step 3 of 3</span>
                </div>

                {/* Delivery Address Summary Pill */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#4C6B3D]/15 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1F3D2B]">
                      Delivering to: {address.recipient_name}
                    </span>
                    <p className="text-gray-600 font-light truncate max-w-sm">
                      {address.flat}, {address.street}, {address.city} - {address.pincode}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep("address")}
                    className="text-[#C89D4A] hover:underline font-semibold"
                  >
                    Change
                  </button>
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="space-y-3">
                  <label className="text-xs uppercase font-bold text-[#8BA664]">
                    Select Payment Gateway
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("UPI")}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "UPI"
                          ? "bg-[#1F3D2B] text-white border-[#1F3D2B] shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <QrCode className="w-6 h-6 text-[#E0BA6A] mb-2" />
                      <div>
                        <span className="font-bold text-xs block">UPI / QR Code</span>
                        <span className="text-[10px] opacity-80">GPay, PhonePe, Paytm</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CARD")}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "CARD"
                          ? "bg-[#1F3D2B] text-white border-[#1F3D2B] shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-[#E0BA6A] mb-2" />
                      <div>
                        <span className="font-bold text-xs block">Cards</span>
                        <span className="text-[10px] opacity-80">Credit & Debit Cards</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("COD")}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "COD"
                          ? "bg-[#1F3D2B] text-white border-[#1F3D2B] shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Banknote className="w-6 h-6 text-[#E0BA6A] mb-2" />
                      <div>
                        <span className="font-bold text-xs block">Cash on Delivery</span>
                        <span className="text-[10px] opacity-80">Pay upon botanical arrival</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* TAB 1: UPI Gateway Form */}
                {paymentMethod === "UPI" && (
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Dynamic Simulated QR Code */}
                      <div className="w-36 h-36 rounded-2xl bg-white p-3 border border-gray-200 shadow-sm flex flex-col items-center justify-center shrink-0">
                        <div className="w-full h-full bg-[#1F3D2B]/5 rounded-xl flex flex-col items-center justify-center text-center p-2">
                          <QrCode className="w-16 h-16 text-[#1F3D2B]" />
                          <span className="text-[9px] font-mono font-bold text-[#C89D4A] mt-1">
                            ₹{finalTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <h4 className="font-serif font-bold text-sm text-[#1F3D2B]">
                          Scan QR Code with any UPI App
                        </h4>
                        <p className="text-gray-500 leading-relaxed font-light">
                          Supports Google Pay, PhonePe, Paytm, BHIM, and Cred. Scan using your phone camera or enter your virtual payment address below.
                        </p>
                        <div className="pt-2">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. patron@okhdfcbank"
                            className="w-full max-w-xs px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#C89D4A]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Card Gateway Form */}
                {paymentMethod === "CARD" && (
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase font-bold text-[#8BA664]">
                        Card Number
                      </label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#C89D4A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] uppercase font-bold text-[#8BA664]">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#C89D4A]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] uppercase font-bold text-[#8BA664]">
                          CVV Security Code
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#C89D4A]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] uppercase font-bold text-[#8BA664]">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name as printed on card"
                        className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-xs focus:outline-none focus:border-[#C89D4A]"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: Cash on Delivery Form */}
                {paymentMethod === "COD" && (
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4 text-xs">
                    <p className="text-gray-600 font-light">
                      Pay with Cash or UPI upon receiving your packaged botanical decoctions. Please enter the security verification code below to confirm:
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-xl bg-[#1F3D2B] text-[#E0BA6A] font-mono font-bold text-base tracking-widest select-none">
                        {codCaptcha}
                      </div>

                      <input
                        type="text"
                        maxLength={4}
                        value={userEnteredCaptcha}
                        onChange={(e) => setUserEnteredCaptcha(e.target.value)}
                        placeholder="Enter Code"
                        className="w-32 p-2 rounded-xl bg-white border border-gray-200 text-xs font-mono text-center focus:outline-none focus:border-[#C89D4A]"
                      />
                    </div>
                  </div>
                )}

                {orderError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
                    {orderError}
                  </div>
                )}

                {/* Place Order CTA */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setStep("address")}
                    className="text-xs text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Address</span>
                  </button>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Confirming Sacred Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order (₹{finalTotal.toLocaleString("en-IN")})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: ORDER INVESTMENT SUMMARY (Col 9-12) */}
          <div className="lg:col-span-4 space-y-5 sticky top-28">
            <div className="bg-white rounded-3xl p-6 border border-[#4C6B3D]/15 shadow-sm space-y-6">
              <h3 className="text-lg font-serif font-bold text-[#1F3D2B] pb-3 border-b border-[#4C6B3D]/10">
                Order Summary ({cart.length} Formulations)
              </h3>

              {/* Items Miniature Preview */}
              <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 no-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.poster_image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-[#1F3D2B] truncate block">
                          {item.name}
                        </span>
                        <span className="text-gray-400 font-mono">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-[#1F3D2B] shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Strip */}
              <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon Code"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#4C6B3D]/20 text-xs font-mono uppercase focus:outline-none focus:border-[#C89D4A]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#1F3D2B] text-white text-xs font-semibold uppercase hover:bg-[#C89D4A] hover:text-[#14281C] transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="text-xs text-emerald-700 font-semibold flex items-center justify-between">
                    <span>Coupon &apos;{appliedCoupon.code}&apos; applied</span>
                    <span>-₹{appliedCoupon.discount}</span>
                  </div>
                )}

                {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
              </form>

              {/* Price Calculation */}
              <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-gray-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Artisanal Savings</span>
                    <span>-₹{savings.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Savings</span>
                    <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Express Botanical Shipping</span>
                  <span className="font-bold text-emerald-700 uppercase text-[10px]">FREE</span>
                </div>

                <div className="pt-3 border-t border-[#4C6B3D]/15 flex items-center justify-between text-base">
                  <span className="font-serif font-bold text-[#1F3D2B]">Total Investment</span>
                  <span className="text-2xl font-serif font-bold text-[#1F3D2B]">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Safety Badges */}
              <div className="space-y-2 pt-2 text-[11px] text-gray-500 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[#1F3D2B]">
                  <ShieldCheck className="w-4 h-4 text-[#C89D4A] shrink-0" />
                  <span>256-Bit SSL Encrypted Sacred Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-[#1F3D2B]">
                  <CheckCircle2 className="w-4 h-4 text-[#C89D4A] shrink-0" />
                  <span>100% Bio-Active & AYUSH Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
