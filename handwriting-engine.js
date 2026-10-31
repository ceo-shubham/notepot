/**
 * NotePot Handwriting & Typography Engine
 * Verified Authentic Handwritten Fonts (Hindi Devanagari & Latin)
 */

export const HANDWRITTEN_FONTS = [
  // --- HINDI / DEVANAGARI SCRIPTS ---
  {
    id: "kalam",
    name: "Kalam (Devanagari)",
    family: "'Kalam', cursive",
    category: "hindi",
    tag: "Standard Devanagari",
    defaultLineHeight: 36,
    sample: "नमस्ते! यह एक हस्तलिखित हिंदी असाइनमेंट है।"
  },
  {
    id: "tillana",
    name: "Tillana (Devanagari Script)",
    family: "'Tillana', cursive",
    category: "hindi",
    tag: "Devanagari Script",
    defaultLineHeight: 36,
    sample: "विद्या ददाति विनयं, विनयाद् याति पात्रताम्।"
  },
  {
    id: "dekko",
    name: "Dekko (Devanagari Notes)",
    family: "'Dekko', cursive",
    category: "hindi",
    tag: "Devanagari Informal",
    defaultLineHeight: 36,
    sample: "कक्षा कार्य: हिंदी व्याकरण एवं निबंध लेखन।"
  },
  {
    id: "amita",
    name: "Amita (Devanagari Cursive)",
    family: "'Amita', cursive",
    category: "hindi",
    tag: "Devanagari Cursive",
    defaultLineHeight: 36,
    sample: "परिश्रम ही सफलता की सबसे बड़ी कुंजी है।"
  },
  {
    id: "yatra",
    name: "Yatra One (Devanagari Hand-Cut)",
    family: "'Yatra One', cursive",
    category: "hindi",
    tag: "Devanagari Hand-Cut",
    defaultLineHeight: 38,
    sample: "सत्यमेव जयते नानृतम्।"
  },
  {
    id: "rozha",
    name: "Rozha One (Devanagari Broad)",
    family: "'Rozha One', serif",
    category: "hindi",
    tag: "Devanagari Broad",
    defaultLineHeight: 38,
    sample: "सादा जीवन, उच्च विचार।"
  },
  {
    id: "kurale",
    name: "Kurale (Devanagari Classic)",
    family: "'Kurale', serif",
    category: "hindi",
    tag: "Devanagari Classic",
    defaultLineHeight: 36,
    sample: "ज्ञान ही परम शक्ति है।"
  },
  {
    id: "sahitya",
    name: "Sahitya (Devanagari Text)",
    family: "'Sahitya', serif",
    category: "hindi",
    tag: "Devanagari Text",
    defaultLineHeight: 36,
    sample: "भारतीय संस्कृति एवं विरासत।"
  },
  {
    id: "halant",
    name: "Halant (Devanagari Clean)",
    family: "'Halant', serif",
    category: "hindi",
    tag: "Devanagari Clean",
    defaultLineHeight: 36,
    sample: "स्वच्छ भारत, स्वस्थ भारत।"
  },
  {
    id: "modak",
    name: "Modak (Devanagari Bold)",
    family: "'Modak', cursive",
    category: "hindi",
    tag: "Devanagari Bold",
    defaultLineHeight: 40,
    sample: "जय हिन्द! वन्दे मातरम्।"
  },

  // --- LATIN & UNIVERSAL HANDWRITING ---
  {
    id: "caveat",
    name: "Caveat (Modern Casual)",
    family: "'Caveat', cursive",
    category: "english",
    tag: "Casual",
    defaultLineHeight: 34,
    sample: "The quick brown fox jumps over the lazy dog."
  },
  {
    id: "indie-flower",
    name: "Indie Flower (Natural)",
    family: "'Indie Flower', cursive",
    category: "english",
    tag: "Natural",
    defaultLineHeight: 34,
    sample: "Assignment 3: Laboratory Experiments & Observations."
  },
  {
    id: "shadows-into-light",
    name: "Shadows Into Light (Neat Pen)",
    family: "'Shadows Into Light', cursive",
    category: "english",
    tag: "Neat",
    defaultLineHeight: 34,
    sample: "Physics Chapter 4: Laws of Motion & Thermodynamics."
  },
  {
    id: "dancing-script",
    name: "Dancing Script (Fluid Cursive)",
    family: "'Dancing Script', cursive",
    category: "english",
    tag: "Cursive",
    defaultLineHeight: 36,
    sample: "Dear Professor, please find attached my semester project."
  },
  {
    id: "patrick-hand",
    name: "Patrick Hand (Classroom)",
    family: "'Patrick Hand', cursive",
    category: "english",
    tag: "Classroom",
    defaultLineHeight: 34,
    sample: "Important Definition: Photosynthesis in green plants."
  },
  {
    id: "mali",
    name: "Mali (Informal)",
    family: "'Mali', cursive",
    category: "english",
    tag: "Informal",
    defaultLineHeight: 34,
    sample: "Mathematics: Integration by parts and differential formulas."
  },
  {
    id: "gochi-hand",
    name: "Gochi Hand (Ballpoint)",
    family: "'Gochi Hand', cursive",
    category: "english",
    tag: "Ballpoint",
    defaultLineHeight: 34,
    sample: "Organic Chemistry: Benzene rings and reaction mechanisms."
  },
  {
    id: "homemade-apple",
    name: "Homemade Apple (Vintage Cursive)",
    family: "'Homemade Apple', cursive",
    category: "english",
    tag: "Vintage",
    defaultLineHeight: 36,
    sample: "Historically documented notes from ancient philosophy."
  },
  {
    id: "reenie-beanie",
    name: "Reenie Beanie (Fine Tip)",
    family: "'Reenie Beanie', cursive",
    category: "english",
    tag: "Fine Tip",
    defaultLineHeight: 32,
    sample: "To-do list: Submit practical file before Friday morning."
  },
  {
    id: "bad-script",
    name: "Bad Script (Everyday)",
    family: "'Bad Script', cursive",
    category: "english",
    tag: "Everyday",
    defaultLineHeight: 34,
    sample: "Summary: The industrial revolution transformed global economies."
  },
  {
    id: "courgette",
    name: "Courgette (Fountain Pen)",
    family: "'Courgette', cursive",
    category: "english",
    tag: "Fountain Pen",
    defaultLineHeight: 36,
    sample: "Formal Report on System Architecture and Design."
  },
  {
    id: "covered-by-your-grace",
    name: "Covered By Your Grace (Tall Script)",
    family: "'Covered By Your Grace', cursive",
    category: "english",
    tag: "Tall Script",
    defaultLineHeight: 34,
    sample: "Biology Notes: Structure of DNA and double helix model."
  },
  {
    id: "just-another-hand",
    name: "Just Another Hand (Narrow Gel)",
    family: "'Just Another Hand', cursive",
    category: "english",
    tag: "Narrow Gel",
    defaultLineHeight: 32,
    sample: "Quick revision notes for upcoming board examination."
  },
  {
    id: "nothing-you-could-do",
    name: "Nothing You Could Do (Realistic Rapid)",
    family: "'Nothing You Could Do', cursive",
    category: "english",
    tag: "Rapid",
    defaultLineHeight: 34,
    sample: "Calculations for derivation problem 2."
  },
  {
    id: "schoolbell",
    name: "Schoolbell (Notebook Script)",
    family: "'Schoolbell', cursive",
    category: "english",
    tag: "Notebook",
    defaultLineHeight: 34,
    sample: "History Lesson 5: Architecture and structural design."
  },
  {
    id: "loved-by-the-king",
    name: "Loved by the King (Tall Casual)",
    family: "'Loved by the King', cursive",
    category: "english",
    tag: "Tall Casual",
    defaultLineHeight: 34,
    sample: "Economics: Supply and demand curves in open markets."
  },
  {
    id: "over-the-rainbow",
    name: "Over the Rainbow (Open Hand)",
    family: "'Over the Rainbow', cursive",
    category: "english",
    tag: "Open Hand",
    defaultLineHeight: 34,
    sample: "Computer Science: Data structures, trees and graphs."
  },
  {
    id: "sacramento",
    name: "Sacramento (Fine Cursive)",
    family: "'Sacramento', cursive",
    category: "english",
    tag: "Fine Cursive",
    defaultLineHeight: 38,
    sample: "Certificate of Completion and Acknowledgement."
  },
  {
    id: "great-vibes",
    name: "Great Vibes (Formal Calligraphy)",
    family: "'Great Vibes', cursive",
    category: "english",
    tag: "Formal Calligraphy",
    defaultLineHeight: 40,
    sample: "Executive Project Summary and Strategic Overview."
  },
  {
    id: "satisfy",
    name: "Satisfy (Gel Flow)",
    family: "'Satisfy', cursive",
    category: "english",
    tag: "Gel Flow",
    defaultLineHeight: 36,
    sample: "Environmental Studies: Renewable energy resources."
  },
  {
    id: "marck-script",
    name: "Marck Script (Quill)",
    family: "'Marck Script', cursive",
    category: "english",
    tag: "Quill",
    defaultLineHeight: 36,
    sample: "Literature review: Historical tragedies and sonnets."
  },
  {
    id: "gloria-hallelujah",
    name: "Gloria Hallelujah (Broad Nib)",
    family: "'Gloria Hallelujah', cursive",
    category: "english",
    tag: "Broad Nib",
    defaultLineHeight: 34,
    sample: "Key Points: Remember to highlight terminology in red pen."
  },
  {
    id: "permanent-marker",
    name: "Permanent Marker (Bold Felt)",
    family: "'Permanent Marker', cursive",
    category: "english",
    tag: "Felt Nib",
    defaultLineHeight: 36,
    sample: "SECTION A: OBJECTIVE QUESTIONS AND ANSWERS."
  },
  {
    id: "nanum-pen-script",
    name: "Nanum Pen Script (Fine Nib)",
    family: "'Nanum Pen Script', cursive",
    category: "english",
    tag: "Fine Nib",
    defaultLineHeight: 34,
    sample: "Chemistry Practical: Salt analysis and chemical titration."
  },
  {
    id: "yellowtail",
    name: "Yellowtail (Retro Script)",
    family: "'Yellowtail', cursive",
    category: "english",
    tag: "Retro Script",
    defaultLineHeight: 36,
    sample: "Creative Writing: The story of the ancient library."
  },
  {
    id: "alex-brush",
    name: "Alex Brush (Flourished Script)",
    family: "'Alex Brush', cursive",
    category: "english",
    tag: "Flourished",
    defaultLineHeight: 40,
    sample: "Dedicated to the department of academic excellence."
  },
  {
    id: "beth-ellen",
    name: "Beth Ellen (Manuscript Letter)",
    family: "'Beth Ellen', cursive",
    category: "english",
    tag: "Manuscript",
    defaultLineHeight: 36,
    sample: "Personal memoirs written with fond remembrance."
  },
  {
    id: "rock-salt",
    name: "Rock Salt (Scratch Nib)",
    family: "'Rock Salt', cursive",
    category: "english",
    tag: "Scratch Nib",
    defaultLineHeight: 36,
    sample: "NOTE: DO NOT WRITE IN THE LEFT MARGIN."
  }
];

export const INK_PRESETS = [
  { id: "ballpoint-blue", name: "Ballpoint Blue", hex: "#1e3a8a", shadow: "rgba(30, 58, 138, 0.20)" },
  { id: "royal-gel-blue", name: "Royal Gel Blue", hex: "#2563eb", shadow: "rgba(37, 99, 235, 0.20)" },
  { id: "pilot-navy", name: "Pilot Navy", hex: "#0f172a", shadow: "rgba(15, 23, 42, 0.20)" },
  { id: "gel-black", name: "Gel Black", hex: "#18181b", shadow: "rgba(24, 24, 27, 0.20)" },
  { id: "jet-black", name: "Fountain Black", hex: "#09090b", shadow: "rgba(9, 9, 11, 0.20)" },
  { id: "teacher-red", name: "Marking Red", hex: "#dc2626", shadow: "rgba(220, 38, 38, 0.20)" },
  { id: "emerald-green", name: "Scholar Green", hex: "#15803d", shadow: "rgba(21, 128, 61, 0.20)" },
  { id: "vintage-sepia", name: "Sepia Brown", hex: "#78350f", shadow: "rgba(120, 53, 15, 0.20)" },
  { id: "royal-violet", name: "Royal Violet", hex: "#6b21a8", shadow: "rgba(107, 33, 168, 0.20)" }
];

export const PAPER_TYPES = [
  {
    id: "hindi-notebook",
    name: "Hindi Ruled Notebook (Ruled Lines + Red Margin)",
    isLined: true,
    isHindi: true,
    lineHeightLocked: true,
    defaultLineSpacing: 36,
    description: "Standard single-line Hindi notebook with red left margin line and locked line height"
  },
  {
    id: "hindi-double-line",
    name: "Hindi Two-Line Notebook (Practice Guidelines)",
    isLined: true,
    isHindi: true,
    lineHeightLocked: true,
    defaultLineSpacing: 38,
    description: "Dual guideline Hindi practice notebook for Shirorekha hanging alignment"
  },
  {
    id: "white-ruled",
    name: "White Ruled A4 (Adjustable Line Height)",
    isLined: true,
    isHindi: false,
    lineHeightLocked: false,
    defaultLineSpacing: 34,
    description: "White A4 lined paper with user-adjustable line spacing (24px to 56px)"
  },
  {
    id: "white-plain",
    name: "White Plain A4 (Blank Sheet)",
    isLined: false,
    isHindi: false,
    lineHeightLocked: false,
    defaultLineSpacing: 32,
    description: "Standard blank white A4 sheet for freeform handwriting formatting"
  },
  {
    id: "math-grid",
    name: "Math & Graph Notebook (Square Grid)",
    isLined: true,
    isHindi: false,
    lineHeightLocked: false,
    defaultLineSpacing: 30,
    description: "Square grid paper for equations, tables, and scientific diagrams"
  },
  {
    id: "vintage-parchment",
    name: "Vintage Parchment (Warm Ruled)",
    isLined: true,
    isHindi: false,
    lineHeightLocked: false,
    defaultLineSpacing: 34,
    description: "Parchment tone paper with subtle ruled lines"
  }
];
