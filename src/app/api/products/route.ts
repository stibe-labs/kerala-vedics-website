import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { Product } from "@/types/product";

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "arshana-lehyam",
    slug: "arshana-lehyam",
    name: "Arshana Lehyam",
    sanskrit_name: "अर्शना अवलेह",
    category: "Rasayana",
    tagline: "Classical Digestive Rejuvenation & Colon Harmony",
    description: "An authentic classical Ayurvedic jam formulated with sacred medicinal herbs and forest honey to soothe mucosal lining, stimulate Agni, and purify the digestive tract.",
    price: 1250,
    mrp: 1550,
    offer_price: 1250,
    stock_count: 90,
    volume: "500 g / 17.6 oz",
    poster_image: "/products/arshana-lehyam.png",
    dosha_affinity: "Tridoshic",
    in_stock: 1,
    rating: 4.9,
    review_count: 142,
  },
  {
    id: "rudra-tulasi",
    slug: "rudra-tulasi",
    name: "Rudra Tulasi Drops",
    sanskrit_name: "रुद्र तुलसी रस",
    category: "Herbal Drops",
    tagline: "Panchamrit 5-Tulsi Pure Botanical Extract",
    description: "Hydro-distilled concentrate of five sacred Tulsi species (Rama, Krishna, Vana, Shukla, and Bisva) to fortify respiratory immunity, clear sinuses, and elevate prana.",
    price: 499,
    mrp: 650,
    offer_price: 499,
    stock_count: 120,
    volume: "30 ml / 1.0 fl oz",
    poster_image: "/products/rudra-tulasi.png",
    dosha_affinity: "Vata",
    in_stock: 1,
    rating: 4.9,
    review_count: 184,
  },
  {
    id: "freedom-joint-care",
    slug: "freedom-joint-care",
    name: "Freedom Joint Care Oil",
    sanskrit_name: "सन्धि मुक्ति तैल",
    category: "Therapeutic Oils",
    tagline: "54 Botanical Synergy for Deep Musculoskeletal Ease",
    description: "Cold-infused restorative Ayurvedic formulation designed to deeply lubricate articular cartilage, relieve chronic joint stiffness, and restore free mobility.",
    price: 990,
    mrp: 1290,
    offer_price: 990,
    stock_count: 65,
    volume: "200 ml / 6.8 fl oz",
    poster_image: "/products/freedom.png",
    dosha_affinity: "Vata",
    in_stock: 1,
    rating: 5.0,
    review_count: 96,
  },
  {
    id: "brahmi-memory-nectar",
    slug: "brahmi-memory-nectar",
    name: "Brahmi Medhya Rasayana",
    sanskrit_name: "ब्राह्मी रसायन",
    category: "Internal Elixirs",
    tagline: "Neurological Clarity, Cognitive Focus & Deep Sleep",
    description: "Sustained-release cognitive elixir infused with wild Brahmi, Shankhpushpi, and Gotu Kola to soothe neurological stress and enhance memory retention.",
    price: 1150,
    mrp: 1450,
    offer_price: 1150,
    stock_count: 85,
    volume: "100 ml / 3.4 fl oz",
    poster_image: "/products/brahmi.png",
    dosha_affinity: "Pitta",
    in_stock: 1,
    rating: 4.8,
    review_count: 112,
  },
  {
    id: "varicose-vein-elixir",
    slug: "varicose-vein-elixir",
    name: "Varicose Circulation Care",
    sanskrit_name: "सिरा शुद्धि लेपम्",
    category: "Therapeutic Oils",
    tagline: "Vascular Tonic for Venous Strength & Micro-Flow",
    description: "Traditional herbal blend targeting spider veins and sluggish venous return. Strengthens endothelial walls, reduces heaviness in calves, and cools vascular heat.",
    price: 890,
    mrp: 1100,
    offer_price: 890,
    stock_count: 70,
    volume: "100 g / 3.5 oz",
    poster_image: "/products/varicose.png",
    dosha_affinity: "Pitta",
    in_stock: 1,
    rating: 4.9,
    review_count: 78,
  }
];

// In-memory store for immediate fast updates
let serverProductsCache: Product[] = [...DEFAULT_PRODUCTS];

export async function GET() {
  try {
    const d1Results = await executeD1Query<Product>("SELECT * FROM products ORDER BY created_at DESC;");
    if (d1Results && d1Results.length > 0) {
      return NextResponse.json({ success: true, source: "cloudflare-d1", products: d1Results });
    }
  } catch (err) {
    console.warn("D1 query skipped/error, using memory cache:", err);
  }

  return NextResponse.json({ success: true, source: "memory-cache", products: serverProductsCache });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      slug,
      name,
      sanskrit_name,
      category,
      tagline,
      description,
      price,
      mrp,
      offer_price,
      stock_count,
      volume,
      poster_image,
      images,
      dosha_affinity,
      in_stock
    } = body;

    const newProd: Product = {
      id: id || `prod-${Date.now()}`,
      slug: slug || `prod-${Date.now()}`,
      name,
      sanskrit_name: sanskrit_name || "",
      category,
      tagline: tagline || "",
      description: description || "",
      price: Number(offer_price) || Number(price) || Number(mrp) || 0,
      mrp: Number(mrp) || 0,
      offer_price: Number(offer_price) || 0,
      stock_count: Number(stock_count) || 0,
      volume: volume || "",
      poster_image: poster_image || "https://images.unsplash.com/photo-1608248597359-009139f4ff89?q=80&w=1000&auto=format&fit=crop",
      images: Array.isArray(images) ? images : [],
      dosha_affinity: dosha_affinity || "Tridoshic",
      in_stock: Number(stock_count) > 0 ? 1 : 0,
      rating: 5.0,
      review_count: 0,
      created_at: new Date().toISOString()
    };

    // Attempt D1 insertion
    try {
      await executeD1Query(
        `INSERT OR REPLACE INTO products (id, slug, name, sanskrit_name, category, tagline, description, price, mrp, offer_price, stock_count, volume, poster_image, images, dosha_affinity, in_stock) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newProd.id,
          newProd.slug,
          newProd.name,
          newProd.sanskrit_name ?? null,
          newProd.category,
          newProd.tagline,
          newProd.description,
          newProd.price,
          newProd.mrp,
          newProd.offer_price,
          newProd.stock_count,
          newProd.volume,
          newProd.poster_image,
          JSON.stringify(newProd.images || []),
          newProd.dosha_affinity,
          newProd.in_stock
        ]
      );
    } catch (d1Err) {
      console.warn("Could not insert to remote D1 directly (token required for remote fetch):", d1Err);
    }

    // Update in-memory server cache
    const existingIndex = serverProductsCache.findIndex((p) => p.id === newProd.id);
    if (existingIndex >= 0) {
      serverProductsCache[existingIndex] = newProd;
    } else {
      serverProductsCache = [newProd, ...serverProductsCache];
    }

    return NextResponse.json({ success: true, product: newProd });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    try {
      await executeD1Query("DELETE FROM products WHERE id = ?", [id]);
    } catch (d1Err) {
      console.warn("Could not delete from D1:", d1Err);
    }

    serverProductsCache = serverProductsCache.filter((p) => p.id !== id);
    return NextResponse.json({ success: true, message: `Product ${id} deleted` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
