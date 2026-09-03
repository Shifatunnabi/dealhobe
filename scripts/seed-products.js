/* Product catalog seed data.
   `cat` / `brand` are natural keys - the seeder swaps them for the real
   ObjectIds of the seeded taxonomy docs, because the storefront filters compare
   product.category against category._id (see ProductsPageClient). */

const PRODUCTS = [
  {
    sku: 'DH-1001', slug: 'rainbow-stacking-rings', name: 'Rainbow Stacking Rings',
    price: 1899, salePrice: 1299, qty: 42, cat: 'Educational', brand: 'Disney',
    image: '/products/1.png', sub: 'STEM Kits', featured: true, trending: true, newArrival: false, topSeller: true,
    short: 'Colourful stacking rings that build motor skills and introduce shapes, sizes and colours through play.',
    why: [
      'BPA-free, food-grade silicone - safe for mouthing',
      '8 rings in graduating sizes teach spatial reasoning',
      'Bold rainbow palette stimulates visual development',
      'Smooth rounded edges for complete safety',
      'Includes a travel-friendly mesh storage bag',
    ],
    desc: [
      'A timeless classic reimagined with premium materials and vibrant colours. Each of the eight rings is crafted from soft, food-grade silicone that is safe for babies who love to mouth their toys.',
      'The rings graduate smoothly in size, teaching spatial awareness and problem-solving with every stack, while the bold rainbow palette stimulates visual development through the first two years.',
    ],
  },
  {
    sku: 'DH-1002', slug: 'nebula-base-station', name: 'Nebula Base Station',
    price: 2499, salePrice: null, qty: 18, cat: 'Fun', brand: 'Funko',
    image: '/products/2.png', sub: 'Action Figures', featured: true, trending: true, newArrival: true, topSeller: false,
    short: 'A modular space station playset with light-up docking bays and three poseable crew figures.',
    why: [
      'Over 40 snap-fit modular parts',
      'Light-up docking bay with soft glow LEDs',
      'Three poseable astronaut figures included',
      'Connects with other sets in the Nebula range',
    ],
    desc: [
      'Build, rebuild and expand a deep-space outpost. The snap-fit panels let older children redesign the layout again and again without any tools.',
      'The docking bay lights up at the press of a button, and every module connects to the wider Nebula range for a collection that grows over time.',
    ],
  },
  {
    sku: 'DH-1003', slug: 'cosmic-glow-puzzle', name: 'Cosmic Glow Puzzle',
    price: 2200, salePrice: 1899, qty: 35, cat: 'Puzzles', brand: 'Lego',
    image: '/products/3.png', sub: 'Jigsaw Puzzles', featured: true, trending: false, newArrival: true, topSeller: false,
    short: '150-piece glow-in-the-dark solar system puzzle that turns into wall art after lights-out.',
    why: [
      '150 thick, easy-grip pieces',
      'Glows for up to 4 hours after light exposure',
      'Finished size 60 x 40 cm',
      'Printed on FSC-certified recycled board',
    ],
    desc: [
      'Every planet is printed with phosphorescent ink, so the finished solar system keeps shining long after bedtime.',
      'The chunky pieces suit hands still developing fine motor control, and the recycled board resists bending through many rebuilds.',
    ],
  },
  {
    sku: 'DH-1004', slug: 'aero-phantom-drone', name: 'Aero-Phantom Drone',
    price: 3299, salePrice: null, qty: 7, cat: 'Outdoor', brand: 'Hot Wheels',
    image: '/products/4.png', featured: false, trending: false, newArrival: true, topSeller: false,
    short: 'Beginner-friendly stunt drone with altitude hold, one-key return and 12 minutes of flight time.',
    why: [
      'Altitude hold keeps flight steady for new pilots',
      'One-key return brings it home instantly',
      '360-degree flips at the press of a button',
      'Two rechargeable batteries in the box',
    ],
    desc: [
      'Built for first-time pilots. Altitude hold does the hard work of staying level, so a beginner can concentrate on steering.',
      'Propeller guards and a one-key return button make outdoor sessions forgiving, and the second battery doubles airtime before a recharge.',
    ],
  },
  {
    sku: 'DH-1005', slug: 'lego-classic-set-250pcs', name: 'LEGO Classic Set 250pcs',
    price: 3499, salePrice: null, qty: 60, cat: 'Educational', brand: 'Lego',
    image: '/products/5.png', sub: 'Building Sets', featured: true, trending: true, newArrival: false, topSeller: true,
    short: '250 classic bricks in 29 colours with a starter idea booklet for open-ended building.',
    why: [
      '250 bricks across 29 colours',
      'Includes windows, wheels and door elements',
      'Idea booklet with 12 starter builds',
      'Compatible with every LEGO system set',
    ],
    desc: [
      'The set that never runs out of ideas. A broad mix of shapes and colours encourages children to invent rather than follow instructions.',
      'The included booklet offers twelve starting points, but the real value is everything a child builds after the booklet is set aside.',
    ],
  },
  {
    sku: 'DH-1006', slug: 'rc-racing-car-turbo', name: 'RC Racing Car Turbo',
    price: 3500, salePrice: 2799, qty: 24, cat: 'Outdoor', brand: 'Hot Wheels',
    image: '/products/6.png', featured: true, trending: true, newArrival: false, topSeller: false,
    short: '2.4GHz remote control racer hitting 20km/h with full-function drift steering.',
    why: [
      '2.4GHz control - race several cars at once',
      'Top speed of 20 km/h on smooth surfaces',
      'Rubber drift tyres included alongside grip tyres',
      'USB-C rechargeable battery pack',
    ],
    desc: [
      'A proper racer rather than a toy that rolls. The 2.4GHz radio lets several cars run side by side without interference.',
      'Swap the grip tyres for the supplied drift set and the same car slides through corners - two very different ways to play with one purchase.',
    ],
  },
  {
    sku: 'DH-1007', slug: 'magnetic-drawing-board', name: 'Magnetic Drawing Board',
    price: 1499, salePrice: null, qty: 55, cat: 'DIY', brand: 'Disney',
    image: '/products/7.png', sub: 'Drawing & Art', featured: false, trending: false, newArrival: false, topSeller: false,
    short: 'Mess-free magnetic doodle board with four stamps and a one-slide eraser.',
    why: [
      'No ink, no dust, nothing to spill',
      'Four shape stamps built into the frame',
      'One-slide eraser clears the whole board',
      'Attached stylus cannot get lost',
    ],
    desc: [
      'Endless drawing without a single marker stain. The magnetic surface responds to the tethered stylus and wipes clean with one slide of the eraser bar.',
      'Light enough for car journeys and waiting rooms, which is where most parents end up using it.',
    ],
  },
  {
    sku: 'DH-1008', slug: 'art-craft-creative-kit', name: 'Art and Craft Creative Kit',
    price: 1799, salePrice: null, qty: 38, cat: 'DIY', brand: 'Barbie',
    image: '/products/8.png', sub: 'Craft Kits', featured: true, trending: false, newArrival: true, topSeller: true,
    short: 'A 90-piece craft box of beads, felt, safety scissors and washable glue with 20 project cards.',
    why: [
      '90 pieces across 12 craft materials',
      '20 illustrated project cards',
      'Non-toxic, washable glue and paints',
      'Sturdy carry case doubles as storage',
    ],
    desc: [
      'Everything for an afternoon of making, gathered in one carry case so nothing goes missing between sessions.',
      'The project cards scale from simple threading for younger children to multi-step collage work for those who have done it all before.',
    ],
  },
  {
    sku: 'DH-1009', slug: 'barbie-dreamhouse-playset', name: 'Barbie Dreamhouse Playset',
    price: 5999, salePrice: 4999, qty: 12, cat: 'Fun', brand: 'Barbie',
    image: '/products/1.png', featured: true, trending: true, newArrival: false, topSeller: false,
    short: 'Three-storey dollhouse with working lift, 20 furniture pieces and a fold-out balcony.',
    why: [
      'Three storeys with a working lift',
      '20 pieces of snap-in furniture',
      'Folds shut for tidy storage',
      'Fits standard 30cm fashion dolls',
    ],
    desc: [
      'A dollhouse that survives daily play. The frame locks rigid when open and folds flat when it is time to reclaim the floor.',
      'Twenty furniture pieces snap into place so rooms can be rearranged as often as the story demands.',
    ],
  },
  {
    sku: 'DH-1010', slug: 'hot-wheels-ultimate-track-set', name: 'Hot Wheels Ultimate Track Set',
    price: 2299, salePrice: null, qty: 30, cat: 'Fun', brand: 'Hot Wheels',
    image: '/products/2.png', featured: false, trending: true, newArrival: false, topSeller: false,
    short: 'Six metres of connectable track with two loops, a booster and two die-cast cars.',
    why: [
      '6 metres of track in reconfigurable sections',
      'Two loops and a motorised booster',
      'Two die-cast cars included',
      'Connects to any orange-track set',
    ],
    desc: [
      'Six metres of track that can be laid out a different way every time, with a motorised booster keeping cars moving through both loops.',
      'Every section connects to the wider orange-track system, so existing sets fold straight into the layout.',
    ],
  },
  {
    sku: 'DH-1011', slug: 'princess-sofia-doll', name: 'Princess Sofia Doll',
    price: 1999, salePrice: 1599, qty: 9, cat: 'Soft Toys', brand: 'Disney',
    image: '/products/3.png', sub: 'Plush Dolls', featured: false, trending: false, newArrival: true, topSeller: false,
    short: '30cm poseable doll with brushable hair, a removable gown and a glitter tiara.',
    why: [
      'Fully poseable arms, legs and head',
      'Brushable hair with comb included',
      'Removable gown and slippers',
      'Glitter tiara that stays put',
    ],
    desc: [
      'A doll built for storytelling, with joints that hold a pose and a gown that comes off for dress-up without tearing.',
      'The hair is rooted densely enough to survive repeated brushing, which is usually the first thing to fail on dolls at this price.',
    ],
  },
  {
    sku: 'DH-1012', slug: 'funko-pop-batman', name: 'Funko Pop Batman',
    price: 899, salePrice: null, qty: 75, cat: 'Fun', brand: 'Funko',
    image: '/products/4.png', sub: 'Action Figures', featured: false, trending: true, newArrival: false, topSeller: true,
    short: 'Vinyl collectible figure standing 9cm tall in a window display box.',
    why: [
      'Officially licensed vinyl figure',
      'Stands 9 cm tall',
      'Collector-friendly window box',
      'Weighted base keeps it upright',
    ],
    desc: [
      'A pocket-sized collectible with the stylised proportions the range is known for, finished in matte vinyl.',
      'The window box is designed to be kept, so the figure displays equally well boxed or free.',
    ],
  },
  {
    sku: 'DH-1013', slug: 'lego-technic-supercar', name: 'Lego Technic Supercar',
    price: 6499, salePrice: null, qty: 6, cat: 'Educational', brand: 'Lego',
    image: '/products/5.png', sub: 'Building Sets', featured: true, trending: true, newArrival: false, topSeller: false,
    short: '580-piece Technic build with working steering, a V8 piston engine and scissor doors.',
    why: [
      '580 pieces with a working gearbox',
      'Functioning V8 piston engine',
      'Rack-and-pinion steering',
      'Scissor doors and a detailed cabin',
    ],
    desc: [
      'A serious build for older children, running roughly four hours from first bag to finished chassis.',
      'The working steering and piston engine make the mechanics visible - this is as much an engineering lesson as it is a model car.',
    ],
  },
  {
    sku: 'DH-1014', slug: 'frozen-elsa-singing-doll', name: 'Frozen Elsa Singing Doll',
    price: 1799, salePrice: null, qty: 21, cat: 'Soft Toys', brand: 'Disney',
    image: '/products/6.png', sub: 'Plush Dolls', featured: false, trending: false, newArrival: true, topSeller: false,
    short: 'Light-up singing doll performing the full chorus in a shimmering ice-blue gown.',
    why: [
      'Sings the full chorus at the press of a button',
      'Bodice lights up in time with the music',
      'Shimmer-weave gown with a sheer cape',
      'Batteries included',
    ],
    desc: [
      'Press the snowflake on the bodice and the doll performs the chorus while the dress lights in time with the melody.',
      'The gown uses a shimmer weave that catches light even when the doll is silent, and it comes off for dress-up play.',
    ],
  },
  {
    sku: 'DH-1015', slug: 'outdoor-adventure-explorer-kit', name: 'Outdoor Adventure Explorer Kit',
    price: 2799, salePrice: 2199, qty: 27, cat: 'Outdoor', brand: 'Barbie',
    image: '/products/7.png', sub: 'Explorer Gear', featured: true, trending: true, newArrival: false, topSeller: false,
    short: 'Field kit with 4x binoculars, compass, bug viewer, torch and a nature field guide.',
    why: [
      '4x magnification shockproof binoculars',
      'Liquid-filled compass that settles fast',
      'Bug viewer with a 3x lens lid',
      'Illustrated 32-page field guide',
    ],
    desc: [
      'A kit that gets children outside and gives them a reason to stay there - spotting, catching, identifying and logging what they find.',
      'The binoculars and compass are functional instruments rather than props, sturdy enough for real trips rather than garden play alone.',
    ],
  },
  {
    sku: 'DH-1016', slug: 'classic-100-piece-jigsaw', name: 'Classic 100-Piece Jigsaw',
    price: 899, salePrice: null, qty: 48, cat: 'Puzzles', brand: 'Funko',
    image: '/products/8.png', sub: 'Jigsaw Puzzles', featured: false, trending: false, newArrival: false, topSeller: true,
    short: '100 large-format pieces forming a bright animal-kingdom scene, with a poster guide.',
    why: [
      '100 large pieces sized for small hands',
      'Linen-finish print resists glare',
      'Full-size poster guide included',
      'Finished size 50 x 35 cm',
    ],
    desc: [
      'A first proper jigsaw. One hundred pieces is enough to feel like an achievement without becoming a week-long project.',
      'The linen finish cuts glare under lamplight, and the poster guide lets a child work independently.',
    ],
  },
];

/** Build the HTML description consumed by the product detail page (Tiptap output shape). */
function toHtml(p) {
  const paras = p.desc.map((d) => '<p>' + d + '</p>').join('');
  const items = p.why.map((w) => '<li>' + w + '</li>').join('');
  return paras + '<h3>What is in the box</h3><ul>' + items + '</ul>';
}

module.exports = { PRODUCTS, toHtml };
