/* Blogs, offers, customers, reviews and order templates.
   Offers reference products by slug and customers by email; the seeder resolves
   both to ObjectIds. */

const BLOGS = [
  {
    title: 'How to Choose the Right Toy for Every Age',
    category: 'Parenting',
    imageUrl: '/hero/slide1.png',
    isFeatured: true,
    daysAgo: 3,
    body: [
      'The age label on a toy box is not marketing - it is a safety and development guideline. Under three, the main concern is choking: anything that fits through a toilet-roll tube is too small.',
      'From three to five, look for toys that reward repetition. Children at this stage learn by doing the same thing forty times, so a toy that only does one impressive thing tends to be abandoned in a week.',
      'Six and up is where construction sets, board games and craft kits come into their own. The sweet spot is a toy your child can nearly manage alone - just hard enough to need a second attempt.',
    ],
  },
  {
    title: 'Five Signs a Toy Is Actually Safe',
    category: 'Health & Safety',
    imageUrl: '/features/safe.png',
    isFeatured: true,
    daysAgo: 8,
    body: [
      'Start with the seams. A well-made soft toy has stitching you cannot pull apart with two fingers, and eyes that are moulded through rather than glued on.',
      'Check the battery compartment next. It should need a screwdriver to open. Button cells are one of the most common causes of serious injury in young children, and a screw is what stands between the two.',
      'Finally, give a new toy the smell test. A strong chemical odour usually means cheap PVC and phthalate softeners. Quality plastic toys smell of almost nothing.',
    ],
  },
  {
    title: 'Screen-Free Afternoons: 12 Ideas That Actually Work',
    category: 'Play & Development',
    imageUrl: '/products/8.png',
    isFeatured: false,
    daysAgo: 14,
    body: [
      'The trick is not banning screens - it is having a better option already set up. A craft box left open on the table gets used; the same box in a cupboard does not.',
      'Rotate what is visible each week. Blocks one week, art supplies the next, puzzles after that. Novelty does most of the work for you.',
      'Build in one shared activity a day, even fifteen minutes. Children who are given company at the start of an activity tend to keep going long after the adult leaves.',
    ],
  },
  {
    title: 'Building Sets and the Engineering Mindset',
    category: 'Education',
    imageUrl: '/products/5.png',
    isFeatured: false,
    daysAgo: 21,
    body: [
      'Construction toys teach a specific and unusually transferable skill: breaking a large goal into ordered steps. That is the whole of engineering in miniature.',
      'What matters is what happens after the instruction booklet. The free-build phase is where planning, estimating and revising get practised, so keep the bricks accessible once the model is done.',
      'Mixing sets from different ranges is a feature, not a problem. The constraint of incompatible parts forces genuinely creative solutions.',
    ],
  },
  {
    title: 'A Parent Review: Six Months With the Explorer Kit',
    category: 'Product Reviews',
    imageUrl: '/products/7.png',
    isFeatured: false,
    daysAgo: 30,
    body: [
      'We took the Outdoor Adventure Explorer Kit on eleven trips over six months, including two that involved rain and one that involved a river.',
      'The binoculars survived everything. The compass needed a day to settle after being dropped on concrete, but it still points north. The bug viewer lid cracked at month four.',
      'Overall it earned its place in the bag. The children reach for it unprompted, which is the only review metric that really counts.',
    ],
  },
  {
    title: 'Storage That Survives Real Children',
    category: 'Tips & Tricks',
    imageUrl: '/features/parent.png',
    isFeatured: false,
    daysAgo: 45,
    body: [
      'Open bins beat drawers and lids. If putting a toy away takes more than one motion, it will not happen.',
      'Group by activity rather than by type. Everything needed for drawing in one bin means a child can start and finish without help.',
      'Keep a small quarantine box for pieces without a home. Once a fortnight, ten minutes of matching restores most sets to completeness.',
    ],
  },
];

const OFFERS = [
  {
    title: 'Weekend Mega Deal',
    slug: 'weekend-mega-deal',
    discountType: 'percentage',
    discountAmount: 20,
    details: 'Twenty percent off a hand-picked selection of weekend favourites. Runs through Sunday midnight - no code needed, the price you see is the price you pay.',
    thumbnailUrl: '/offer/offer1.png',
    productSelection: 'selected',
    products: ['cosmic-glow-puzzle', 'lego-classic-set-250pcs', 'rc-racing-car-turbo'],
    isActive: true,
    endsInDays: 21,
  },
  {
    title: 'Birthday Gift Special',
    slug: 'birthday-gift-special',
    discountType: 'flat',
    discountAmount: 300,
    details: 'A flat 300 taka off our most reliable birthday-present picks - the toys that get opened first and played with longest.',
    thumbnailUrl: '/offer/offer3.png',
    productSelection: 'selected',
    products: ['rainbow-stacking-rings', 'art-craft-creative-kit', 'barbie-dreamhouse-playset'],
    isActive: true,
    endsInDays: 45,
  },
  {
    title: 'Creative Learning Bundle',
    slug: 'creative-learning-bundle',
    discountType: 'percentage',
    discountAmount: 15,
    details: 'Fifteen percent off hands-on kits that build skills through play. Ideal for school holidays and long weekends.',
    thumbnailUrl: '/offer/offer1.png',
    productSelection: 'selected',
    products: ['cosmic-glow-puzzle', 'lego-technic-supercar', 'outdoor-adventure-explorer-kit', 'classic-100-piece-jigsaw'],
    isActive: true,
    endsInDays: 60,
  },
  {
    title: 'Eid Flash Sale',
    slug: 'eid-flash-sale',
    discountType: 'percentage',
    discountAmount: 10,
    details: 'Ten percent off the entire catalogue for Eid. Already-discounted items keep whichever price is lower.',
    thumbnailUrl: '/offer/offer3.png',
    productSelection: 'all',
    products: [],
    isActive: false,
    endsInDays: -5,
  },
];

const CUSTOMERS = [
  {
    fullName: 'Nusrat Jahan', email: 'nusrat.jahan@example.com', phone: '01711000101',
    area: 'inside_dhaka', address: 'House 42, Road 11, Banani, Dhaka 1213',
  },
  {
    fullName: 'Tanvir Ahmed', email: 'tanvir.ahmed@example.com', phone: '01711000102',
    area: 'inside_dhaka', address: 'Flat 5B, 22 Lake Circus, Kalabagan, Dhaka 1205',
  },
  {
    fullName: 'Farhana Kabir', email: 'farhana.kabir@example.com', phone: '01711000103',
    area: 'outside_dhaka', address: '18 Zindabazar Main Road, Sylhet 3100',
  },
  {
    fullName: 'Sabbir Hossain', email: 'sabbir.hossain@example.com', phone: '01711000104',
    area: 'inside_dhaka', address: 'House 7, Sector 4, Uttara, Dhaka 1230',
  },
  {
    fullName: 'Mehjabin Chowdhury', email: 'mehjabin.chowdhury@example.com', phone: '01711000105',
    area: 'outside_dhaka', address: '91 CDA Avenue, Nasirabad, Chattogram 4000',
  },
  {
    fullName: 'Rakibul Islam', email: 'rakibul.islam@example.com', phone: '01711000106',
    area: 'inside_dhaka', address: 'House 210, Road 8, Dhanmondi, Dhaka 1209',
  },
];

/* Reviews reference a customer by email and a product by slug.
   The (productId, customerId) pair is uniquely indexed, so no duplicates here. */
const REVIEWS = [
  { email: 'nusrat.jahan@example.com', slug: 'rainbow-stacking-rings', rating: 5, approved: true, featured: true,
    text: 'My son was drawn to these from the first day. The silicone is genuinely soft, and after four months of daily chewing there is not a single mark on them.' },
  { email: 'tanvir.ahmed@example.com', slug: 'lego-classic-set-250pcs', rating: 5, approved: true, featured: true,
    text: 'Bought this hoping for an hour of quiet and got a whole weekend. Both children build together without arguing, which I did not expect.' },
  { email: 'farhana.kabir@example.com', slug: 'cosmic-glow-puzzle', rating: 4, approved: true, featured: true,
    text: 'The glow really does last most of the night. Pieces are thick and have survived being assembled at least a dozen times. Would have liked a slightly larger finished size.' },
  { email: 'mehjabin.chowdhury@example.com', slug: 'outdoor-adventure-explorer-kit', rating: 5, approved: true, featured: true,
    text: 'This got my daughter outdoors more than anything else we have tried. The binoculars are surprisingly good for the price.' },
  { email: 'sabbir.hossain@example.com', slug: 'rc-racing-car-turbo', rating: 5, approved: true, featured: false,
    text: 'Fast, well built, and the drift tyres make it a completely different car. Delivery to Uttara took two days.' },
  { email: 'rakibul.islam@example.com', slug: 'art-craft-creative-kit', rating: 4, approved: true, featured: false,
    text: 'Great variety in the box and the case keeps everything together. The glue runs out quickly if you are crafting often.' },
  { email: 'nusrat.jahan@example.com', slug: 'barbie-dreamhouse-playset', rating: 5, approved: true, featured: true,
    text: 'Larger than I expected and sturdy enough that it does not wobble when the lift is used. Folding it away is genuinely easy.' },
  { email: 'tanvir.ahmed@example.com', slug: 'lego-technic-supercar', rating: 5, approved: true, featured: false,
    text: 'Took my nephew and me a full afternoon. The working gearbox is the highlight - he kept opening the doors to show people.' },
  { email: 'farhana.kabir@example.com', slug: 'magnetic-drawing-board', rating: 4, approved: false, featured: false,
    text: 'Good for car trips. The stylus tether is a little short but it does the job and there is no mess to clean up.' },
  { email: 'mehjabin.chowdhury@example.com', slug: 'aero-phantom-drone', rating: 3, approved: false, featured: false,
    text: 'Flies well indoors but struggles in any real wind. Altitude hold works as advertised. Batteries charge slowly.' },
];

/* Orders. `daysAgo` spreads them across recent weeks so the sales report and
   dashboard charts have a trend to draw. Items reference products by slug. */
const ORDERS = [
  { email: 'nusrat.jahan@example.com', status: 'Delivered',  daysAgo: 38, items: [['rainbow-stacking-rings', 1], ['classic-100-piece-jigsaw', 2]] },
  { email: 'tanvir.ahmed@example.com', status: 'Delivered',  daysAgo: 33, items: [['lego-classic-set-250pcs', 1]] },
  { email: 'farhana.kabir@example.com', status: 'Delivered', daysAgo: 29, items: [['cosmic-glow-puzzle', 1], ['magnetic-drawing-board', 1]] },
  { email: null,                        status: 'Delivered', daysAgo: 26, items: [['funko-pop-batman', 3]],
    guest: { fullName: 'Imran Sheikh', phone: '01811000201', area: 'inside_dhaka', address: 'House 12, Road 3, Mohammadpur, Dhaka 1207' } },
  { email: 'sabbir.hossain@example.com', status: 'Delivered', daysAgo: 22, items: [['rc-racing-car-turbo', 1], ['hot-wheels-ultimate-track-set', 1]] },
  { email: 'mehjabin.chowdhury@example.com', status: 'Delivered', daysAgo: 19, items: [['outdoor-adventure-explorer-kit', 1]] },
  { email: 'rakibul.islam@example.com', status: 'Cancelled',  daysAgo: 17, items: [['lego-technic-supercar', 1]] },
  { email: 'nusrat.jahan@example.com', status: 'Delivered',   daysAgo: 14, items: [['barbie-dreamhouse-playset', 1], ['princess-sofia-doll', 1]] },
  { email: null,                        status: 'Shipped',    daysAgo: 9, items: [['art-craft-creative-kit', 2]],
    guest: { fullName: 'Shamima Akter', phone: '01811000202', area: 'outside_dhaka', address: '55 Station Road, Rajshahi 6100' } },
  { email: 'tanvir.ahmed@example.com', status: 'Shipped',     daysAgo: 6, items: [['frozen-elsa-singing-doll', 1], ['classic-100-piece-jigsaw', 1]] },
  { email: 'farhana.kabir@example.com', status: 'Processing', daysAgo: 4, items: [['nebula-base-station', 1]] },
  { email: 'sabbir.hossain@example.com', status: 'Cancelled', daysAgo: 3, items: [['aero-phantom-drone', 1]] },
  { email: 'mehjabin.chowdhury@example.com', status: 'Processing', daysAgo: 2, items: [['lego-classic-set-250pcs', 1], ['funko-pop-batman', 1]] },
  { email: 'rakibul.islam@example.com', status: 'Pending',    daysAgo: 1, items: [['magnetic-drawing-board', 1], ['art-craft-creative-kit', 1]] },
  { email: null,                        status: 'Pending',    daysAgo: 0, items: [['rainbow-stacking-rings', 1]],
    guest: { fullName: 'Kamrul Hasan', phone: '01811000203', area: 'inside_dhaka', address: 'Flat 3A, 9 Gulshan Avenue, Dhaka 1212' } },
];

function blogHtml(b) {
  return b.body.map((p) => '<p>' + p + '</p>').join('');
}

module.exports = { BLOGS, OFFERS, CUSTOMERS, REVIEWS, ORDERS, blogHtml };
