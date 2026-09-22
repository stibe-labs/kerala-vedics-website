"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types/product";
import {
  Star,
  Heart,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Share2,
  Check,
  AlertCircle,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
  helpfulCount: number;
}

const INITIAL_REVIEWS: CustomerReview[] = [];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug as string;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"formulation" | "dosha" | "ritual" | "botanicals">("formulation");
  const [addedNotice, setAddedNotice] = useState(false);

  // Pincode checker state
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");

  // Load product data
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products)) {
            const found = data.products.find(
              (p: Product) => p.slug === rawSlug || p.id === rawSlug
            );
            if (found) {
              setProduct(found);
              setSelectedImage(found.poster_image);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch product:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [rawSlug]);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6 || isNaN(Number(pincode))) {
      setPincodeStatus("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setIsCheckingPincode(true);
    setTimeout(() => {
      setIsCheckingPincode(false);
      const days = Number(pincode.charAt(0)) <= 3 ? 3 : 4;
      const deliveryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      setPincodeStatus(`Available! Guaranteed botanical express delivery by ${deliveryDate}. Cash on Delivery & Free Shipping available.`);
    }, 500);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor,
      rating: newReviewRating,
      date: "Just now",
      verified: true,
      title: newReviewTitle || "Transformative Botanical Experience",
      comment: newReviewComment,
      helpfulCount: 0,
    };

    setReviews([newRev, ...reviews]);
    setIsReviewModalOpen(false);
    setNewReviewAuthor("");
    setNewReviewTitle("");
    setNewReviewComment("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#1F3D2B] border-t-[#C89D4A] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-serif italic">Unfolding classical formulation details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold">Formulation Not Found</h2>
          <p className="text-xs text-[#4C6B3D]">
            The remedy you are looking for may have been archived or retired to classical preparation.
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

  const effectivePrice = product.offer_price || product.price || 990;
  const mrp = product.mrp || Math.round(effectivePrice * 1.25);
  const discount = Math.round(((mrp - effectivePrice) / mrp) * 100);
  const isWish = isInWishlist(product.id);

  // Gallery images
  const galleryImages = product.images && product.images.length > 0
    ? [product.poster_image, ...product.images.filter(Boolean)]
    : [product.poster_image];

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex flex-col justify-between selection:bg-[#C89D4A] selection:text-[#14281C]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Breadcrumb Strip */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#8BA664] pb-6 border-b border-[#4C6B3D]/15">
          <Link href="/" className="hover:text-[#1F3D2B] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#1F3D2B] transition-colors">
            Sacred Formulations
          </Link>
          <span>/</span>
          <span className="text-[#C89D4A]">{product.category}</span>
          <span>/</span>
          <span className="text-[#1F3D2B] font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </div>

        {/* Product Hero Dual Column (Left Gallery, Right Specifications) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: Interactive Gallery (Col 1-6) */}
          <div className="lg:col-span-6 space-y-4 sticky top-28">
            {/* Main Stage Image */}
            <div className="relative rounded-3xl overflow-hidden bg-[#14281C] aspect-[1/1] sm:aspect-[4/3] shadow-lg border border-[#4C6B3D]/15 group">
              <img
                src={selectedImage || product.poster_image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/products/vitality.png";
                }}
              />

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-lg transition-transform active:scale-90 cursor-pointer ${
                  isWish
                    ? "bg-red-500 text-white"
                    : "bg-black/40 text-white hover:bg-black/60"
                }`}
                title={isWish ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-5 h-5 ${isWish ? "fill-white" : ""}`} />
              </button>

              {/* Discount Pill */}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-[#C89D4A] text-[#14281C] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Selectors */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    selectedImage === img
                      ? "border-[#C89D4A] scale-105 shadow-md"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Trust Badges Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#4C6B3D]/15">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-[#4C6B3D]/10 space-y-1">
                <ShieldCheck className="w-5 h-5 text-[#C89D4A]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F3D2B]">
                  AYUSH Certified
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-[#4C6B3D]/10 space-y-1">
                <Sparkles className="w-5 h-5 text-[#C89D4A]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F3D2B]">
                  72h Copper Decoction
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-[#4C6B3D]/10 space-y-1">
                <Truck className="w-5 h-5 text-[#C89D4A]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F3D2B]">
                  Free Express Shipping
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-[#4C6B3D]/10 space-y-1">
                <RotateCcw className="w-5 h-5 text-[#C89D4A]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F3D2B]">
                  Authentic Purity
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Buy Box & Specification (Col 7-12) */}
          <div className="lg:col-span-6 space-y-7">
            {/* Header Titles */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-widest text-[#8BA664] bg-[#8BA664]/10 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.dosha_affinity && (
                  <span className="text-[11px] uppercase font-bold tracking-widest text-[#C89D4A] bg-[#C89D4A]/10 px-3 py-1 rounded-full">
                    {product.dosha_affinity} Dosha
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F3D2B]">
                {product.name}
              </h1>

              {product.sanskrit_name && (
                <span className="text-base font-serif italic text-[#C89D4A] block">
                  {product.sanskrit_name}
                </span>
              )}

              <p className="text-sm text-[#4C6B3D] font-light leading-relaxed">
                {product.tagline || product.description}
              </p>

              {/* Rating Summary */}
              {product.review_count && product.review_count > 0 && product.rating ? (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center gap-1 bg-[#1F3D2B] text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                    <span>{product.rating.toFixed(1)}</span>
                    <Star className="w-3 h-3 fill-[#E0BA6A] text-[#E0BA6A]" />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {product.review_count} Verified Practitioner Reviews
                  </span>
                </div>
              ) : (
                <div className="pt-1">
                  <span className="text-xs text-gray-400 font-light">
                    No customer reviews yet
                  </span>
                </div>
              )}
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-3xl bg-white border border-[#4C6B3D]/15 shadow-sm space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-[#1F3D2B]">
                  ₹{effectivePrice.toLocaleString("en-IN")}
                </span>
                {mrp > effectivePrice && (
                  <span className="text-base text-gray-400 line-through font-mono">
                    ₹{mrp.toLocaleString("en-IN")}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Save ₹{(mrp - effectivePrice).toLocaleString("en-IN")} ({discount}%)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                Inclusive of all taxes. Free express shipping in Miron biophotonic glass containers.
              </p>
            </div>

            {/* Volume / Size Selection */}
            {product.volume && (
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-[#8BA664]">
                  Bottle Volume / Weight
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-4 py-2 rounded-2xl bg-[#1F3D2B] text-white text-xs font-bold font-mono shadow-sm">
                    {product.volume}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Stepper & Dual CTAs */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#4C6B3D]/30 rounded-full bg-white px-3 py-2 shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-600 hover:text-[#C89D4A] px-2 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-mono font-bold text-[#1F3D2B]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-gray-600 hover:text-[#C89D4A] px-2 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fresh Batch In Stock</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Add to Cart CTA */}
                <button
                  onClick={() => {
                    addToCart(
                      {
                        id: product.id,
                        name: product.name,
                        sanskrit_name: product.sanskrit_name,
                        category: product.category,
                        price: effectivePrice,
                        mrp: product.mrp,
                        poster_image: product.poster_image,
                        volume: product.volume,
                        dosha_affinity: product.dosha_affinity,
                      },
                      quantity
                    );

                    setAddedNotice(true);
                    setTimeout(() => setAddedNotice(false), 2500);
                  }}
                  className={`flex-1 w-full py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    addedNotice
                      ? "bg-emerald-600 text-white scale-102"
                      : "bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C]"
                  }`}
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Sacred Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag (₹{(effectivePrice * quantity).toLocaleString("en-IN")})</span>
                    </>
                  )}
                </button>

                {/* Buy Now CTA */}
                <button
                  onClick={() => {
                    addToCart(
                      {
                        id: product.id,
                        name: product.name,
                        sanskrit_name: product.sanskrit_name,
                        category: product.category,
                        price: effectivePrice,
                        mrp: product.mrp,
                        poster_image: product.poster_image,
                        volume: product.volume,
                        dosha_affinity: product.dosha_affinity,
                      },
                      quantity
                    );
                    router.push("/checkout");
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C89D4A] text-[#14281C] hover:bg-[#DFC188] transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Pincode Delivery Estimator (Myntra Feature) */}
            <div className="p-5 rounded-3xl bg-white border border-[#4C6B3D]/15 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F3D2B]">
                <MapPin className="w-4 h-4 text-[#C89D4A]" />
                <span>Delivery Estimator & Pincode Checker</span>
              </div>

              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit PIN (e.g. 682001)"
                  className="flex-1 bg-[#FAF7F2] border border-[#4C6B3D]/25 rounded-2xl px-4 py-2.5 text-xs text-[#1F3D2B] focus:outline-none focus:border-[#C89D4A] font-mono"
                />
                <button
                  type="submit"
                  disabled={isCheckingPincode}
                  className="px-5 py-2.5 rounded-2xl bg-[#1F3D2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#C89D4A] hover:text-[#14281C] transition-colors cursor-pointer"
                >
                  {isCheckingPincode ? "Checking..." : "Check"}
                </button>
              </form>

              {pincodeStatus && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    pincodeStatus.includes("Available")
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {pincodeStatus}
                </div>
              )}
            </div>

            {/* Classical Ayurvedic Specification Tabs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#4C6B3D]/15 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setActiveTab("formulation")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
                    activeTab === "formulation"
                      ? "border-[#1F3D2B] text-[#1F3D2B]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  The Formulation
                </button>

                <button
                  onClick={() => setActiveTab("dosha")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
                    activeTab === "dosha"
                      ? "border-[#1F3D2B] text-[#1F3D2B]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Dosha Harmony
                </button>

                <button
                  onClick={() => setActiveTab("ritual")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
                    activeTab === "ritual"
                      ? "border-[#1F3D2B] text-[#1F3D2B]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  The Ritual
                </button>

                <button
                  onClick={() => setActiveTab("botanicals")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
                    activeTab === "botanicals"
                      ? "border-[#1F3D2B] text-[#1F3D2B]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Active Botanicals
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-5 rounded-3xl bg-white border border-[#4C6B3D]/15 text-xs text-[#1F3D2B]/85 leading-relaxed font-light space-y-3">
                {activeTab === "formulation" && (
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#1F3D2B] mb-1">
                      Classical Roots & Lineage
                    </h4>
                    <p>{product.description}</p>
                    <p className="pt-2 text-gray-500">
                      Compounded according to classical Sanskrit protocols (Charaka Samhita, Chikitsa Sthana) using unrefined virgin wood-pressed sesame oil, organic A2 ghee, and 72-hour sustained copper vat decoctions.
                    </p>
                  </div>
                )}

                {activeTab === "dosha" && (
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#1F3D2B]">
                      Constitution Compatibility: {product.dosha_affinity || "Tridoshic"}
                    </h4>
                    <p>
                      In Ayurvedic science, every formulation balances specific constitutional humors (Vata, Pitta, or Kapha). This preparation actively cools excess Pitta heat, grounds Vata dryness, and clears lymphatic stagnation.
                    </p>
                  </div>
                )}

                {activeTab === "ritual" && (
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#1F3D2B]">
                      Prescribed Application Ceremony
                    </h4>
                    <p>
                      Warm 3-5 drops between palms to activate botanical prana. Gently press into cleansed facial skin or crown in upward circular motions. Inhale the grounding botanical vapors and allow 20 minutes for cellular absorption before sleep or bathing.
                    </p>
                  </div>
                )}

                {activeTab === "botanicals" && (
                  <div className="grid grid-cols-2 gap-2">
                    {["Kashmiri Saffron", "Wild Bhringraj", "Amla Berry", "Red Sandalwood", "Brahmi Leaf", "Sacred Tulsi"].map((herb) => (
                      <div key={herb} className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-[#4C6B3D]/10 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C89D4A] shrink-0" />
                        <span>{herb}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Feedback Section */}
        <section className="mt-16 pt-12 border-t border-[#4C6B3D]/15 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8BA664]">
                Practitioner Testimonials
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F3D2B]">
                Customer Ratings & Experiences
              </h2>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all cursor-pointer self-start sm:self-auto"
            >
              Write a Review
            </button>
          </div>

          {/* Reviews List & Summary */}
          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-[#4C6B3D]/15 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#1F3D2B]/5 flex items-center justify-center mx-auto text-[#4C6B3D]">
                <MessageSquare className="w-6 h-6 text-[#8BA664]" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#1F3D2B]">
                No Reviews Yet
              </h3>
              <p className="text-xs text-[#4C6B3D] leading-relaxed">
                Be the first to share your authentic experience with {product.name}. Your feedback guides others on their Ayurvedic wellness journey.
              </p>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all cursor-pointer"
              >
                Write First Review
              </button>
            </div>
          ) : (
            <>
              {/* Rating Summary Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4C6B3D]/15 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 text-center md:text-left space-y-2">
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="text-5xl font-serif font-bold text-[#1F3D2B]">
                      {(
                        reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
                      ).toFixed(1)}
                    </span>
                    <span className="text-base text-gray-500 font-mono">/ 5.0</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-[#E0BA6A] text-[#E0BA6A]" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    Based on {reviews.length} authentic customer reviews
                  </p>
                </div>

                <div className="md:col-span-8 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter((r) => r.rating === stars).length;
                    const pct = Math.round((count / reviews.length) * 100);
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs font-mono">
                        <span className="w-12 text-gray-600">{stars} Star</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C89D4A] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-gray-500">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl p-6 border border-[#4C6B3D]/15 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1F3D2B] text-[#E0BA6A] font-bold text-xs flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-serif font-bold text-[#1F3D2B]">
                            {rev.author}
                          </h4>
                          <div className="flex items-center gap-2">
                            {rev.verified && (
                              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified Buyer
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 font-mono">• {rev.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-[#E0BA6A] text-[#E0BA6A]" />
                        ))}
                      </div>
                    </div>

                    <h5 className="text-sm font-semibold text-[#1F3D2B]">{rev.title}</h5>
                    <p className="text-xs text-[#1F3D2B]/85 font-light leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

                <div className="pt-2 flex items-center gap-4 text-xs text-gray-500">
                  <button className="flex items-center gap-1 hover:text-[#1F3D2B] cursor-pointer">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({rev.helpfulCount})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Write a Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#4C6B3D]/20">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-serif font-bold text-[#1F3D2B]">
                Share Your Classical Ceremony
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-[#8BA664]">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      onClick={() => setNewReviewRating(s)}
                      className={`w-6 h-6 cursor-pointer transition-colors ${
                        s <= newReviewRating
                          ? "fill-[#E0BA6A] text-[#E0BA6A]"
                          : "text-gray-300 hover:text-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-[#8BA664]">Your Name</label>
                <input
                  type="text"
                  required
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="e.g. Dr. Lakshmi N."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C89D4A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-[#8BA664]">Review Headline</label>
                <input
                  type="text"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  placeholder="e.g. Luster restored within two weeks"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C89D4A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-[#8BA664]">Your Experience</label>
                <textarea
                  rows={4}
                  required
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Describe your ritual experience, texture, aroma, and cellular benefits..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C89D4A]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold uppercase bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
