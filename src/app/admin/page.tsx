"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PackagePlus,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Sparkles,
  Boxes,
  Eye,
  Trash2,
  Edit,
  Tag,
  RefreshCw,
  Search
} from "lucide-react";
import { Product, AdminProductFormData } from "@/types/product";

const INITIAL_FORM: AdminProductFormData = {
  name: "",
  sanskrit_name: "",
  category: "Skin Radiance",
  tagline: "",
  description: "",
  volume: "",
  mrp: 0,
  offer_price: 0,
  stock_count: 50,
  poster_image: "",
  images: "",
  dosha_affinity: "Tridoshic",
};

const CATEGORIES = [
  "Skin Radiance",
  "Hair Nourishment",
  "Therapeutic Oils",
  "Internal Elixirs",
  "Stress & Sleep",
  "Sacred Blends",
];

const DOSHAS = ["Tridoshic", "Vata", "Pitta", "Kapha"] as const;

export default function AdminPage() {
  const [formData, setFormData] = useState<AdminProductFormData>(INITIAL_FORM);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"catalog" | "add">("catalog");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          localStorage.setItem("kv_admin_products", JSON.stringify(data.products));
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch /api/products, checking localStorage:", err);
    }

    // LocalStorage fallback
    const stored = localStorage.getItem("kv_admin_products");
    if (stored) {
      setProducts(JSON.parse(stored));
    }
    setIsLoading(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const slug =
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `prod-${Date.now()}`;

    const parsedImages = formData.images
      ? formData.images.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const newProduct: Product = {
      id: editingId || slug,
      slug,
      name: formData.name,
      sanskrit_name: formData.sanskrit_name,
      category: formData.category,
      tagline: formData.tagline,
      description: formData.description,
      volume: formData.volume,
      mrp: Number(formData.mrp),
      offer_price: Number(formData.offer_price),
      price: Number(formData.offer_price) || Number(formData.mrp),
      stock_count: Number(formData.stock_count),
      poster_image:
        formData.poster_image ||
        "https://images.unsplash.com/photo-1608248597359-009139f4ff89?q=80&w=1000&auto=format&fit=crop",
      images: parsedImages,
      dosha_affinity: formData.dosha_affinity,
      in_stock: Number(formData.stock_count) > 0 ? 1 : 0,
      rating: 5.0,
      review_count: 0,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        setSuccessMsg(
          editingId
            ? `Formulation "${newProduct.name}" updated successfully in database!`
            : `New formulation "${newProduct.name}" published to database!`
        );
      }
    } catch (err) {
      console.warn("POST /api/products error, saving to local state:", err);
    }

    let updatedList: Product[] = [];
    if (editingId) {
      updatedList = products.map((p) => (p.id === editingId ? newProduct : p));
    } else {
      updatedList = [newProduct, ...products];
    }

    setProducts(updatedList);
    localStorage.setItem("kv_admin_products", JSON.stringify(updatedList));

    setTimeout(() => {
      setFormData(INITIAL_FORM);
      setEditingId(null);
      setIsSubmitting(false);
      setActiveTab("catalog");
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 600);
  };

  const handleEdit = (prod: Product) => {
    setEditingId(prod.id);
    setFormData({
      name: prod.name,
      sanskrit_name: prod.sanskrit_name || "",
      category: prod.category,
      tagline: prod.tagline || "",
      description: prod.description || "",
      volume: prod.volume || "",
      mrp: prod.mrp || prod.price,
      offer_price: prod.offer_price || prod.price,
      stock_count: prod.stock_count || 50,
      poster_image: prod.poster_image || "",
      images: prod.images ? prod.images.join(", ") : "",
      dosha_affinity: prod.dosha_affinity,
    });
    setActiveTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this sacred formulation from catalog?")) {
      try {
        await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Delete API error:", err);
      }
      const filtered = products.filter((p) => p.id !== id);
      setProducts(filtered);
      localStorage.setItem("kv_admin_products", JSON.stringify(filtered));
      setSuccessMsg("Product removed successfully from database.");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.dosha_affinity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const discountPercent =
    formData.mrp > 0 && formData.offer_price > 0 && formData.mrp > formData.offer_price
      ? Math.round(((formData.mrp - formData.offer_price) / formData.mrp) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A202C] antialiased">
      {/* Top Admin Header (Clean White / Light Slate) */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors inline-flex items-center gap-2 text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sanctuary</span>
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#C89D4A] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                KV
              </div>
              <div>
                <h1 className="text-sm font-serif font-bold tracking-wider uppercase text-gray-900">
                  Kerala Vedics Atelier
                </h1>
                <span className="text-[10px] text-gray-500 tracking-wider uppercase font-medium">
                  Product & Formulation Command Center
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <Boxes className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-gray-500">Total Formulations:</span>
              <span className="font-bold text-gray-900">{products.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Cloudflare D1 Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {successMsg && (
        <div className="fixed top-18 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white border border-emerald-500 text-gray-900 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-semibold">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5 mb-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab("catalog");
                setEditingId(null);
                setFormData(INITIAL_FORM);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                activeTab === "catalog"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Catalog Management ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("add")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                activeTab === "add"
                  ? "bg-[#C89D4A] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              <span>{editingId ? "Edit Formulation" : "+ Add New Formulation"}</span>
            </button>
          </div>

          {activeTab === "catalog" && (
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search formulations, dosha, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C89D4A] focus:ring-1 focus:ring-[#C89D4A] transition-all shadow-2xs"
              />
            </div>
          )}
        </div>

        {/* TAB 1: ADD / EDIT PRODUCT FORM */}
        {activeTab === "add" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Section (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-gray-900">
                    {editingId ? "Edit Ayurvedic Formulation" : "Create New Ayurvedic Formulation"}
                  </h2>
                  <p className="text-xs text-gray-500 font-normal mt-1">
                    Fill in botanical details, pricing tiers, stock, and photography.
                  </p>
                </div>
                {editingId && (
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-semibold">
                    Editing ID: {editingId}
                  </span>
                )}
              </div>

              <form onSubmit={handleCreateOrUpdateProduct} className="space-y-5">
                {/* Product Name */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Kumkumadi Miraculous Beauty Fluid"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C89D4A] transition-all"
                  />
                </div>


                {/* Tagline & Volume / Net Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                      Tagline / Botanical Subtitle
                    </label>
                    <input
                      type="text"
                      name="tagline"
                      placeholder="e.g. Kashmiri Saffron & 26 Himalayan Botanicals"
                      value={formData.tagline}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C89D4A] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                      Net Quantity / Volume *
                    </label>
                    <input
                      type="text"
                      name="volume"
                      required
                      placeholder="e.g. 50 ml / 1.7 fl oz, 500 g"
                      value={formData.volume}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C89D4A] transition-all"
                    />
                  </div>
                </div>

                {/* Pricing & Stock Grid (MRP, Offer Price, Stock Count) */}
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900">
                    <Tag className="w-4 h-4 text-amber-700" />
                    <span>Commercial & Inventory Parameters (INR ₹)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 mb-1">
                        MRP (Standard Price ₹) *
                      </label>
                      <input
                        type="number"
                        name="mrp"
                        step="1"
                        required
                        placeholder="1450"
                        value={formData.mrp || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 font-semibold focus:outline-none focus:border-[#C89D4A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 mb-1">
                        Offer Price (Selling ₹) *
                      </label>
                      <input
                        type="number"
                        name="offer_price"
                        step="1"
                        required
                        placeholder="1199"
                        value={formData.offer_price || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#C89D4A] text-sm text-[#C89D4A] font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 mb-1">
                        Inventory Stock Count *
                      </label>
                      <input
                        type="number"
                        name="stock_count"
                        required
                        placeholder="50"
                        value={formData.stock_count}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 font-semibold focus:outline-none focus:border-[#C89D4A]"
                      />
                    </div>
                  </div>
                  {discountPercent > 0 && (
                    <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 font-medium pt-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#C89D4A]" />
                      <span>
                        Effective Customer Discount: <strong className="text-emerald-800">{discountPercent}% OFF</strong> (Customer saves ₹{(formData.mrp - formData.offer_price).toLocaleString("en-IN")})
                      </span>
                    </div>
                  )}
                </div>

                {/* Formulation Description */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                    Classical Formulation & Ritual Description *
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    placeholder="Provide authentic details on preparation, classical decoction (Kashayam), carrier oils, and medicinal benefits..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C89D4A] transition-all"
                  />
                </div>

                {/* Product Images (Direct Upload / Drag & Drop or URL) */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                      Primary Product Cover Image *
                    </label>

                    {/* File Upload Box */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      <label className="flex-1 w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 hover:border-[#C89D4A] rounded-2xl bg-gray-50/80 hover:bg-amber-50/30 cursor-pointer transition-all group">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#C89D4A] mb-1.5 transition-colors" />
                        <span className="text-xs font-semibold text-gray-700 group-hover:text-[#C89D4A]">
                          Click or drag image file to upload
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          PNG, JPG, WebP up to 5MB (Stores in Database)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new Image();
                                img.onload = () => {
                                  // Compress and resize for D1 efficiency
                                  const canvas = document.createElement("canvas");
                                  let width = img.width;
                                  let height = img.height;
                                  const maxDim = 1000;
                                  if (width > maxDim || height > maxDim) {
                                    if (width > height) {
                                      height = Math.round((height * maxDim) / width);
                                      width = maxDim;
                                    } else {
                                      width = Math.round((width * maxDim) / height);
                                      height = maxDim;
                                    }
                                  }
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext("2d");
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  const compressedBase64 = canvas.toDataURL("image/webp", 0.85);
                                  setFormData((prev) => ({
                                    ...prev,
                                    poster_image: compressedBase64,
                                  }));
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {formData.poster_image && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100">
                          <img
                            src={formData.poster_image}
                            alt="Cover thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, poster_image: "" }))}
                            className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-0.5 hover:bg-red-700"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Or Manual URL Input */}
                    <div className="mt-2">
                      <span className="text-[10px] text-gray-400 block mb-1">
                        Or enter an image URL / relative path:
                      </span>
                      <input
                        type="text"
                        name="poster_image"
                        placeholder="e.g. /products/arshana-lehyam.png or https://..."
                        value={formData.poster_image.startsWith("data:") ? "" : formData.poster_image}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C89D4A] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                      Additional Gallery Images
                    </label>

                    {/* Additional Images Upload */}
                    <label className="w-full flex flex-col items-center justify-center p-3 border border-dashed border-gray-300 hover:border-[#C89D4A] rounded-xl bg-gray-50 hover:bg-amber-50/20 cursor-pointer transition-all group">
                      <span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#C89D4A]">
                        + Add Gallery Images from Device
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach((file) => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                let width = img.width;
                                let height = img.height;
                                const maxDim = 800;
                                if (width > maxDim || height > maxDim) {
                                  if (width > height) {
                                    height = Math.round((height * maxDim) / width);
                                    width = maxDim;
                                  } else {
                                    width = Math.round((width * maxDim) / height);
                                    height = maxDim;
                                  }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext("2d");
                                ctx?.drawImage(img, 0, 0, width, height);
                                const base64 = canvas.toDataURL("image/webp", 0.8);
                                setFormData((prev) => ({
                                  ...prev,
                                  images: prev.images ? `${prev.images}, ${base64}` : base64,
                                }));
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      name="images"
                      placeholder="https://img1.jpg, https://img2.jpg"
                      value={formData.images}
                      onChange={handleInputChange}
                      className="w-full mt-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C89D4A] transition-all"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(INITIAL_FORM);
                      setEditingId(null);
                      setActiveTab("catalog");
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] shadow-md transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{editingId ? "Update Formulation" : "Publish to Catalog"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Visual Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-24 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <span className="text-xs uppercase tracking-wider font-semibold text-gray-600 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#C89D4A]" />
                    <span>Live Customer Card Preview</span>
                  </span>
                </div>

                {/* Card Simulator */}
                <div className="bg-[#FAF7F2] rounded-2xl overflow-hidden text-[#1F3D2B] shadow-sm border border-[#4C6B3D]/15">
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    {formData.poster_image ? (
                      <img
                        src={formData.poster_image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1608248597359-009139f4ff89?q=80&w=1000&auto=format&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Upload className="w-8 h-8" />
                        <span className="text-xs">Image will render here</span>
                      </div>
                    )}
                    {formData.volume && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-gray-800 shadow-xs">
                          {formData.volume}
                        </span>
                      </div>
                    )}
                    {discountPercent > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                          {discountPercent}% OFF
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#8BA664]">
                        {formData.category || "Ayurvedic Formulation"}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-[#1F3D2B] mt-0.5">
                        {formData.name || "Formulation Name"}
                      </h3>
                      <p className="text-xs text-[#4C6B3D] italic mt-1 line-clamp-1">
                        {formData.tagline || "Tagline & botanical description..."}
                      </p>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-light">
                      {formData.description ||
                        "Full classical details and cell-nourishing benefits will be showcased here."}
                    </p>

                    <div className="pt-3 border-t border-[#4C6B3D]/10 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase text-[#8BA664] block font-semibold">
                          Investment Price
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-serif font-bold text-[#1F3D2B]">
                            ₹{formData.offer_price || formData.mrp || 0}
                          </span>
                          {formData.mrp > formData.offer_price && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{formData.mrp}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] uppercase text-[#8BA664] block font-semibold">
                          Available Stock
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-800">
                          {formData.stock_count} units
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Sparkles className="w-4 h-4 text-[#C89D4A]" />
                    <span>Real-Time Catalog Sync</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Saving this formulation automatically updates your products list, pricing calculations, and customer drawers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATALOG LISTING & STOCK MANAGEMENT */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <Boxes className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-lg font-serif font-bold text-gray-900">No formulations found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  No products matched your search. Try resetting your query or create a new formulation.
                </p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-900 text-white hover:bg-black"
                >
                  + Add First Formulation
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 uppercase font-semibold text-[11px]">
                        <th className="py-4 px-6">Product</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4">Volume</th>
                        <th className="py-4 px-4">Pricing (MRP / Offer)</th>
                        <th className="py-4 px-4">Stock Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((prod) => {
                        const mrpVal = prod.mrp || prod.price;
                        const offerVal = prod.offer_price || prod.price;
                        const discount =
                          mrpVal > offerVal ? Math.round(((mrpVal - offerVal) / mrpVal) * 100) : 0;

                        return (
                          <tr
                            key={prod.id}
                            className="hover:bg-gray-50/70 transition-colors group"
                          >
                            {/* Product Info */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.poster_image}
                                  alt={prod.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/products/vitality.png";
                                  }}
                                />
                                <div>
                                  <h4 className="font-serif font-bold text-sm text-gray-900 group-hover:text-[#C89D4A] transition-colors">
                                    {prod.name}
                                  </h4>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    SKU: {prod.id}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-4 px-4">
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                                {prod.category}
                              </span>
                            </td>

                            {/* Volume */}
                            <td className="py-4 px-4 text-gray-700 font-mono">
                              {prod.volume || "—"}
                            </td>

                            {/* Pricing */}
                            <td className="py-4 px-4">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="font-bold text-sm text-gray-900">
                                    ₹{offerVal.toLocaleString("en-IN")}
                                  </span>
                                  {discount > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-50 text-red-600 font-bold border border-red-200">
                                      -{discount}%
                                    </span>
                                  )}
                                </div>
                                {mrpVal > offerVal && (
                                  <span className="text-[11px] text-gray-400 line-through block font-mono">
                                    MRP: ₹{mrpVal.toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Stock Count */}
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      (prod.stock_count || 0) > 10
                                        ? "bg-emerald-500"
                                        : (prod.stock_count || 0) > 0
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                    }`}
                                  />
                                  <span className="font-mono font-bold text-xs text-gray-800">
                                    {prod.stock_count || 0} units
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-500 block">
                                  {(prod.stock_count || 0) > 0 ? "In Stock" : "Out of Stock"}
                                </span>
                              </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(prod)}
                                  className="p-2 rounded-lg bg-gray-100 hover:bg-[#C89D4A] hover:text-white text-gray-700 transition-colors border border-gray-200"
                                  title="Edit Formulation"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(prod.id)}
                                  className="p-2 rounded-lg bg-gray-100 hover:bg-red-600 hover:text-white text-gray-700 transition-colors border border-gray-200"
                                  title="Remove Formulation"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
