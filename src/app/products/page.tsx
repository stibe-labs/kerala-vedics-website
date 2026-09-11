"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types/product";
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Heart,
  ShoppingBag,
  CheckCircle2,
  X,
  Search,
  Grid3X3,
  LayoutList,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
} from "lucide-react";

const CATEGORIES = [
  "All Formulations",
  "Rasayana",
  "Herbal Drops",
  "Therapeutic Oils",
  "Internal Elixirs",
];

const DOSHAS = ["All Doshas", "Tridoshic", "Vata", "Pitta", "Kapha"];

const SORT_OPTIONS = [
  { label: "Recommended & Popular", value: "recommended" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Customer Rating", value: "rating-desc" },
  { label: "Newest Compounded", value: "newest" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "All Formulations";

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedDosha, setSelectedDosha] = useState("All Doshas");
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [searchFilter, setSearchFilter] = useState(urlSearch);
  const [sortBy, setSortBy] = useState("recommended");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Sync URL params
  useEffect(() => {
    if (urlSearch) setSearchFilter(urlSearch);
    if (urlCategory && urlCategory !== "All Formulations") setSelectedCategory(urlCategory);
  }, [urlSearch, urlCategory]);

  // Load products
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSanskrit = p.sanskrit_name?.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchTagline = p.tagline?.toLowerCase().includes(q);
          if (!matchName && !matchSanskrit && !matchCat && !matchTagline) return false;
        }

        // Category
        if (selectedCategory !== "All Formulations") {
          if (p.category !== selectedCategory) return false;
        }

        // Dosha
        if (selectedDosha !== "All Doshas") {
          if (p.dosha_affinity && p.dosha_affinity !== selectedDosha) return false;
        }

        // Price
        const effectivePrice = p.offer_price || p.price || 0;
        if (effectivePrice > maxPrice) return false;

        // Rating
        if (minRating > 0) {
          const rating = p.rating || 4.8;
          if (rating < minRating) return false;
        }

        // In Stock
        if (onlyInStock) {
          if (p.in_stock === 0 || (p.stock_count !== undefined && p.stock_count <= 0)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.offer_price || a.price || 0;
        const priceB = b.offer_price || b.price || 0;
        const ratingA = a.rating || 4.8;
        const ratingB = b.rating || 4.8;

        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "rating-desc") return ratingB - ratingA;
        if (sortBy === "newest") {
          return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
        }
        return 0; // Default recommended
      });
  }, [products, searchFilter, selectedCategory, selectedDosha, maxPrice, minRating, onlyInStock, sortBy]);

  const resetAllFilters = () => {
    setSelectedCategory("All Formulations");
    setSelectedDosha("All Doshas");
    setMaxPrice(2000);
    setMinRating(0);
    setOnlyInStock(false);
    setSearchFilter("");
  };

  const hasActiveFilters =
    selectedCategory !== "All Formulations" ||
    selectedDosha !== "All Doshas" ||
    maxPrice < 2000 ||
    minRating > 0 ||
    onlyInStock ||
    Boolean(searchFilter);

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex flex-col justify-between selection:bg-[#C89D4A] selection:text-[#14281C]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Header Strip & Breadcrumbs */}
        <div className="pb-6 border-b border-[#4C6B3D]/15 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8BA664]">
            <Link href="/" className="hover:text-[#1F3D2B] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#1F3D2B] font-semibold">Sacred Formulations</span>
            {selectedCategory !== "All Formulations" && (
              <>
                <span>/</span>
                <span className="text-[#C89D4A]">{selectedCategory}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1F3D2B]">
                Classical Kerala Formulations
              </h1>
              <p className="text-xs sm:text-sm text-[#4C6B3D] font-light mt-1 max-w-2xl">
                Ancient Taila Paka Vidhi extractions, copper vat decoctions, and wildcrafted Sahyadri botanicals certified by classical Ayurvedic lineage.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-full bg-white border border-[#4C6B3D]/20 text-[#1F3D2B] shadow-xs">
                {filteredProducts.length} Formulations Found
              </span>
            </div>
          </div>

          {/* Quick Category Tabs Strip */}
          <div className="pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#1F3D2B] text-[#FAF7F2] shadow-md shadow-[#1F3D2B]/20"
                    : "bg-white text-[#1F3D2B] border border-[#4C6B3D]/15 hover:bg-black/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Main Layout: Sidebar on Left, Products on Right */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* DESKTOP FILTER SIDEBAR (Col 1-3) */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-3xl p-6 border border-[#4C6B3D]/15 shadow-sm space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-[#4C6B3D]/10">
              <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#1F3D2B]">
                <Filter className="w-4 h-4 text-[#C89D4A]" />
                <span>Filters & Refinement</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* In-Catalog Search */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold tracking-wider text-[#8BA664]">
                Keyword Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#4C6B3D]/50" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="e.g. Saffron, Hair, Ojas..."
                  className="w-full bg-[#FAF7F2] border border-[#4C6B3D]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1F3D2B] focus:outline-none focus:border-[#C89D4A]"
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Dosha Affinity */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-[#8BA664]">
                Dosha Constitution
              </label>
              <div className="space-y-1">
                {DOSHAS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDosha(d)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      selectedDosha === d
                        ? "bg-[#1F3D2B] text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{d}</span>
                    {selectedDosha === d && <Check className="w-3.5 h-3.5 text-[#E0BA6A]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase font-bold tracking-wider text-[#8BA664]">
                  Price Cap
                </span>
                <span className="font-mono font-bold text-[#1F3D2B]">
                  Up to ₹{maxPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="400"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#1F3D2B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>₹400</span>
                <span>₹1,200</span>
                <span>₹2,000+</span>
              </div>
            </div>

            {/* Customer Rating Filter */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold tracking-wider text-[#8BA664]">
                Customer Rating
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 4.5, 4.8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`py-1.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      minRating === rating
                        ? "bg-[#1F3D2B] text-white border-[#1F3D2B]"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {rating === 0 ? (
                      "All"
                    ) : (
                      <>
                        <span>{rating}</span>
                        <Star className="w-3 h-3 fill-[#C89D4A] text-[#C89D4A]" />
                        <span>+</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-[#1F3D2B]">In Stock Only</span>
              <button
                onClick={() => setOnlyInStock(!onlyInStock)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  onlyInStock ? "bg-[#1F3D2B]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    onlyInStock ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          </aside>

          {/* MAIN PRODUCT GRID / LIST (Col 4-12) */}
          <div className="lg:col-span-9 space-y-6">
            {/* Utility Top Bar: Sort By & View Toggles & Mobile Filter Trigger */}
            <div className="bg-white rounded-2xl p-4 border border-[#4C6B3D]/15 shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters {hasActiveFilters ? "• Active" : ""}</span>
              </button>

              {/* Active Filter Badges */}
              <div className="hidden sm:flex items-center gap-2 flex-wrap">
                {selectedCategory !== "All Formulations" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#1F3D2B]/5 text-[#1F3D2B] border border-[#1F3D2B]/15">
                    <span>{selectedCategory}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => setSelectedCategory("All Formulations")}
                    />
                  </span>
                )}
                {selectedDosha !== "All Doshas" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#1F3D2B]/5 text-[#1F3D2B] border border-[#1F3D2B]/15">
                    <span>Dosha: {selectedDosha}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => setSelectedDosha("All Doshas")}
                    />
                  </span>
                )}
                {searchFilter && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#1F3D2B]/5 text-[#1F3D2B] border border-[#1F3D2B]/15">
                    <span>Search: {searchFilter}</span>
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => setSearchFilter("")}
                    />
                  </span>
                )}
              </div>

              {/* Sort By & View Controls */}
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="hidden md:inline font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#FAF7F2] border border-[#4C6B3D]/20 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1F3D2B] focus:outline-none focus:border-[#C89D4A] cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hidden sm:flex items-center border border-[#4C6B3D]/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 ${viewMode === "grid" ? "bg-[#1F3D2B] text-white" : "bg-white text-gray-500 hover:bg-gray-100"}`}
                    title="Grid View"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 ${viewMode === "list" ? "bg-[#1F3D2B] text-white" : "bg-white text-gray-500 hover:bg-gray-100"}`}
                    title="List View"
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Listing Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse space-y-4">
                    <div className="h-60 bg-gray-200 rounded-2xl" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="py-20 text-center space-y-5 bg-white rounded-3xl border border-[#4C6B3D]/15 p-8 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#1F3D2B]/5 border border-[#4C6B3D]/20 flex items-center justify-center mx-auto text-[#4C6B3D]">
                  <Search className="w-8 h-8 text-[#8BA664]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-[#1F3D2B]">
                    No Formulations Found
                  </h3>
                  <p className="text-xs text-[#4C6B3D] leading-relaxed">
                    We could not find any Ayurvedic remedies matching your current filter criteria. Try expanding your search or clearing active filters.
                  </p>
                </div>
                <button
                  onClick={resetAllFilters}
                  className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid Layout */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => {
                  const effectivePrice = prod.offer_price || prod.price || 990;
                  const mrp = prod.mrp || Math.round(effectivePrice * 1.25);
                  const discountPercent = Math.round(((mrp - effectivePrice) / mrp) * 100);
                  const isWish = isInWishlist(prod.id);
                  const isJustAdded = addedProductId === prod.id;

                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-3xl p-5 border border-[#4C6B3D]/15 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                      {/* Image & Wishlist Button */}
                      <div className="space-y-3">
                        <div className="relative h-64 rounded-2xl bg-[#14281C] overflow-hidden">
                          <Link href={`/products/${prod.slug || prod.id}`}>
                            <img
                              src={prod.poster_image}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/products/vitality.png";
                              }}
                            />
                          </Link>

                          {/* Wishlist Heart Button */}
                          <button
                            onClick={() => toggleWishlist(prod)}
                            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer shadow-md ${
                              isWish
                                ? "bg-red-500 text-white"
                                : "bg-black/40 text-white/90 hover:text-white hover:bg-black/60"
                            }`}
                            title={isWish ? "Remove from Wishlist" : "Save to Wishlist"}
                          >
                            <Heart className={`w-4 h-4 ${isWish ? "fill-white" : ""}`} />
                          </button>

                          {/* Discount Badge */}
                          {discountPercent > 0 && (
                            <div className="absolute top-3 left-3 bg-[#C89D4A] text-[#14281C] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              {discountPercent}% OFF
                            </div>
                          )}

                          {/* Volume pill */}
                          {prod.volume && (
                            <div className="absolute bottom-3 left-3">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-white/90 text-gray-800 shadow-xs backdrop-blur-sm">
                                {prod.volume}
                              </span>
                            </div>
                          )}

                          {/* Rating Pill */}
                          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm shadow-xs">
                            <Star className="w-3 h-3 fill-[#E0BA6A] text-[#E0BA6A]" />
                            <span>{prod.rating || 4.9}</span>
                          </div>
                        </div>

                        {/* Title, Sanskrit & Category */}
                        <div>
                          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[#8BA664]">
                            <span>{prod.category}</span>
                            {prod.dosha_affinity && (
                              <span className="text-[#C89D4A]">{prod.dosha_affinity} Dosha</span>
                            )}
                          </div>

                          <Link href={`/products/${prod.slug || prod.id}`}>
                            <h3 className="text-lg font-serif font-bold text-[#1F3D2B] group-hover:text-[#4C6B3D] transition-colors line-clamp-1 mt-1">
                              {prod.name}
                            </h3>
                          </Link>

                          {prod.sanskrit_name && (
                            <span className="text-xs font-serif italic text-[#C89D4A] block">
                              {prod.sanskrit_name}
                            </span>
                          )}

                          <p className="text-xs text-[#4C6B3D] mt-1 font-light leading-relaxed line-clamp-2">
                            {prod.tagline || prod.description}
                          </p>
                        </div>
                      </div>

                      {/* Pricing & Add to Bag CTA */}
                      <div className="pt-3 border-t border-[#4C6B3D]/10 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] uppercase text-[#8BA664] block font-semibold">
                            Artisanal Price
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-serif font-bold text-[#1F3D2B]">
                              ₹{effectivePrice.toLocaleString("en-IN")}
                            </span>
                            {mrp > effectivePrice && (
                              <span className="text-xs text-gray-400 line-through font-mono">
                                ₹{mrp.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/products/${prod.slug || prod.id}`}
                            className="text-[11px] font-semibold uppercase tracking-wider px-3 py-2 rounded-full border border-[#4C6B3D]/30 text-[#1F3D2B] hover:bg-black/5 transition-all cursor-pointer"
                          >
                            Explore
                          </Link>

                          <button
                            onClick={() => {
                              addToCart({
                                id: prod.id,
                                name: prod.name,
                                sanskrit_name: prod.sanskrit_name,
                                category: prod.category,
                                price: effectivePrice,
                                mrp: prod.mrp,
                                poster_image: prod.poster_image,
                                volume: prod.volume,
                                dosha_affinity: prod.dosha_affinity,
                              }, 1);

                              setAddedProductId(prod.id);
                              setTimeout(() => setAddedProductId(null), 1800);
                            }}
                            className={`text-[11px] font-semibold uppercase tracking-wider px-3.5 py-2 rounded-full transition-all duration-300 shadow-sm flex items-center gap-1.5 cursor-pointer ${
                              isJustAdded
                                ? "bg-emerald-600 text-white scale-105"
                                : "bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C]"
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List Layout */
              <div className="space-y-4">
                {filteredProducts.map((prod) => {
                  const effectivePrice = prod.offer_price || prod.price || 990;
                  const mrp = prod.mrp || Math.round(effectivePrice * 1.25);
                  const isWish = isInWishlist(prod.id);
                  const isJustAdded = addedProductId === prod.id;

                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-3xl p-5 border border-[#4C6B3D]/15 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-lg transition-shadow group"
                    >
                      <div className="flex items-center gap-5 w-full sm:w-auto">
                        <div className="w-24 h-24 rounded-2xl bg-[#14281C] overflow-hidden shrink-0 relative">
                          <img
                            src={prod.poster_image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/products/vitality.png";
                            }}
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8BA664]">
                            {prod.category} • {prod.dosha_affinity || "Tridoshic"}
                          </span>
                          <Link href={`/products/${prod.slug || prod.id}`}>
                            <h3 className="text-lg font-serif font-bold text-[#1F3D2B] group-hover:text-[#4C6B3D] transition-colors truncate">
                              {prod.name}
                            </h3>
                          </Link>
                          {prod.sanskrit_name && (
                            <span className="text-xs font-serif italic text-[#C89D4A] block">
                              {prod.sanskrit_name}
                            </span>
                          )}
                          <p className="text-xs text-[#4C6B3D] line-clamp-1">
                            {prod.tagline || prod.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <div className="text-right">
                          <span className="text-lg font-serif font-bold text-[#1F3D2B] block">
                            ₹{effectivePrice.toLocaleString("en-IN")}
                          </span>
                          {mrp > effectivePrice && (
                            <span className="text-xs text-gray-400 line-through font-mono">
                              ₹{mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => toggleWishlist(prod)}
                          className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                            isWish
                              ? "bg-red-50 text-red-500 border-red-200"
                              : "text-gray-400 hover:text-red-500 border-gray-200"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isWish ? "fill-red-500" : ""}`} />
                        </button>

                        <button
                          onClick={() => {
                            addToCart({
                              id: prod.id,
                              name: prod.name,
                              sanskrit_name: prod.sanskrit_name,
                              category: prod.category,
                              price: effectivePrice,
                              mrp: prod.mrp,
                              poster_image: prod.poster_image,
                              volume: prod.volume,
                              dosha_affinity: prod.dosha_affinity,
                            }, 1);

                            setAddedProductId(prod.id);
                            setTimeout(() => setAddedProductId(null), 1800);
                          }}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isJustAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C]"
                          }`}
                        >
                          {isJustAdded ? "Added!" : "Add to Bag"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-xs bg-white text-[#1F3D2B] h-full overflow-y-auto p-6 space-y-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#4C6B3D]/10">
                <h3 className="font-serif font-bold text-lg text-[#1F3D2B]">
                  Filter Formulations
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-gray-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-[#8BA664]">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-medium"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Dosha Select */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-[#8BA664]">
                  Dosha Constitution
                </label>
                <select
                  value={selectedDosha}
                  onChange={(e) => setSelectedDosha(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-medium"
                >
                  {DOSHAS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Price Cap */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Price Cap</span>
                  <span>₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#1F3D2B]"
                />
              </div>

              {/* In Stock */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-medium">In Stock Only</span>
                <button
                  onClick={() => setOnlyInStock(!onlyInStock)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    onlyInStock ? "bg-[#1F3D2B]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 ${
                      onlyInStock ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-300 hover:bg-gray-50 text-center"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] text-center"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center">Loading Sacred Catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
