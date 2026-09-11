import { getMediaUrl } from "@/lib/media";

export interface ProductRitual {
  id: string;
  name: string;
  sanskritName: string;
  category: "Skin Radiance" | "Hair Nourishment" | "Therapeutic Oils" | "Internal Elixirs" | "Stress & Sleep";
  tagline: string;
  description: string;
  volume: string;
  price: string;
  accentColor: string;
  videoPreviewUrl: string;
  posterImage: string;
  keyBotanicals: string[];
  doshaAffinity: "Vata" | "Pitta" | "Kapha" | "Tridoshic";
  ritualBenefit: string;
  usageMethod: string;
}

export const PRODUCT_RITUALS: ProductRitual[] = [
  {
    id: "kumkumadi-tailam",
    name: "Kumkumadi Miraculous Beauty Fluid",
    sanskritName: "कुंकुमादि तैलम्",
    category: "Skin Radiance",
    tagline: "Kashmiri Saffron & 26 Himalayan Botanicals",
    description: "Cold-infused over 72 hours with pure saffron stigmas, red sandalwood, and vetiver root to revive cellular luster.",
    volume: "30 ml / 1.0 fl oz",
    price: "$68",
    accentColor: "#C89D4A",
    videoPreviewUrl: "https://assets.mixkit.co/videos/preview/mixkit-liquid-oil-dripping-into-a-glass-bottle-41584-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1608248597359-009139f4ff89?q=80&w=1000&auto=format&fit=crop",
    keyBotanicals: ["Kashmiri Saffron", "Raktachandana", "Manjistha", "Goat Milk Decoction"],
    doshaAffinity: "Tridoshic",
    ritualBenefit: "Illuminates complexion, refines skin texture, reduces hyperpigmentation.",
    usageMethod: "Press 3-4 drops into damp skin every twilight before rest.",
  },
  {
    id: "bringadi-hair-oil",
    name: "Bhringadi Intensive Scalp & Root Nectar",
    sanskritName: "भृङ्गामलकादि तैलम्",
    category: "Hair Nourishment",
    tagline: "Wild Bhringraj, Amla & Organic Sesame Base",
    description: "An ancient Taila Paka Vidhi formulation cooked in copper vats to stimulate follicles, halt premature greying, and cool the crown.",
    volume: "100 ml / 3.4 fl oz",
    price: "$52",
    accentColor: "#4C6B3D",
    videoPreviewUrl: "https://assets.mixkit.co/videos/preview/mixkit-drop-of-essential-oil-falling-in-a-bottle-41577-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1000&auto=format&fit=crop",
    keyBotanicals: ["False Daisy (Bhringraj)", "Indian Gooseberry (Amla)", "Neem Leaves", "Coconut Milk"],
    doshaAffinity: "Pitta",
    ritualBenefit: "Accelerates hair thickness, soothes scalp inflammation, promotes deep meditative sleep.",
    usageMethod: "Massage warm oil into scalp in circular motions for 10 minutes prior to bathing.",
  },
  {
    id: "mahanarayan-tailam",
    name: "Mahanarayan Joint & Muscle Elixir",
    sanskritName: "महानारायण तैलम्",
    category: "Therapeutic Oils",
    tagline: "54 Botanical Synergy for Deep Musculoskeletal Relief",
    description: "Potent restorative oil designed for Abhyanga (self-massage) to lubricate joints, relieve stiffness, and restore boundless mobility.",
    volume: "200 ml / 6.8 fl oz",
    price: "$58",
    accentColor: "#C89D4A",
    videoPreviewUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-massaging-oil-into-a-customers-back-42060-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
    keyBotanicals: ["Bala Root", "Ashwagandha", "Shatavari", "Camphor Bark"],
    doshaAffinity: "Vata",
    ritualBenefit: "Releases deep structural tension, alleviates joint stiffness, pacifies agitated Vata.",
    usageMethod: "Warm between palms and vigorously massage along long bones and circular joints.",
  },
  {
    id: "chyawanprash-rasayana",
    name: "Maharishi Royal Amrit Rasayana",
    sanskritName: "च्यवनप्राश रसायन",
    category: "Internal Elixirs",
    tagline: "Wild Forest Honey, Organic Ghee & 48 Vital Herbs",
    description: "Bi-annual solar-matured vitalizing jam crafted according to Charaka Samhita to fortify Ojas (vital immunity) and mental clarity.",
    volume: "500 g / 17.6 oz",
    price: "$74",
    accentColor: "#8BA664",
    videoPreviewUrl: "https://assets.mixkit.co/videos/preview/mixkit-pouring-honey-from-a-wooden-spoon-into-a-jar-42048-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=1000&auto=format&fit=crop",
    keyBotanicals: ["Fresh Wild Amla", "Organic Clarified Ghee", "Raw Forest Honey", "Pippali"],
    doshaAffinity: "Tridoshic",
    ritualBenefit: "Enhances respiratory resilience, sharpens memory, nourishes all seven Dhatus (tissues).",
    usageMethod: "One golden teaspoon with warm organic A2 milk at sunrise.",
  },
  {
    id: "nidra-shanti-mist",
    name: "Nidra Shanti Pillow & Aura Elixir",
    sanskritName: "निद्रा शान्ति",
    category: "Stress & Sleep",
    tagline: "Night-Blooming Jasmine, Brahmi & Sacred Tulsi",
    description: "Hydro-distilled botanical mist formulated to calm an overactive mind and induce deep restorative alpha brainwave states.",
    volume: "100 ml / 3.4 fl oz",
    price: "$44",
    accentColor: "#1F3D2B",
    videoPreviewUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-spraying-mist-on-green-leaves-42055-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1512290900672-1f02e6b0933b?q=80&w=1000&auto=format&fit=crop",
    keyBotanicals: ["Mogra Jasmine", "Brahmi Hydrosol", "Krishna Tulsi", "Vetiver (Khus)"],
    doshaAffinity: "Vata",
    ritualBenefit: "Quells evening anxiety, eases mental chatter, restores circadian alignment.",
    usageMethod: "Mist 3 times over pillows, linen, and collarbones 15 minutes before sleep.",
  },
  {
    id: "kesha-kanthi-lepam",
    name: "Kesha Kanthi Silk Hair Mask",
    sanskritName: "केश कान्ति लेपम्",
    category: "Hair Nourishment",
    tagline: "Hibiscus Petals, Fenugreek Sprouts & Shikakai",
    description: "Nutritious herbal paste that coats each hair strand in natural conditioning saponins and amino acids for glassy luster.",
    volume: "200 g / 7.0 oz",
    price: "$48",
    accentColor: "#4C6B3D",
    videoPreviewUrl: "https://assets.mixkit.co/videos/preview/mixkit-mixing-a-green-paste-with-a-spatula-42052-large.mp4",
    posterImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop",
    keyBotanicals: ["Japa (Hibiscus)", "Methi (Fenugreek)", "Reetha", "Cold-Pressed Coconut Milk"],
    doshaAffinity: "Pitta",
    ritualBenefit: "Detangles without silicones, stops split ends, seals hydration into dry cuticles.",
    usageMethod: "Apply roots to ends on washed hair, leave for 20 minutes, rinse with tepid water.",
  }
];

export const VEDICS_LETTERS = [
  {
    letter: "V",
    name: "Vitality",
    sanskrit: "ओजस्",
    tagline: "Rejuvenating the Core Life Essence",
    description: "Ojas is the quintessential life energy that sustains vitality, cellular luster, and unbreakable natural immunity against environmental stressors.",
    icon: "Sparkles",
    logoSrc: "/v-logo.png",
    accentColor: "#D4AF37",
    cardBg: "#0F281A", // Signature Deep Emerald Forest (Kerala Vedics Logo)
    cardTextColor: "#FFFFFF",
    highlightStat: "100% Bio-available",
    image: "/products/vitality.png",
    videoSrc: getMediaUrl("/videos/vitality.mp4"),
    scenicImage: "/products/vitality.png",
    bgGradient: "from-[#FDF8F0] via-[#FAF3E7] to-[#F5E8D2]",
    badgeBg: "bg-[#C89D4A]/15 text-[#8C6418] border-[#C89D4A]/30",
    metrics: ["100% Bio-Active", "Ojas Rejuvenation", "Solar-Infused"],
  },
  {
    letter: "E",
    name: "Energy",
    sanskrit: "प्राण",
    tagline: "Unblocking Cellular Flow & Radiance",
    description: "Harnessing pure botanical prana through cold micro-extraction to ensure living plant intelligence enters directly into your cellular matrix.",
    icon: "Zap",
    logoSrc: "/e-logo.png",
    accentColor: "#8BA664",
    cardBg: "#173B26", // Herb Leaf Emerald
    cardTextColor: "#FFFFFF",
    highlightStat: "72h Slow Decoction",
    image: "/products/rudra-nobg.png",
    videoSrc: getMediaUrl("/videos/botanical-infusion.mp4"),
    scenicImage: "/products/rudra-tulasi.png",
    bgGradient: "from-[#F2FAF4] via-[#E8F6EC] to-[#D4EEDC]",
    badgeBg: "bg-[#4E8D56]/15 text-[#23602B] border-[#4E8D56]/30",
    metrics: ["5-Tulsi Synergy", "Micro-Distilled", "Pranic Velocity"],
  },
  {
    letter: "D",
    name: "Detox",
    sanskrit: "शोधन",
    tagline: "Purging Ama & Deep Metabolic Toxins",
    description: "Gentle yet unyielding purification of deep-seated metabolic waste, restoring sensory clarity and luminous natural skin tone.",
    icon: "Droplets",
    logoSrc: "/d-logo.png",
    accentColor: "#D4AF37",
    cardBg: "#122E1F", // Deep Ayurvedic Forest
    cardTextColor: "#FFFFFF",
    highlightStat: "Zero Chemical Fillers",
    image: "/products/arshana-nobg.png",
    videoSrc: getMediaUrl("/videos/vericose.mp4"),
    scenicImage: "/products/arshana-lehyam.png",
    bgGradient: "from-[#F0F9F8] via-[#E2F4F2] to-[#CEEDE9]",
    badgeBg: "bg-[#2F7E79]/15 text-[#1B5753] border-[#2F7E79]/30",
    metrics: ["Ama Flush", "Liver Harmonizing", "Zero Toxins"],
  },
  {
    letter: "I",
    name: "Inner Balance",
    sanskrit: "त्रिदोष",
    tagline: "Harmonizing Vata, Pitta & Kapha",
    description: "Every individual is a unique microcosm of elemental forces. Formulations engineered to self-regulate and stabilize your constitutional equilibrium.",
    icon: "Scale",
    logoSrc: "/i-logo.png",
    accentColor: "#E0BA6A",
    cardBg: "#224A32", // Vibrant Botanical Green
    cardTextColor: "#FFFFFF",
    highlightStat: "Adaptive Intelligence",
    image: "/products/brahmi-nobg.png",
    videoSrc: getMediaUrl("/videos/botanical-infusion.mp4"),
    scenicImage: "/products/brahmi.png",
    bgGradient: "from-[#FDF6EE] via-[#F8EDDE] to-[#EEDCC4]",
    badgeBg: "bg-[#C2833E]/15 text-[#86531E] border-[#C2833E]/30",
    metrics: ["Tridoshic Balance", "Mental Clarity", "Neuro-Protective"],
  },
  {
    letter: "C",
    name: "Care",
    sanskrit: "अनुग्रह",
    tagline: "Ethical Forest Harvesting & Reverence",
    description: "Honoring lunar cycles and tribal wildcrafting traditions across Kerala's Western Ghats to preserve biodiversity and soil micro-ecology.",
    icon: "HeartHandshake",
    logoSrc: "/c-logo.png",
    accentColor: "#8BA664",
    cardBg: "#1A3E2A", // Sahyadri Rainforest Green
    cardTextColor: "#FFFFFF",
    highlightStat: "Fair-Trade Sahyadri Collectives",
    image: "/products/freedom-nobg.png",
    videoSrc: getMediaUrl("/videos/feedon-animation.mp4"),
    scenicImage: "/products/freedom.png",
    bgGradient: "from-[#F3F9F4] via-[#E7F3E9] to-[#D2E7D6]",
    badgeBg: "bg-[#3F7553]/15 text-[#205133] border-[#3F7553]/30",
    metrics: ["Tribal Wildcrafted", "Lunar Calendared", "Soil-Positive"],
  },
  {
    letter: "S",
    name: "Strength",
    sanskrit: "बल",
    tagline: "Building Generational Longevity",
    description: "Strengthening musculoskeletal tone, joint resilience, and longevity through time-tested classical Rasayana science.",
    icon: "ShieldCheck",
    logoSrc: "/s-logo.png",
    accentColor: "#D4AF37",
    cardBg: "#0C2015", // Dark Heritage Forest Pine
    cardTextColor: "#FFFFFF",
    highlightStat: "GMP & AYUSH Certified",
    image: "/products/varicose-nobg.png",
    videoSrc: getMediaUrl("/videos/freedon.mp4"),
    scenicImage: "/products/varicose.png",
    bgGradient: "from-[#F5F7F5] via-[#E8ECE8] to-[#D5DDD5]",
    badgeBg: "bg-[#1F3D2B]/15 text-[#14281C] border-[#1F3D2B]/30",
    metrics: ["Bala Rasayana", "AYUSH Certified", "Deep Musculoskeletal"],
  }
];

export const CORE_PILLARS = [
  {
    title: "Ayurveda",
    sanskrit: "आयुर्वेद",
    subtitle: "Classical 5,000-Year Wisdom",
    description: "Authentic classical recipes strictly derived from the Charaka and Sushruta Samhita.",
    iconName: "Flame",
    color: "#C89D4A",
  },
  {
    title: "Wellness",
    sanskrit: "स्वाथ्यम्",
    subtitle: "Harmonious Mind-Body Union",
    description: "Preventative therapies that nurture neurological peace, vital sleep, and physical vigor.",
    iconName: "Heart",
    color: "#8BA664",
  },
  {
    title: "Nature",
    sanskrit: "प्रकृति",
    subtitle: "Sahyadri Rainforest Sourcing",
    description: "Hand-harvested botanicals from the biodiverse soil of the Western Ghats mountain range.",
    iconName: "Leaf",
    color: "#4C6B3D",
  },
  {
    title: "Purity",
    sanskrit: "शुद्धि",
    subtitle: "Zero Synthetic Adulteration",
    description: "Free from parabens, mineral oils, artificial fragrances, heavy metals, and animal testing.",
    iconName: "Droplet",
    color: "#C89D4A",
  },
  {
    title: "Herbs",
    sanskrit: "ओषधी",
    subtitle: "Whole Plant Potency",
    description: "Employing whole roots, barks, flowers, and leaves rather than isolated synthetic extracts.",
    iconName: "Sprout",
    color: "#8BA664",
  }
];

export const SOIL_TO_SELF_STAGES = [
  {
    step: "01",
    title: "The Sahyadri Wildcrafting",
    location: "Silent Valley & Wayanad, Kerala",
    description: "Our certified herbalists hand-harvest mature botanicals in rhythm with the lunar calendar, when medicinal plant sap and volatile oils peak in potency.",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop",
    metric: "100% Wildcrafted",
  },
  {
    step: "02",
    title: "Taila Paka Vidhi (Slow Decoction)",
    location: "Heritage Copper Vats, Thrissur",
    description: "Herbs are steeped into a potent Kashayam (decoction) and slowly simmered for 72 consecutive hours over wood fire until pure herbal essence integrates into cold-pressed sesame oil.",
    image: "https://images.unsplash.com/photo-1608248597359-009139f4ff89?q=80&w=1200&auto=format&fit=crop",
    metric: "72-Hour Simmer",
  },
  {
    step: "03",
    title: "Stone Mortar & Pestle Micro-Grinding",
    location: "Artisanal Botanical Atelier",
    description: "Precious metals and micro-botanicals like red sandalwood, saffron, and pearls undergo thousands of circular grinds in heavy granite Kalvam to reach micronized bioavailability.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop",
    metric: "Sub-Micron Particles",
  },
  {
    step: "04",
    title: "Miron Violet Glass Preservation",
    location: "Sterile Small-Batch Lab",
    description: "Every formulation is hand-poured into biophotonic glass containers that block harmful visible light while admitting nourishing UVA and infrared frequencies.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
    metric: "Zero Preservatives",
  }
];

export const TRUST_BADGES = [
  {
    name: "100% Natural Ingredients",
    label: "Pure Botanical Synergy",
    desc: "Single-source botanicals without chemical stabilizers or fillers.",
    icon: "Flower2"
  },
  {
    name: "Chemical & Paraben Free",
    label: "Clean Formulation",
    desc: "Tested rigorously for zero traces of heavy metals, pesticides, or toxins.",
    icon: "Sparkle"
  },
  {
    name: "Cruelty Free & Vegan",
    label: "Ahimsa Standard",
    desc: "Never tested on animals. Sourced with complete ecological reverence.",
    icon: "Heart"
  },
  {
    name: "Eco-Friendly Packaging",
    label: "Biodegradable & Recyclable",
    desc: "Miron glass, FSC kraft boxes, and zero plastic bubble mailers.",
    icon: "Recycle"
  }
];
