export interface GoogleLabCard {
  id: string;
  title: string;
  category: "All" | "Create" | "Develop" | "Explore" | "Learn";
  description: string;
  linkText: string;
  linkAction: string;
  theme: {
    bgGradient: string;
    type: "skills" | "literature" | "hypothesis" | "computational" | "learn-your-way" | "music-fx" | "image-fx";
  };
}

export const GOOGLE_LAB_CARDS: GoogleLabCard[] = [
  {
    id: "vantage",
    title: "Vantage",
    category: "Learn",
    description: "Develop and measure future-ready skills like collaboration, creativity, critical thinking via GenAI-simulated teamwork.",
    linkText: "Learn More",
    linkAction: "https://labs.google",
    theme: {
      bgGradient: "from-[#F3F0FF] via-[#ECE5FF] to-[#E2D6FF]",
      type: "skills",
    },
  },
  {
    id: "literature-insights",
    title: "Literature Insights",
    category: "Learn",
    description: "Literature tool to find papers, structure data tables, and create artifacts like reports, slide decks, and more.",
    linkText: "Learn More",
    linkAction: "https://labs.google",
    theme: {
      bgGradient: "from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]",
      type: "literature",
    },
  },
  {
    id: "hypothesis-generation",
    title: "Hypothesis Generation",
    category: "Learn",
    description: "Multi-agent research tool simulating the scientific method to identify knowledge gaps and generate novel hypotheses.",
    linkText: "Learn More",
    linkAction: "https://labs.google",
    theme: {
      bgGradient: "from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0]",
      type: "hypothesis",
    },
  },
  {
    id: "computational-discovery",
    title: "Computational Discovery",
    category: "Learn",
    description: "Agentic research engine that generates and scores code variations to help discover models and accelerate iteration.",
    linkText: "Learn More",
    linkAction: "https://labs.google",
    theme: {
      bgGradient: "from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD]",
      type: "computational",
    },
  },
  {
    id: "learn-your-way",
    title: "Learn Your Way",
    category: "Learn",
    description: "An AI learning tool that transforms content into a dynamic and engaging experience tailored for you.",
    linkText: "Try It Now",
    linkAction: "https://labs.google",
    theme: {
      bgGradient: "from-[#FFF7ED] via-[#FFEDD5] to-[#FED7AA]",
      type: "learn-your-way",
    },
  },
  {
    id: "music-fx",
    title: "MusicFX",
    category: "Create",
    description: "Generate original music loops and songs in any genre, mood, or instrument using generative AI.",
    linkText: "Try It Now",
    linkAction: "https://labs.google",
    theme: {
      bgGradient: "from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF]",
      type: "skills",
    },
  },
  {
    id: "image-fx",
    title: "ImageFX",
    category: "Create",
    description: "Create photorealistic images and visual concepts with expressive prompt-driven generative tools.",
    linkText: "Try It Now",
    linkAction: "https://labs.google",
    theme: {
      bgGradient: "from-[#ECFDF5] via-[#D1FAE5] to-[#A7F3D0]",
      type: "hypothesis",
    },
  },
  {
    id: "code-assist",
    title: "CodeFX Discovery",
    category: "Develop",
    description: "Explore cutting-edge generative workflows for rapid software engineering and API experimentation.",
    linkText: "Learn More",
    linkAction: "https://labs.google",
    theme: {
      bgGradient: "from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE]",
      type: "computational",
    },
  },
  {
    id: "deep-research",
    title: "Deep Research Matrix",
    category: "Explore",
    description: "Autonomous web search, document cross-referencing, and long-horizon multi-step analytical reasoning.",
    linkText: "Learn More",
    linkAction: "https://labs.google",
    theme: {
      bgGradient: "from-[#FEF2F2] via-[#FEE2E2] to-[#FECACA]",
      type: "literature",
    },
  },
];
