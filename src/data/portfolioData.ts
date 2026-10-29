/*
  This is the only file you need to update as your portfolio grows.
  The room, dock, cards, modals, project filters, gallery, and profile all read from this data.
  Keep `isPlaceholder: true` on concepts that have not become published work yet.
*/

export type Achievement = {
  id: string;
  label: string;
  metric: string;
  supportingMetric?: string;
  title: string;
  detail: string;
  type: "achievement" | "current";
};

export type ProjectStatus = "In Progress" | "Research Phase" | "Prototype Ready" | "Published";
export type ProjectCategory =
  | "Mathematics & Algorithms"
  | "Systems & Code Experiments"
  | "Cybersecurity Learning"
  | "Artwork & Creative Media";

export type Project = {
  id: string;
  title: string;
  category: ProjectCategory;
  status: ProjectStatus;
  isPlaceholder: boolean;
  summary: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  notes?: string;
};

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

export type MainRoomImage = GalleryItem & {
  position: { x: number; y: number };
  frameWidth: number;
  frameHeight: number;
  maxWidth: number;
  maxHeight: number;
  rotation: number;
};

export const portfolioData = {
  person: {
    name: "Gaurav Khanchandani",
    monogram: "GK",
    portraitSrc: "/photos/gaurav-headshot.png",
    degree: "First-year BS Mathematics · IIT Madras",
    shortTitle: "Mathematics, systems, and things still being built.",
    // Replace this with your own 2–4 sentence statement before publishing.
    philosophy:
      "I'd rather understand things deeply, think independently, and build something meaningful than spend my life chasing someone else's definition of success.",
    locationLabel: "India",
    email: "gauravkhanchandani90@gmail.com",
    resumeUrl: "",
    socials: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/gaurav-khanchandani-622827413/" },
      { label: "GitHub", url: "https://github.com/grvxmccnt-svg" },
      { label: "Instagram", url: "https://www.instagram.com/gaurav_benzene/" }
    ] as Array<{ label: string; url: string }>
  },

  achievements: [
    {
      id: "isi-bmath",
      label: "ISI B.Math Entrance",
      metric: "AIR 32",
      supportingMetric: "EWS Rank 3",
      title: "Indian Statistical Institute B.Math entrance",
      detail: "All India Rank (AIR) 32 and EWS Rank 3.",
      type: "achievement"
    },
    {
      id: "olympiad",
      label: "Mathematical Olympiad Journey",
      metric: "Δ ≤ 7",
      title: "Near INMO qualification",
      detail:
        "Came within 7 marks of qualifying for INMO after only 1–2 weeks of preparation in a highly competitive region.",
      type: "achievement"
    },
    {
      id: "jee-advanced",
      label: "JEE Advanced",
      metric: "AIR 3,138",
      supportingMetric: "EWS Rank 360",
      title: "JEE Advanced rank",
      detail: "All India Rank (AIR) 3,138 and EWS Rank 360.",
      type: "achievement"
    },
    {
      id: "iitm",
      label: "Current Chapter",
      metric: "Year 1",
      title: "BS Mathematics · IIT Madras",
      detail: "First-year BS Mathematics undergraduate at IIT Madras.",
      type: "current"
    }
  ] satisfies Achievement[],

  projects: [] as Project[],

  // These images sit around the central portrait in the main room.
  mainRoomImages: [
    {
      id: "benzene-study",
      src: "/photos/benzene-study.png",
      alt: "Benzene molecular structure diagram.",
      caption: "Benzene study",
      position: { x: -5.42, y: 2.76 },
      frameWidth: 2.34,
      frameHeight: 1.76,
      maxWidth: 2.08,
      maxHeight: 1.52,
      rotation: -0.08
    },
    {
      id: "study-desk",
      src: "/photos/study-desk.jpg",
      alt: "Personal study desk with a laptop, books, and chair.",
      caption: "Study desk",
      position: { x: 5.32, y: 2.74 },
      frameWidth: 1.52,
      frameHeight: 2.22,
      maxWidth: 1.26,
      maxHeight: 1.98,
      rotation: 0.07
    },
    {
      id: "math-notes",
      src: "/photos/math-notes.jpg",
      alt: "Handwritten mathematics notes with a geography and motion calculation.",
      caption: "Notebook page",
      position: { x: 3.32, y: 1.63 },
      frameWidth: 1.36,
      frameHeight: 1.9,
      maxWidth: 1.12,
      maxHeight: 1.66,
      rotation: -0.06
    }
  ] as MainRoomImage[],

  gallery: [
    {
      id: "art-01",
      src: "/gallery/art-01.jpg",
      alt: "Abstract artwork of paths crossing a starry space with red and violet borders.",
      caption: "Orbit paths"
    },
    {
      id: "art-02",
      src: "/gallery/art-02.jpg",
      alt: "Illustrated tree with broad winding branches across a landscape.",
      caption: "Tree of life"
    },
    {
      id: "art-03",
      src: "/gallery/art-03.jpg",
      alt: "Colorful twilight landscape with a spiral sky, palm tree, and city.",
      caption: "Twilight spiral"
    },
    {
      id: "art-04",
      src: "/gallery/art-04.jpg",
      alt: "Illustrated long-haired warrior surrounded by a bright patterned scene.",
      caption: "Windborne warrior"
    },
    {
      id: "art-05",
      src: "/gallery/art-05.jpg",
      alt: "Canyon landscape with a small city beneath a red-orange sky.",
      caption: "Canyon city"
    },
    {
      id: "art-06",
      src: "/gallery/art-06.jpg",
      alt: "Colorful fan-art collage featuring Pokémon characters and a trainer.",
      caption: "Character collage"
    },
    {
      id: "art-07",
      src: "/gallery/art-07.jpg",
      alt: "Colored portrait illustration of Shiva holding a trident.",
      caption: "Shiva study"
    },
    {
      id: "art-08",
      src: "/gallery/art-08.jpg",
      alt: "Bright landscape with trees, a river, and pink blossoms.",
      caption: "Forest in bloom"
    },
    {
      id: "art-09",
      src: "/gallery/art-09.jpg",
      alt: "Painted portrait study of a young man wearing glasses.",
      caption: "Portrait study"
    },
    {
      id: "art-10",
      src: "/gallery/art-10.jpg",
      alt: "Mythological figure standing among purple serpents above a blue sea.",
      caption: "Cosmic myth"
    }
  ] as GalleryItem[],

  // The portrait is displayed on the main-room wall, outside the archive.
  photos: [] as GalleryItem[],

  futureNote:
    "This room is designed to change. New work, notes, photographs, and milestones can be added without changing the interface."
} as const;

export type PortfolioData = typeof portfolioData;
