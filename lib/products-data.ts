/* ─────────────────────────────────────────────────────────────────
   JoyToy — Shared Product Data
   Used by:  /app/products/page.tsx
             /app/product/[slug]/page.tsx
   ───────────────────────────────────────────────────────────────── */

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  badge: string | null;
  category: string;
  ageGroup: string;
  brand: string;
  stock: "in_stock" | "low_stock" | "out_of_stock";
  shortDescription: string;
  description: string;
  keyFeatures: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "rainbow-stacking-rings",
    name: "Rainbow Stacking Rings",
    price: 1299,
    originalPrice: 1899,
    image: "/products/1.png",
    badge: "Limited Edition",
    category: "DIY",
    ageGroup: "0-2",
    brand: "Disney",
    stock: "in_stock",
    shortDescription:
      "Colourful stacking rings that develop motor skills and introduce your child to shapes, sizes, and colours through play.",
    description:
      "Our Rainbow Stacking Rings are a timeless classic reimagined with premium materials and vibrant colours. Each of the eight rings is crafted from soft, BPA-free, food-grade silicone — safe for babies who love to mouth their toys. The rings graduate smoothly in size, teaching spatial awareness and problem-solving with every stack. The bold rainbow palette stimulates visual development in the first two years of life, while the smooth, rounded edges ensure complete safety. Includes a sturdy base spindle and a travel-friendly mesh bag.",
    keyFeatures: [
      "BPA-free, food-grade silicone — safe for mouthing",
      "8 rings in graduating sizes to teach spatial reasoning",
      "Bold rainbow palette stimulates visual development",
      "Smooth rounded edges for complete safety",
      "Includes travel-friendly mesh storage bag",
    ],
  },
  {
    id: "2",
    slug: "nebula-base-station",
    name: "Nebula Base Station",
    price: 2499,
    originalPrice: null,
    image: "/products/2.png",
    badge: null,
    category: "Fun",
    ageGroup: "10+",
    brand: "Funko",
    stock: "in_stock",
    shortDescription:
      "An interstellar command headquarters for your action figure universe, packed with lights, sounds, and secret compartments.",
    description:
      "Take your action figure collection to the next level with the Nebula Base Station. This jaw-dropping playset features LED runway lights, three launch bays, a retractable command tower, and built-in sound effects including countdown sequences and rocket ignition. Compatible with most 3.75-inch scale figures. Hidden compartments store accessories, and the entire structure folds flat for easy storage. Batteries included. Ages 10 and above.",
    keyFeatures: [
      "LED runway lights and 3 launch bays",
      "Built-in countdown and rocket-ignition sound effects",
      "Compatible with 3.75-inch scale figures",
      "Hidden compartments for storing accessories",
      "Folds flat for easy storage",
    ],
  },
  {
    id: "3",
    slug: "cosmic-glow-puzzle",
    name: "Cosmic Glow Puzzle",
    price: 1899,
    originalPrice: 2200,
    image: "/products/3.png",
    badge: "New Arrival",
    category: "Educational",
    ageGroup: "6-9",
    brand: "Lego",
    stock: "in_stock",
    shortDescription:
      "A 200-piece glow-in-the-dark space puzzle that transforms into a stunning night-sky display after dark.",
    description:
      "Explore the cosmos with our Cosmic Glow Puzzle. The 200 precision-cut pieces fit together to reveal a breathtaking galaxy scene that springs to life in the dark thanks to non-toxic phosphorescent ink. Made from recycled cardboard with a smooth matte surface for comfortable handling. Comes in a sturdy collector's box with a reference poster. Perfect for family puzzle nights and budding astronomers alike. Ages 6 and up.",
    keyFeatures: [
      "200 precision-cut pieces for a satisfying build",
      "Glow-in-the-dark phosphorescent ink — non-toxic",
      "Smooth matte surface for comfortable handling",
      "Comes with a full-size reference poster",
      "Made from recycled FSC-certified cardboard",
    ],
  },
  {
    id: "4",
    slug: "aero-phantom-drone",
    name: "Aero-Phantom Drone",
    price: 3299,
    originalPrice: null,
    image: "/products/4.png",
    badge: null,
    category: "Fun",
    ageGroup: "10+",
    brand: "Hot Wheels",
    stock: "low_stock",
    shortDescription:
      "A precision RC drone with altitude hold, 360° flips, and headless mode — perfect for beginner pilots.",
    description:
      "The Aero-Phantom Drone makes learning to fly easy and thrilling. One-key take-off and landing removes the complexity of manual control, while altitude-hold technology keeps the drone steady in the air so you can focus on flying. Pull off 360° barrel rolls with the press of a button, and use headless mode to fly in any direction without worrying about orientation. 15-minute flight time on a single charge. Includes two batteries, a USB charger, spare propellers, and a protective blade guard. Recommended for ages 10+.",
    keyFeatures: [
      "One-key take-off and landing for beginners",
      "Altitude-hold keeps drone steady mid-air",
      "360° barrel rolls with a single button",
      "15-minute flight time | charges via USB-C",
      "Includes 2 batteries and spare propellers",
    ],
  },
  {
    id: "5",
    slug: "lego-classic-set-250pcs",
    name: "LEGO Classic Set 250pcs",
    price: 3499,
    originalPrice: null,
    image: "/products/5.png",
    badge: "Best Seller",
    category: "Educational",
    ageGroup: "6-9",
    brand: "Lego",
    stock: "in_stock",
    shortDescription:
      "250 classic LEGO bricks in assorted colours — the perfect open-ended set for young builders with endless imagination.",
    description:
      "The LEGO Classic 250-piece set is the ultimate creative starter kit. Filled with a hand-picked assortment of bricks, plates, speciality pieces, and baseplates in 30+ colours, it gives young builders the freedom to create whatever their imagination conjures. All bricks are compatible with every LEGO set ever made. Includes building inspiration booklet with 12 guided projects. Safe for ages 6+. A perennial bestseller and the go-to gift for any occasion.",
    keyFeatures: [
      "250 bricks across 30+ colours in one set",
      "100% compatible with all LEGO bricks ever made",
      "Includes 12-project guided inspiration booklet",
      "Encourages open-ended creative play",
      "Perennial bestseller — perfect for any occasion",
    ],
  },
  {
    id: "6",
    slug: "rc-racing-car-turbo",
    name: "RC Racing Car Turbo",
    price: 2799,
    originalPrice: 3500,
    image: "/products/6.png",
    badge: null,
    category: "Fun",
    ageGroup: "6-9",
    brand: "Hot Wheels",
    stock: "in_stock",
    shortDescription:
      "Full-proportional RC racing car with 2.4 GHz control, rechargeable battery, and a top speed of 25 km/h.",
    description:
      "The RC Racing Car Turbo is built for speed. Powered by a high-torque brushed motor running on 2.4 GHz frequency, this racing car hits speeds up to 25 km/h on smooth surfaces. Four-wheel suspension absorbs bumps so you can race over rough terrain, while the all-wheel-drive system provides excellent grip. The rechargeable 7.4V LiPo battery provides 30 minutes of playtime per charge and recharges fully in 90 minutes via USB-C. Includes 2.4 GHz pistol-grip remote. Ages 6+.",
    keyFeatures: [
      "Top speed up to 25 km/h on smooth surfaces",
      "2.4 GHz frequency — no interference in multi-car races",
      "Four-wheel suspension for rough terrain",
      "30-min playtime | 90-min USB-C recharge",
      "Pistol-grip remote included",
    ],
  },
  {
    id: "7",
    slug: "magnetic-drawing-board",
    name: "Magnetic Drawing Board",
    price: 1499,
    originalPrice: null,
    image: "/products/7.png",
    badge: null,
    category: "Fun",
    ageGroup: "3-5",
    brand: "Disney",
    stock: "in_stock",
    shortDescription:
      "A mess-free magnetic drawing board with a Disney-themed frame — draw, erase, and start over endlessly.",
    description:
      "Let creativity flow freely with the Disney Magnetic Drawing Board. A smooth, pressure-sensitive surface responds to the included magnetic stylus and four shape stamps, creating clean, crisp lines every time. One slide of the erase bar wipes everything clean — no mess, no waste. The vibrant Disney-themed frame features familiar characters to inspire young artists. Lightweight enough for long car rides and aeroplane trips. No batteries needed. Ages 3 and up.",
    keyFeatures: [
      "Mess-free magnetic drawing — no ink or paint",
      "Includes stylus and 4 shape stamps",
      "One-slide erase bar clears the board instantly",
      "Disney character themed frame for extra inspiration",
      "No batteries required — always ready to play",
    ],
  },
  {
    id: "8",
    slug: "art-craft-creative-kit",
    name: "Art & Craft Creative Kit",
    price: 1799,
    originalPrice: null,
    image: "/products/8.png",
    badge: "Popular",
    category: "DIY",
    ageGroup: "3-5",
    brand: "Barbie",
    stock: "in_stock",
    shortDescription:
      "A 120-piece all-in-one craft kit with crayons, stickers, stencils, foam shapes, and a carrying case.",
    description:
      "Everything a young artist needs is packed into this Barbie Art & Craft Creative Kit. The hard-shell carrying case contains 24 wax crayons, 48 foam stickers, 20 stencils, 12 foam shapes, finger paints, a moulding clay set, and step-by-step project cards. All materials are non-toxic, washable, and ASTM-certified safe. The snap-close carry case keeps everything organised and portable. Ages 3 and up.",
    keyFeatures: [
      "120+ crafting pieces in one kit",
      "Includes crayons, stickers, stencils, finger paints & clay",
      "All materials non-toxic, washable, ASTM-certified",
      "Hard-shell carry case keeps everything organised",
      "Step-by-step project cards for guided creativity",
    ],
  },
  {
    id: "9",
    slug: "barbie-dreamhouse-playset",
    name: "Barbie Dreamhouse Playset",
    price: 4999,
    originalPrice: 5999,
    image: "/products/1.png",
    badge: "Best Seller",
    category: "Soft",
    ageGroup: "3-5",
    brand: "Barbie",
    stock: "in_stock",
    shortDescription:
      "A three-storey Barbie Dreamhouse with 8 rooms, a working elevator, lights, and pool — the ultimate playroom centrepiece.",
    description:
      "The iconic Barbie Dreamhouse returns bigger and better. This three-storey playset features 8 fully furnished rooms including a master bedroom, kitchen, living room, home office, and outdoor pool area. The working elevator carries dolls between floors while indoor LED lighting sets the mood. Over 70 accessories are included. The house assembles in minutes without tools and is compatible with all Barbie dolls. Ages 3 and up.",
    keyFeatures: [
      "Three-storey house with 8 fully furnished rooms",
      "Working elevator between floors",
      "Indoor LED mood lighting",
      "70+ accessories included",
      "Compatible with all Barbie dolls",
    ],
  },
  {
    id: "10",
    slug: "hot-wheels-ultimate-track-set",
    name: "Hot Wheels Ultimate Track Set",
    price: 2299,
    originalPrice: null,
    image: "/products/2.png",
    badge: null,
    category: "Fun",
    ageGroup: "3-5",
    brand: "Hot Wheels",
    stock: "in_stock",
    shortDescription:
      "A 6-metre loop track set with a power launcher, crash zone, and room for up to 4 cars racing at once.",
    description:
      "The Hot Wheels Ultimate Track Set delivers high-octane racing action at home. Over 6 metres of track snake through loops, corkscrews, and a vertical section before ending in a dramatic crash-test zone. The motorised power launcher propels cars at scale speeds, and the 4-lane split allows competitive multi-car races. Track snaps together in minutes and can be rearranged into dozens of configurations. Includes 2 exclusive Hot Wheels cars. Ages 3+.",
    keyFeatures: [
      "6+ metres of track with loops and corkscrews",
      "Motorised power launcher for max speed",
      "4-lane split for multi-car racing",
      "Connects in dozens of different configurations",
      "Includes 2 exclusive Hot Wheels cars",
    ],
  },
  {
    id: "11",
    slug: "princess-sofia-doll",
    name: "Princess Sofia Doll",
    price: 1599,
    originalPrice: 1999,
    image: "/products/3.png",
    badge: null,
    category: "Soft",
    ageGroup: "3-5",
    brand: "Disney",
    stock: "low_stock",
    shortDescription:
      "Authentically dressed 30 cm Princess Sofia doll with 5 outfit changes and her magical amulet accessory.",
    description:
      "Bring the magic of Enchancia home with our officially licensed Princess Sofia doll. Standing 30 cm tall, Sofia is dressed in her iconic lavender ball gown with hand-stitched embroidery and satin trim. The set includes 4 additional outfit changes and Sofia's iconic magical amulet necklace. Doll stands without support and has articulated arms and legs for expressive poses. All clothing is easy to put on and remove with little hands. Ages 3+.",
    keyFeatures: [
      "30 cm officially licensed Princess Sofia doll",
      "Iconic lavender ball gown with satin trim",
      "5 outfit changes including the magical amulet",
      "Articulated arms and legs for expressive poses",
      "Stands without support — no stand required",
    ],
  },
  {
    id: "12",
    slug: "funko-pop-batman",
    name: "Funko Pop Batman",
    price: 899,
    originalPrice: null,
    image: "/products/4.png",
    badge: "New",
    category: "Fun",
    ageGroup: "6-9",
    brand: "Funko",
    stock: "in_stock",
    shortDescription:
      "Officially licensed Funko Pop vinyl figure of Batman in his iconic Dark Knight armour — a must-have for DC fans.",
    description:
      "Add the Dark Knight to your collection with this officially licensed Funko Pop Batman vinyl figure. Standing 9.5 cm tall in the signature Funko Pop style, this figure captures Batman's iconic armour with exquisite detail. Displayed on a branded nameplate stand and packed in the classic Funko Pop window-display box. Compatible with all Funko Pop display shelves. Ages 6+.",
    keyFeatures: [
      "9.5 cm officially licensed Funko Pop vinyl figure",
      "Exquisite Dark Knight armour detail",
      "Includes branded nameplate display stand",
      "Classic Funko Pop window-display box packaging",
      "Compatible with all Funko Pop display shelves",
    ],
  },
  {
    id: "13",
    slug: "lego-technic-supercar",
    name: "Lego Technic Supercar",
    price: 6499,
    originalPrice: null,
    image: "/products/5.png",
    badge: null,
    category: "Fun",
    ageGroup: "10+",
    brand: "Lego",
    stock: "in_stock",
    shortDescription:
      "A 1,500-piece LEGO Technic replica with working V8 engine, sequential gearbox, and all-wheel steering.",
    description:
      "Engineer your dream car in brick form with the LEGO Technic Supercar. This elite engineering challenge contains 1,500 precision parts that build into a fully functional scale model complete with a visible V8 piston engine, 7-speed sequential gearbox, all-wheel steering, independent suspension, and working spoiler. The finished model measures 34 cm long and looks stunning on display. Ages 12+ (accessible to dedicated builders from age 10).",
    keyFeatures: [
      "1,500 precision engineering pieces",
      "Visible working V8 piston engine",
      "7-speed sequential gearbox",
      "All-wheel steering and independent suspension",
      "Completed model measures 34 cm — stunning on display",
    ],
  },
  {
    id: "14",
    slug: "frozen-elsa-singing-doll",
    name: "Frozen Elsa Singing Doll",
    price: 1799,
    originalPrice: null,
    image: "/products/6.png",
    badge: "New",
    category: "Soft",
    ageGroup: "6-9",
    brand: "Disney",
    stock: "in_stock",
    shortDescription:
      "32 cm singing Elsa doll that plays 'Let It Go' in full — complete with light-up ice magic effects.",
    description:
      "The magic of Frozen is captured in this deluxe Elsa Singing Doll. At 32 cm tall, Elsa wears her signature sparkle gown with a flowing translucent cape. Press the snowflake icon on her necklace to hear her sing the full version of Let It Go while her dress lights up in cascading blue and white. The doll features show-accurate face paint and rooted hair styled in Elsa's iconic braid. Requires 3 AA batteries (included). Ages 3+.",
    keyFeatures: [
      "Sings full version of Let It Go at the press of a button",
      "Dress lights up in cascading blue and white",
      "Show-accurate face paint and rooted hair",
      "Iconic braid hairstyle as worn in the film",
      "3 AA batteries included — ready straight from the box",
    ],
  },
  {
    id: "15",
    slug: "outdoor-adventure-explorer-kit",
    name: "Outdoor Adventure Explorer Kit",
    price: 2199,
    originalPrice: 2799,
    image: "/products/7.png",
    badge: null,
    category: "DIY",
    ageGroup: "6-9",
    brand: "Barbie",
    stock: "in_stock",
    shortDescription:
      "A 14-piece outdoor explorer kit with binoculars, compass, magnifying glass, bug catcher, and trail guide journal.",
    description:
      "Turn every outdoor trip into an adventure with the Explorer Kit. The 14-piece set includes high-power binoculars, a liquid-filled precision compass, a magnifying glass with LED light, an insect observation tube, reusable bug-catcher pot, specimen collection bags, a waterproof trail journal, and a field identification guide. All pieces are stored in a durable zip-up carry bag designed for rough outdoor conditions. Ages 6+.",
    keyFeatures: [
      "14-piece outdoor explorer set in one kit",
      "High-power binoculars and LED magnifying glass",
      "Liquid-filled precision compass",
      "Waterproof trail journal and field ID guide",
      "Durable zip-up carry bag for outdoor conditions",
    ],
  },
  {
    id: "16",
    slug: "classic-100-piece-jigsaw",
    name: "Classic 100-Piece Jigsaw",
    price: 899,
    originalPrice: null,
    image: "/products/8.png",
    badge: null,
    category: "Educational",
    ageGroup: "3-5",
    brand: "Funko",
    stock: "in_stock",
    shortDescription:
      "A vibrant 100-piece jigsaw featuring a colourful fantasy landscape — perfect for developing patience and focus.",
    description:
      "The Classic 100-Piece Jigsaw is the ideal introduction to puzzle building for children ages 3–5. The large, chunky pieces are easy to grip and feature a double-sided gloss finish that makes the 60 × 40 cm completed image pop. The whimsical fantasy landscape captures children's imagination while they practice problem-solving and spatial reasoning. All pieces are made from FSC-certified recycled cardboard. Stored in a sturdy tin that doubles as a display case. Ages 3+.",
    keyFeatures: [
      "100 large chunky pieces — easy for small hands to grip",
      "Double-sided gloss finish for vibrant colour",
      "Completed image: 60 × 40 cm fantasy landscape",
      "FSC-certified recycled cardboard",
      "Sturdy tin storage doubles as a display case",
    ],
  },
];
