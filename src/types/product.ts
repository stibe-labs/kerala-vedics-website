export interface Product {
  id: string;
  slug: string;
  name: string;
  sanskrit_name?: string;
  category: "Skin Radiance" | "Hair Nourishment" | "Therapeutic Oils" | "Internal Elixirs" | "Stress & Sleep" | string;
  tagline: string;
  description: string;
  price: number;
  mrp: number;
  offer_price: number;
  stock_count: number;
  volume: string;
  poster_image: string;
  images?: string[];
  dosha_affinity: "Vata" | "Pitta" | "Kapha" | "Tridoshic";
  in_stock: number;
  rating?: number;
  review_count?: number;
  created_at?: string;
}

export interface AdminProductFormData {
  name: string;
  sanskrit_name: string;
  category: string;
  tagline: string;
  description: string;
  volume: string;
  mrp: number;
  offer_price: number;
  stock_count: number;
  poster_image: string;
  images: string;
  dosha_affinity: "Vata" | "Pitta" | "Kapha" | "Tridoshic";
}
