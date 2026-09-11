export interface LabExperiment {
  id: string;
  title: string;
  category: "All" | "Create" | "Develop" | "Explore" | "Learn";
  description: string;
  linkText: string;
  // Visual graphic elements to render inside the soft card preview box
  visualTheme: {
    bgGradient: string; // e.g. soft lavender, mint green, warm peach, soft blue, golden lemon
    headline: string;
    subtag?: string;
    avatarUrl?: string;
    badgePills?: string[];
    layoutType: "avatar-flow" | "document-insights" | "hypothesis-nodes" | "computational-code" | "personalize-interactive";
  };
}

export const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: "personalize-rituals",
    title: "Your Way",
    category: "Create",
    description: "Learning tool that transforms content into dynamic and engaging experience for you.",
    linkText: "Learn More",
    visualTheme: {
      bgGradient: "from-[#FDF4EA] via-[#FCE8D5] to-[#F8D7BA]",
      headline: "Personalize",
      subtag: "Grade 8",
      badgePills: ["Audio Overview", "Interactive Deck"],
      layoutType: "personalize-interactive",
    },
  },
  {
    id: "vantage-dosha",
    title: "Vantage",
    category: "Learn",
    description: "Develop and measure future-ready skills like collaboration, creativity, critical thinking via GenAI-simulated teamwork.",
    linkText: "Learn More",
    visualTheme: {
      bgGradient: "from-[#F0F4FF] via-[#E6EEFF] to-[#D9E6FF]",
      headline: "Have you got the skills?",
      subtag: "Collaboration · Creativity · Critical Thinking",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
      badgePills: ["Collaboration", "Creativity", "Critical Thinking"],
      layoutType: "avatar-flow",
    },
  },
  {
    id: "literature-insights",
    title: "Literature Insights",
    category: "Learn",
    description: "Literature tool to find papers, structure data tables, and create artifacts like reports, slide decks, and more.",
    linkText: "Learn More",
    visualTheme: {
      bgGradient: "from-[#FFF9E6] via-[#FFF3CC] to-[#FFEBB3]",
      headline: "Literature Insights",
      subtag: "Mind Map",
      badgePills: ["Gap Analysis", "Citations", "Literature Search", "Audio Overview"],
      layoutType: "document-insights",
    },
  },
  {
    id: "hypothesis-generation",
    title: "Hypothesis Generation",
    category: "Learn",
    description: "Multi-agent research tool simulating the scientific method to identify knowledge gaps and generate novel hypotheses.",
    linkText: "Learn More",
    visualTheme: {
      bgGradient: "from-[#EEFAF2] via-[#DCF6E5] to-[#C8F0D5]",
      headline: "Hypothesis Generation",
      subtag: "Create a run",
      badgePills: ["Preferences", "Focus Areas", "Research Challenge"],
      layoutType: "hypothesis-nodes",
    },
  },
  {
    id: "computational-discovery",
    title: "Computational Discovery",
    category: "Develop",
    description: "Agentic research engine that generates code variations to help discover models and accelerate iteration.",
    linkText: "Learn More",
    visualTheme: {
      bgGradient: "from-[#F0F6FF] via-[#E2EEFF] to-[#D4E5FF]",
      headline: "Computational Discovery",
      subtag: "Test run",
      badgePills: ["Additional Sources", "Initial Code", "Evaluation Requirements"],
      layoutType: "computational-code",
    },
  },
  {
    id: "botanical-synthesis",
    title: "Botanical Synthesis",
    category: "Explore",
    description: "Multi-botanical diagnostic model translating Charaka Samhita scriptures into bio-individual daily protocols.",
    linkText: "Learn More",
    visualTheme: {
      bgGradient: "from-[#F3F9F5] via-[#E3F2E9] to-[#D1EADC]",
      headline: "Sacred Formulations",
      subtag: "72h Decoction",
      badgePills: ["Sahyadri Canopy", "Copper Vats", "Miron Violet Glass"],
      layoutType: "hypothesis-nodes",
    },
  },
];
