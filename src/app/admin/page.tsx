"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Search,
  TrendingUp,
  DollarSign,
  Users,
  Stethoscope,
  Ticket,
  Check,
  X,
  AlertCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Plus,
  Award,
  Filter,
  Activity,
  ArrowUpRight,
  Sliders,
  Calendar,
  Percent,
} from "lucide-react";
import { Product, AdminProductFormData } from "@/types/product";
import {
  Doctor,
  PlatformAnalytics,
  Coupon,
  AYURVEDIC_SPECIALIZATIONS,
  AYURVEDIC_COUNCILS,
  DiscountType,
  CouponAppliesTo,
} from "@/types/consultation";

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

type AdminTab = "overview" | "doctors" | "offers" | "catalog" | "add";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // ── Session guard ──────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/admin-login")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setSessionChecked(true);
        } else {
          router.replace("/admin/login");
        }
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/admin-login", { method: "DELETE" });
    document.cookie = "kv_admin_session=; max-age=0; path=/";
    router.replace("/admin/login");
  };

  // -------------------------------------------------------------
  // 1. ANALYTICS STATE
  // -------------------------------------------------------------
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // -------------------------------------------------------------
  // 2. DOCTOR SUPERVISION STATE
  // -------------------------------------------------------------
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [doctorFilter, setDoctorFilter] = useState<"all" | "Pending" | "Approved" | "Suspended">("all");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [doctorSubmitting, setDoctorSubmitting] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    registration_number: "",
    council_name: "National Commission for Indian System of Medicine (NCISM)",
    degree: "BAMS",
    specialization: "Kayachikitsa",
    years_experience: 5,
    consultation_fee: 499,
    commission_rate: 0.2,
    bio: "",
    languages: ["English", "Malayalam"],
    certificate_url: "",
  });

  // -------------------------------------------------------------
  // 3. OFFERS & COUPONS STATE
  // -------------------------------------------------------------
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const [newCoupon, setNewCoupon] = useState<{
    code: string;
    description: string;
    discount_type: DiscountType;
    discount_value: number;
    min_order_amount: number;
    max_discount_amount: number;
    applies_to: CouponAppliesTo;
    expires_at: string;
    usage_limit: number;
  }>({
    code: "",
    description: "",
    discount_type: "PERCENTAGE",
    discount_value: 15,
    min_order_amount: 999,
    max_discount_amount: 500,
    applies_to: "BOTH",
    expires_at: "",
    usage_limit: 500,
  });

  // -------------------------------------------------------------
  // 4. PRODUCT CATALOG STATE
  // -------------------------------------------------------------
  const [formData, setFormData] = useState<AdminProductFormData>(INITIAL_FORM);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Initial Data Fetching
  useEffect(() => {
    if (!sessionChecked) return;
    loadAnalytics();
    loadDoctors();
    loadCoupons();
    loadProducts();
  }, [sessionChecked]);

  // Temporary message dismisser
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // =============================================================
  // DATA LOADERS
  // =============================================================
  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
          return;
        }
      }
    } catch (e) {
      console.warn("Analytics API fetch error, using local fallback", e);
    }
    // Fallback baseline when database has no records yet
    setAnalytics({
      total_gmv: 0,
      product_revenue: 0,
      consultation_revenue: 0,
      platform_commission: 0,
      pending_payouts: 0,
      total_appointments: 0,
      consultation_conversion_rate: 0,
      active_doctors: 0,
      pending_verifications: 0,
    });
    setIsLoadingAnalytics(false);
  };

  const loadDoctors = async () => {
    setIsLoadingDoctors(true);
    try {
      const res = await fetch("/api/admin/doctors");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
          return;
        }
      }
    } catch (e) {
      console.warn("Doctors API fetch error", e);
    } finally {
      setIsLoadingDoctors(false);
    }
    setDoctors([]);
  };

  const loadCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
          return;
        }
      }
    } catch (e) {
      console.warn("Coupons API fetch error, fallback active", e);
    }
    setCoupons([
      {
        id: "coup_1",
        code: "VEDIC15",
        description: "15% off all classical Kerala Vedics formulations",
        discount_type: "PERCENTAGE",
        discount_value: 15,
        min_order_amount: 999,
        max_discount_amount: 350,
        applies_to: "PRODUCTS",
        usage_count: 142,
        usage_limit: 1000,
        is_active: 1,
        starts_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: "coup_2",
        code: "FREEVAIDYA",
        description: "100% discount on initial Ayurvedic doctor consultation",
        discount_type: "FREE_CONSULTATION",
        discount_value: 499,
        min_order_amount: 1499,
        applies_to: "CONSULTATION",
        usage_count: 87,
        usage_limit: 500,
        is_active: 1,
        starts_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: "coup_3",
        code: "FLAT300",
        description: "Flat ₹300 off on total wellness bundle purchases",
        discount_type: "FLAT",
        discount_value: 300,
        min_order_amount: 1999,
        applies_to: "BOTH",
        usage_count: 45,
        is_active: 1,
        starts_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]);
    setIsLoadingCoupons(false);
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          localStorage.setItem("kv_admin_products", JSON.stringify(data.products));
          setIsLoadingProducts(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch /api/products, checking localStorage:", err);
    }

    const stored = localStorage.getItem("kv_admin_products");
    if (stored) {
      setProducts(JSON.parse(stored));
    }
    setIsLoadingProducts(false);
  };

  // =============================================================
  // DOCTOR ACTIONS
  // =============================================================
  const handleDoctorAction = async (
    doctorId: string,
    action: "approve" | "reject" | "suspend" | "reactivate",
    rejectionReason?: string
  ) => {
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id: doctorId, action, rejection_reason: rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Doctor status updated to ${action}d successfully.`);
        setDoctors((prev) =>
          prev.map((doc) => {
            if (doc.id === doctorId) {
              const statusMap = {
                approve: "Approved",
                reject: "Rejected",
                suspend: "Suspended",
                reactivate: "Approved",
              } as const;
              return {
                ...doc,
                verification_status: statusMap[action],
                is_active: action === "suspend" ? 0 : 1,
              };
            }
            return doc;
          })
        );
        loadAnalytics();
      } else {
        setErrorMsg(data.error || "Failed to update doctor status");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error");
    }
  };

  const handleUpdateCommission = async (doctorId: string, newRate: number) => {
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id: doctorId, action: "update_commission", commission_rate: newRate }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Commission rate set to ${Math.round(newRate * 100)}%`);
        setDoctors((prev) =>
          prev.map((d) => (d.id === doctorId ? { ...d, commission_rate: newRate } : d))
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorSubmitting(true);
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctor),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Doctor registered and approved successfully!");
        setIsAddDoctorOpen(false);
        loadDoctors();
        loadAnalytics();
      } else {
        setErrorMsg(data.error || "Failed to create doctor");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error");
    } finally {
      setDoctorSubmitting(false);
    }
  };

  // =============================================================
  // COUPON ACTIONS
  // =============================================================
  const handleToggleCoupon = async (couponId: string, currentActive: number) => {
    try {
      const nextActive = currentActive ? 0 : 1;
      const res = await fetch("/api/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: couponId, is_active: nextActive }),
      });
      if (res.ok) {
        setSuccessMsg(`Coupon ${nextActive ? "activated" : "deactivated"}`);
        setCoupons((prev) =>
          prev.map((c) => (c.id === couponId ? { ...c, is_active: nextActive } : c))
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponSubmitting(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Coupon "${newCoupon.code.toUpperCase()}" published!`);
        setIsAddCouponOpen(false);
        loadCoupons();
      } else {
        setErrorMsg(data.error || "Failed to create coupon");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error");
    } finally {
      setCouponSubmitting(false);
    }
  };

  // =============================================================
  // PRODUCT ACTIONS
  // =============================================================
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
    setIsSubmittingProduct(true);

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

    setFormData(INITIAL_FORM);
    setEditingId(null);
    setIsSubmittingProduct(false);
    setActiveTab("catalog");
  };

  const handleEditProduct = (prod: Product) => {
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
      dosha_affinity: prod.dosha_affinity || "Tridoshic",
    });
    setEditingId(prod.id);
    setActiveTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete formulation "${name}"?`)) return;
    const filtered = products.filter((p) => p.id !== id);
    setProducts(filtered);
    localStorage.setItem("kv_admin_products", JSON.stringify(filtered));
    setSuccessMsg(`Formulation "${name}" removed.`);
  };

  // Filtered lists
  const filteredDoctors = doctors.filter((doc) => {
    const matchesStatus = doctorFilter === "all" ? true : doc.verification_status === doctorFilter;
    const matchesSearch =
      doctorSearch === ""
        ? true
        : doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
          doc.specialization?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
          doc.registration_number?.toLowerCase().includes(doctorSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingDoctorsCount = doctors.filter((d) => d.verification_status === "Pending").length;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sanskrit_name && p.sanskrit_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.dosha_affinity && p.dosha_affinity.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const discountPercent =
    formData.mrp > formData.offer_price && formData.mrp > 0
      ? Math.round(((formData.mrp - formData.offer_price) / formData.mrp) * 100)
      : 0;

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#111D10] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C89D4A] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans pb-24">
      {/* Superadmin Header */}
      <header className="sticky top-0 z-40 bg-[#16291E] border-b border-[#C89D4A]/25 text-white backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-xl text-[#C89D4A] hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>

            <div className="h-6 w-px bg-white/15" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C89D4A] bg-[#C89D4A]/15 px-2 py-0.5 rounded-md border border-[#C89D4A]/30">
                  Superadmin Control Center
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-serif font-bold text-[#F3E5C8] tracking-tight">
                Kerala Vedics Operations & Telehealth
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/consultant/dashboard"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 text-xs text-[#E5D7B7] hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-all"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#C89D4A]" />
              <span>Doctor Portal</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            <Link
              href="/doctors"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#E5D7B7] hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-all"
            >
              <span>Vaidya Directory</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl border border-red-500/20 transition-all"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Global Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none border-t border-white/10 text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-[#C89D4A] text-[#16291E] font-bold shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Revenue & Operations</span>
          </button>

          <button
            onClick={() => setActiveTab("doctors")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap relative ${
              activeTab === "doctors"
                ? "bg-[#C89D4A] text-[#16291E] font-bold shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Network</span>
            {pendingDoctorsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-black">
                {pendingDoctorsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("offers")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === "offers"
                ? "bg-[#C89D4A] text-[#16291E] font-bold shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Offers & Promotions ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === "catalog"
                ? "bg-[#C89D4A] text-[#16291E] font-bold shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Formulation Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => {
              setEditingId(null);
              setFormData(INITIAL_FORM);
              setActiveTab("add");
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ml-auto ${
              activeTab === "add"
                ? "bg-white text-[#16291E] font-bold shadow-sm"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingId ? "Edit Formulation" : "Add Formulation"}</span>
          </button>
        </div>
      </header>

      {/* Notifications / Alerts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-medium shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-medium shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ============================================================= */}
        {/* TAB 1: REVENUE & OPERATIONS OVERVIEW                          */}
        {/* ============================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Top Financial Stat Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                    Total Platform GMV
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C89D4A]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                    ₹{(analytics?.total_gmv || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  <span className="text-emerald-600 font-semibold flex items-center">
                    <ArrowUpRight className="w-3 h-3" /> Combined
                  </span>{" "}
                  Products + Consultations
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                    Product E-Commerce
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Boxes className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                    ₹{(analytics?.product_revenue || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Classical botanical formulations sold
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                    Telehealth Consultations
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                    ₹{(analytics?.consultation_revenue || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {analytics?.total_appointments || 0} patient sessions booked
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#16291E] to-[#254432] text-white rounded-3xl p-5 shadow-sm relative overflow-hidden border border-[#C89D4A]/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#C89D4A]">
                    Platform Net Commission
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#C89D4A]">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-[#F3E5C8]">
                    ₹{(analytics?.platform_commission || 0).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-white/70">
                  <span>Pending Payouts:</span>
                  <span className="font-semibold text-amber-300">
                    ₹{(analytics?.pending_payouts || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Health & Network KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C89D4A]" />
                      <span>The "Man Matters" Funnel Conversion</span>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3 my-2">
                    <span className="text-4xl font-serif font-bold text-[#1F3D2B]">
                      {analytics?.consultation_conversion_rate || 68}%
                    </span>
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                      High Intent
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mt-2">
                    Of patients completing an Ayurvedic telehealth consult, <strong>68%</strong> proceeded to purchase the prescribed Kerala Vedics regimen via 1-click cart checkout.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Total Appointments: {analytics?.total_appointments || 0}</span>
                  <Link href="/consultant/dashboard" className="text-[#C89D4A] font-semibold hover:underline">
                    View Logs →
                  </Link>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-600 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#C89D4A]" />
                      <span>Vaidya Medical Roster</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 my-2">
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                      <span className="text-[10px] uppercase font-semibold text-emerald-800 block">
                        Verified Doctors
                      </span>
                      <span className="text-2xl font-serif font-bold text-emerald-950">
                        {analytics?.active_doctors || doctors.filter(d => d.verification_status === "Approved").length}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
                      <span className="text-[10px] uppercase font-semibold text-amber-800 block">
                        Pending Verification
                      </span>
                      <span className="text-2xl font-serif font-bold text-amber-950">
                        {pendingDoctorsCount}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mt-2">
                    All practicing doctors must hold verifiable BAMS/MD degrees and state medical council licenses.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Verification queue</span>
                  <button
                    onClick={() => {
                      setDoctorFilter("Pending");
                      setActiveTab("doctors");
                    }}
                    className="text-[#C89D4A] font-semibold hover:underline"
                  >
                    Review ({pendingDoctorsCount}) →
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-600 flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-[#C89D4A]" />
                      <span>Promotional Campaigns</span>
                    </span>
                  </div>
                  <div className="space-y-2 my-2">
                    <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="font-mono font-bold text-gray-900">FREEVAIDYA</span>
                      <span className="text-emerald-700 font-semibold text-[11px]">Free Consult &gt; ₹1499</span>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="font-mono font-bold text-gray-900">VEDIC15</span>
                      <span className="text-gray-600 text-[11px]">15% Off Products</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mt-2">
                    Cross-funnel promotional vouchers bridge consultation discovery with classical formulations.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{coupons.length} Active Codes</span>
                  <button onClick={() => setActiveTab("offers")} className="text-[#C89D4A] font-semibold hover:underline">
                    Manage Offers →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-gradient-to-r from-amber-50/60 to-emerald-50/40 border border-amber-200/60 rounded-3xl p-6">
              <h3 className="text-sm uppercase tracking-wider font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C89D4A]" />
                Superadmin Quick Operations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setIsAddDoctorOpen(true)}
                  className="p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-[#C89D4A] hover:shadow-xs transition-all text-left group"
                >
                  <Stethoscope className="w-5 h-5 text-[#C89D4A] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-900 block">+ Onboard Doctor</span>
                  <span className="text-[11px] text-gray-500">Direct verified registration</span>
                </button>

                <button
                  onClick={() => setIsAddCouponOpen(true)}
                  className="p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-[#C89D4A] hover:shadow-xs transition-all text-left group"
                >
                  <Ticket className="w-5 h-5 text-[#C89D4A] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-900 block">+ Launch Offer</span>
                  <span className="text-[11px] text-gray-500">Create discount / consult coupon</span>
                </button>

                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData(INITIAL_FORM);
                    setActiveTab("add");
                  }}
                  className="p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-[#C89D4A] hover:shadow-xs transition-all text-left group"
                >
                  <PackagePlus className="w-5 h-5 text-[#C89D4A] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-gray-900 block">+ Add Formulation</span>
                  <span className="text-[11px] text-gray-500">Publish new Ayurvedic oil / lehyam</span>
                </button>

                <button
                  onClick={() => {
                    loadAnalytics();
                    loadDoctors();
                    loadCoupons();
                    loadProducts();
                    setSuccessMsg("All platform data refreshed.");
                  }}
                  className="p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-[#C89D4A] hover:shadow-xs transition-all text-left group"
                >
                  <RefreshCw className="w-5 h-5 text-[#C89D4A] mb-1.5 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-xs font-bold text-gray-900 block">Refresh Data</span>
                  <span className="text-[11px] text-gray-500">Sync latest D1 database state</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: DOCTOR NETWORK SUPERVISION                            */}
        {/* ============================================================= */}
        {activeTab === "doctors" && (
          <div className="space-y-6">
            {/* Top Bar with Filter & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setDoctorFilter("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    doctorFilter === "all"
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({doctors.length})
                </button>

                <button
                  onClick={() => setDoctorFilter("Pending")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    doctorFilter === "Pending"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Review ({pendingDoctorsCount})</span>
                </button>

                <button
                  onClick={() => setDoctorFilter("Approved")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    doctorFilter === "Approved"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified / Active</span>
                </button>

                <button
                  onClick={() => setDoctorFilter("Suspended")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    doctorFilter === "Suspended"
                      ? "bg-red-700 text-white shadow-xs"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  Suspended
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search doctor, council, reg no..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C89D4A]"
                  />
                </div>

                <button
                  onClick={() => setIsAddDoctorOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#16291E] text-[#C89D4A] hover:bg-[#1f382a] border border-[#C89D4A]/40 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Doctor</span>
                </button>
              </div>
            </div>

            {/* Doctors List */}
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
                <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-serif font-bold text-gray-800">No doctors match this filter</h3>
                <p className="text-xs text-gray-500 mt-1">Try switching tabs or adjusting search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredDoctors.map((doc) => {
                  const isPending = doc.verification_status === "Pending";
                  const isApproved = doc.verification_status === "Approved";
                  const isSuspended = doc.verification_status === "Suspended";

                  return (
                    <div
                      key={doc.id}
                      className={`bg-white rounded-3xl p-6 border transition-all shadow-xs ${
                        isPending
                          ? "border-amber-300 bg-amber-50/20"
                          : isSuspended
                          ? "border-red-200 bg-red-50/10"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Doctor Info */}
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-[#16291E] text-[#C89D4A] flex items-center justify-center font-serif text-xl font-bold flex-shrink-0 overflow-hidden border border-[#C89D4A]/30">
                            {doc.profile_photo ? (
                              <img
                                src={doc.profile_photo}
                                alt={doc.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{doc.name ? doc.name.charAt(0) : "V"}</span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-serif font-bold text-gray-900">
                                {doc.name || "Dr. Unnamed Vaidya"}
                              </h3>

                              {isApproved && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3" />
                                  Approved & Active
                                </span>
                              )}

                              {isPending && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-300">
                                  <Clock className="w-3 h-3" />
                                  Verification Required
                                </span>
                              )}

                              {isSuspended && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                  Suspended
                                </span>
                              )}

                              <span className="text-[11px] font-semibold text-[#8BA664]">
                                {doc.specialization}
                              </span>
                            </div>

                            <p className="text-xs text-gray-600 flex items-center gap-2 flex-wrap">
                              <span><strong>{doc.degree}</strong> ({doc.years_experience} yrs exp)</span>
                              <span className="text-gray-300">•</span>
                              <span>Reg: <code className="font-mono text-gray-800 font-semibold">{doc.registration_number}</code></span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-500">{doc.council_name}</span>
                            </p>

                            <p className="text-xs text-gray-500 line-clamp-1">{doc.bio}</p>

                            <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-1">
                              <span>Fee: <strong className="text-gray-900">₹{doc.consultation_fee}</strong></span>
                              <span>•</span>
                              <span>Platform Cut: <strong className="text-[#C89D4A]">{Math.round(doc.commission_rate * 100)}%</strong></span>
                              <span>•</span>
                              <span>Rating: <strong className="text-amber-600">★ {doc.rating || 5.0}</strong></span>
                              <span>•</span>
                              <span>Consultations: <strong className="text-gray-900">{doc.total_consultations || 0}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Actions & Verification Controls */}
                        <div className="flex items-center gap-2 flex-wrap lg:justify-end">
                          {doc.certificate_url && (
                            <a
                              href={doc.certificate_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View Certificate</span>
                            </a>
                          )}

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleDoctorAction(doc.id, "approve")}
                                className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve Doctor</span>
                              </button>

                              <button
                                onClick={() => {
                                  const reason = window.prompt("Reason for application rejection:");
                                  if (reason !== null) handleDoctorAction(doc.id, "reject", reason);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold flex items-center gap-1 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Suspend doctor ${doc.name}? They will not be bookable.`)) {
                                  handleDoctorAction(doc.id, "suspend");
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600 text-xs font-semibold transition-all"
                            >
                              Suspend
                            </button>
                          )}

                          {isSuspended && (
                            <button
                              onClick={() => handleDoctorAction(doc.id, "reactivate")}
                              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all"
                            >
                              Reactivate
                            </button>
                          )}

                          {/* Commission Adjuster */}
                          <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200 rounded-xl px-2.5 py-1 text-xs">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Cut:</span>
                            <select
                              value={doc.commission_rate}
                              onChange={(e) => handleUpdateCommission(doc.id, parseFloat(e.target.value))}
                              className="bg-transparent text-xs font-bold text-gray-900 focus:outline-none cursor-pointer"
                            >
                              <option value="0.10">10%</option>
                              <option value="0.15">15%</option>
                              <option value="0.20">20% (Standard)</option>
                              <option value="0.25">25%</option>
                              <option value="0.30">30%</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 3: OFFERS & PROMOTIONS MANAGEMENT                         */}
        {/* ============================================================= */}
        {activeTab === "offers" && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
              <div>
                <h2 className="text-base font-serif font-bold text-gray-900">
                  Promotional Campaigns & Cross-Funnel Coupons
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Drive product sales and doctor consultations with promo codes and free vouchers.
                </p>
              </div>

              <button
                onClick={() => setIsAddCouponOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#16291E] text-[#C89D4A] hover:bg-[#1f382a] border border-[#C89D4A]/40 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create New Offer</span>
              </button>
            </div>

            {/* Coupons Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {coupons.map((coupon) => {
                const isActive = Boolean(coupon.is_active);

                return (
                  <div
                    key={coupon.id}
                    className={`bg-white rounded-3xl p-6 border transition-all shadow-xs flex flex-col justify-between ${
                      isActive ? "border-gray-200" : "border-gray-200 opacity-60 bg-gray-50"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-xl font-mono text-sm font-bold bg-[#FAF7F2] text-[#1F3D2B] border border-[#C89D4A]/30 tracking-wider">
                          {coupon.code}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div>
                        <div className="text-lg font-serif font-bold text-gray-900">
                          {coupon.discount_type === "PERCENTAGE" && `${coupon.discount_value}% OFF`}
                          {coupon.discount_type === "FLAT" && `Flat ₹${coupon.discount_value} OFF`}
                          {coupon.discount_type === "FREE_CONSULTATION" && "100% FREE Doctor Consult"}
                          {coupon.discount_type === "FREE_SHIPPING" && "Free Express Shipping"}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {coupon.description || "Valid on all Kerala Vedics orders."}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-gray-50 text-[11px] text-gray-600 space-y-1.5 border border-gray-100">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min Order:</span>
                          <span className="font-semibold text-gray-900">₹{coupon.min_order_amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Applies To:</span>
                          <span className="font-semibold text-gray-900">{coupon.applies_to}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Redeemed:</span>
                          <span className="font-semibold text-emerald-700">
                            {coupon.usage_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : "times"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                          isActive
                            ? "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
                            : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>

                      <span className="text-[10px] text-gray-400 font-mono">
                        ID: {coupon.id.substring(0, 10)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 4: FORMULATION CATALOG MANAGEMENT                         */}
        {/* ============================================================= */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
              <div>
                <h2 className="text-base font-serif font-bold text-gray-900">
                  Classical Ayurvedic Formulations & Stock
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add, adjust inventory counts, change offer pricing, or update Sanskrit names.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search formulations, dosha, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C89D4A]"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => {
                const isOutOfStock = (prod.stock_count || 0) <= 0;
                const hasDiscount = prod.mrp && prod.offer_price && prod.mrp > prod.offer_price;

                return (
                  <div
                    key={prod.id}
                    className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <img
                          src={prod.poster_image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1608248597359-009139f4ff89?q=80&w=1000&auto=format&fit=crop";
                          }}
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-sm text-gray-900 shadow-xs">
                            {prod.category}
                          </span>
                          {prod.dosha_affinity && (
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#16291E]/90 text-[#C89D4A] backdrop-blur-sm">
                              {prod.dosha_affinity}
                            </span>
                          )}
                        </div>

                        {hasDiscount && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                              {Math.round(((prod.mrp! - prod.offer_price!) / prod.mrp!) * 100)}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        {prod.sanskrit_name && (
                          <span className="text-[11px] font-serif font-medium text-[#8BA664] block">
                            {prod.sanskrit_name}
                          </span>
                        )}
                        <h3 className="text-base font-serif font-bold text-gray-900 line-clamp-1">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {prod.tagline || prod.description}
                        </p>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-serif font-bold text-gray-900">
                              ₹{prod.offer_price || prod.price}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-gray-400 line-through ml-2">
                                ₹{prod.mrp}
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-xs font-mono font-bold ${
                                isOutOfStock ? "text-red-600" : "text-gray-700"
                              }`}
                            >
                              {isOutOfStock ? "Out of Stock" : `${prod.stock_count || 50} in stock`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href={`/products/${prod.slug}`}
                        target="_blank"
                        className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditProduct(prod)}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-amber-600 hover:border-amber-300 transition-colors"
                          title="Edit Formulation"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-300 transition-colors"
                          title="Delete Formulation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 5: ADD / EDIT FORMULATION FORM                            */}
        {/* ============================================================= */}
        {activeTab === "add" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-gray-900">
                    {editingId ? "Edit Ayurvedic Formulation" : "Create New Ayurvedic Formulation"}
                  </h2>
                  <p className="text-xs text-gray-500 font-normal mt-1">
                    Fill in botanical details, Sanskrit names, dosha affinity, and stock counts.
                  </p>
                </div>
                {editingId && (
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-semibold">
                    Editing: {editingId}
                  </span>
                )}
              </div>

              <form onSubmit={handleCreateOrUpdateProduct} className="space-y-5">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                      Classical Sanskrit Name
                    </label>
                    <input
                      type="text"
                      name="sanskrit_name"
                      placeholder="e.g. कुंकुमादि तैलम्"
                      value={formData.sanskrit_name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C89D4A] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#C89D4A] transition-all"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

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

                {/* Pricing & Stock */}
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <span className="text-xs uppercase tracking-wider font-bold text-amber-900 block">
                    Pricing & Inventory Tiers
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        MRP (Standard) *
                      </label>
                      <input
                        type="number"
                        name="mrp"
                        required
                        min="0"
                        step="1"
                        value={formData.mrp || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Offer Price (Selling) *
                      </label>
                      <input
                        type="number"
                        name="offer_price"
                        required
                        min="0"
                        step="1"
                        value={formData.offer_price || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Units in Stock *
                      </label>
                      <input
                        type="number"
                        name="stock_count"
                        required
                        min="0"
                        value={formData.stock_count || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Dosha Affinity */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-2">
                    Primary Dosha Affinity
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DOSHAS.map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setFormData((prev) => ({ ...prev, dosha_affinity: d }))}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                          formData.dosha_affinity === d
                            ? "bg-[#16291E] text-[#C89D4A] border-[#C89D4A] shadow-xs"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                    Classical Description & Botanical Synergy
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Provide full preparation method, benefits, and instructions..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C89D4A] transition-all"
                  />
                </div>

                {/* Image URL Input */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1.5">
                    Poster Image URL
                  </label>
                  <input
                    type="text"
                    name="poster_image"
                    placeholder="https://images.unsplash.com/... or /products/..."
                    value={formData.poster_image}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C89D4A] transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("catalog")}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingProduct}
                    className="px-6 py-2.5 rounded-xl bg-[#16291E] text-[#C89D4A] hover:bg-[#1f382a] border border-[#C89D4A]/40 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
                  >
                    {isSubmittingProduct ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Publishing...</span>
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

            {/* Live Visual Preview */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-24 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <span className="text-xs uppercase tracking-wider font-semibold text-gray-600 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#C89D4A]" />
                    <span>Live Customer Card Simulator</span>
                  </span>
                </div>

                <div className="bg-[#FAF7F2] rounded-2xl overflow-hidden text-[#1F3D2B] shadow-xs border border-[#4C6B3D]/15">
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
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================= */}
      {/* MODAL: ONBOARD / ADD DOCTOR MANUALLY                         */}
      {/* ============================================================= */}
      {isAddDoctorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-gray-200 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C89D4A] block">
                  Vaidya Credentials
                </span>
                <h3 className="text-lg font-serif font-bold text-gray-900">
                  Onboard & Verify Doctor Directly
                </h3>
              </div>
              <button
                onClick={() => setIsAddDoctorOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Haridasan Namboothiri"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@keralaayurvedics.com"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Council Reg. No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRA-10928"
                    value={newDoctor.registration_number}
                    onChange={(e) => setNewDoctor((p) => ({ ...p, registration_number: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Degree *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BAMS, MD (Ayur)"
                    value={newDoctor.degree}
                    onChange={(e) => setNewDoctor((p) => ({ ...p, degree: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Specialization *
                  </label>
                  <select
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor((p) => ({ ...p, specialization: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  >
                    {AYURVEDIC_SPECIALIZATIONS.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newDoctor.years_experience}
                    onChange={(e) => setNewDoctor((p) => ({ ...p, years_experience: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Consultation Fee (₹) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={newDoctor.consultation_fee}
                    onChange={(e) => setNewDoctor((p) => ({ ...p, consultation_fee: parseInt(e.target.value) || 499 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Platform Cut %
                  </label>
                  <select
                    value={newDoctor.commission_rate}
                    onChange={(e) => setNewDoctor((p) => ({ ...p, commission_rate: parseFloat(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  >
                    <option value="0.10">10%</option>
                    <option value="0.15">15%</option>
                    <option value="0.20">20% (Standard)</option>
                    <option value="0.25">25%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                  Bio / Clinical Practice Note
                </label>
                <textarea
                  rows={2}
                  placeholder="Doctor's clinic background, lineage, or therapeutic specialties..."
                  value={newDoctor.bio}
                  onChange={(e) => setNewDoctor((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={doctorSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#16291E] text-[#C89D4A] hover:bg-[#1f382a] border border-[#C89D4A]/40 text-xs font-bold flex items-center gap-2"
                >
                  {doctorSubmitting ? "Onboarding..." : "Verify & Add Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CREATE OFFER / PROMO COUPON                           */}
      {/* ============================================================= */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-gray-200 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C89D4A] block">
                  Promotional Engine
                </span>
                <h3 className="text-lg font-serif font-bold text-gray-900">
                  Launch New Offer / Voucher
                </h3>
              </div>
              <button
                onClick={() => setIsAddCouponOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VEDIC20, FREEVAIDYA"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                  Campaign Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20% off classical formulations on orders over ₹999"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon((p) => ({ ...p, discount_type: e.target.value as DiscountType }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="FREE_CONSULTATION">Free Doctor Consultation</option>
                    <option value="FREE_SHIPPING">Free Express Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 15 or 499"
                    value={newCoupon.discount_value}
                    onChange={(e) => setNewCoupon((p) => ({ ...p, discount_value: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newCoupon.min_order_amount}
                    onChange={(e) => setNewCoupon((p) => ({ ...p, min_order_amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Applies To
                  </label>
                  <select
                    value={newCoupon.applies_to}
                    onChange={(e) => setNewCoupon((p) => ({ ...p, applies_to: e.target.value as CouponAppliesTo }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#C89D4A]"
                  >
                    <option value="PRODUCTS">Products Only</option>
                    <option value="CONSULTATION">Doctor Consultations Only</option>
                    <option value="BOTH">All (Products & Consultations)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={couponSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#16291E] text-[#C89D4A] hover:bg-[#1f382a] border border-[#C89D4A]/40 text-xs font-bold flex items-center gap-2"
                >
                  {couponSubmitting ? "Creating..." : "Publish Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
