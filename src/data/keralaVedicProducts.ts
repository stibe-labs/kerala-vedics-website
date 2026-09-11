export interface KeralaVedicProductCard {
  id: string;
  title: string;
  sanskrit: string;
  category: "All" | "Rasayana" | "Elixir" | "Herbal Drops" | "Therapeutic";
  description: string;
  image: string;          // Original photography with scene background (for selector cards)
  transparentImage: string; // Clean cutout without background (for center stage)
  linkText: string;
  tagline: string;
  volume: string;
  themeGradient: string;
  benefits: string[];
}

export const KERALA_VEDIC_CARDS: KeralaVedicProductCard[] = [
  {
    id: "arshana-lehyam",
    title: "Arshana Lehyam",
    sanskrit: "अर्शना अवलेह",
    category: "Rasayana",
    tagline: "Classical Digestive Rejuvenation & Colon Harmony",
    description: "An authentic classical Ayurvedic jam formulated with sacred medicinal herbs and forest honey to soothe mucosal lining, stimulate Agni, and purify the digestive tract.",
    image: "/products/arshana-lehyam.png",
    transparentImage: "/products/arshana-nobg.png",
    linkText: "Explore Formulation",
    volume: "500 g / 17.6 oz",
    themeGradient: "from-[#FDF4EA] via-[#FCE8D5] to-[#F8D7BA]",
    benefits: ["Soothes Agni", "Cleanses Colon", "100% Bio-Active"],
  },
  {
    id: "rudra-tulasi",
    title: "Rudra Tulasi Drops",
    sanskrit: "रुद्र तुलसी रस",
    category: "Herbal Drops",
    tagline: "Panchamrit 5-Tulsi Pure Botanical Extract",
    description: "Hydro-distilled concentrate of five sacred Tulsi species (Rama, Krishna, Vana, Shukla, and Bisva) to fortify respiratory immunity, clear sinuses, and elevate prana.",
    image: "/products/rudra-tulasi.png",
    transparentImage: "/products/rudra-nobg.png",
    linkText: "Explore Formulation",
    volume: "30 ml / 1.0 fl oz",
    themeGradient: "from-[#EEFAF2] via-[#DCF6E5] to-[#C8F0D5]",
    benefits: ["Immunity Shield", "Pranic Vitality", "5-Tulsi Synergy"],
  },
  {
    id: "freedom-joint-care",
    title: "Freedom Joint Care",
    sanskrit: "सन्धि मुक्ति तैल",
    category: "Therapeutic",
    tagline: "54 Botanical Synergy for Deep Musculoskeletal Ease",
    description: "Cold-infused restorative Ayurvedic formulation designed to deeply lubricate articular cartilage, relieve chronic joint stiffness, and restore free mobility.",
    image: "/products/freedom.png",
    transparentImage: "/products/freedom-nobg.png",
    linkText: "Explore Formulation",
    volume: "200 ml / 6.8 fl oz",
    themeGradient: "from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD]",
    benefits: ["Lubricates Cartilage", "Pacifies Vata", "72h Decoction"],
  },
  {
    id: "brahmi-memory-nectar",
    title: "Brahmi Medhya Rasayana",
    sanskrit: "ब्राह्मी रसायन",
    category: "Elixir",
    tagline: "Neurological Clarity, Cognitive Focus & Deep Sleep",
    description: "Sustained-release cognitive elixir infused with wild Brahmi, Shankhpushpi, and Gotu Kola to soothe neurological stress and enhance memory retention.",
    image: "/products/brahmi.png",
    transparentImage: "/products/brahmi-nobg.png",
    linkText: "Explore Formulation",
    volume: "100 ml / 3.4 fl oz",
    themeGradient: "from-[#F3F0FF] via-[#ECE5FF] to-[#E2D6FF]",
    benefits: ["Sharpens Intellect", "Deep REM Sleep", "Charaka Formula"],
  },
  {
    id: "varicose-vein-elixir",
    title: "Varicose Circulation Care",
    sanskrit: "सिरा शुद्धि लेपम्",
    category: "Therapeutic",
    tagline: "Vascular Tonic for Venous Strength & Micro-Flow",
    description: "Traditional herbal blend targeting spider veins and sluggish venous return. Strengthens endothelial walls, reduces heaviness in calves, and cools vascular heat.",
    image: "/products/varicose.png",
    transparentImage: "/products/varicose-nobg.png",
    linkText: "Explore Formulation",
    volume: "100 g / 3.5 oz",
    themeGradient: "from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]",
    benefits: ["Venous Support", "Micro-Circulation", "Reduces Heaviness"],
  },
];
