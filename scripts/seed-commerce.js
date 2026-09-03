/* Blogs, offers, customers, reviews and order templates.
   Offers reference products by slug and customers by email; the seeder resolves
   both to ObjectIds. */

const BLOGS = [
  {
    title: 'Building a Skincare Routine That Actually Works',
    category: 'Skincare Tips',
    imageUrl: '/products/1814814_328.jpg',
    isFeatured: true,
    daysAgo: 2,
    body: [
      'Most skincare routines fail for the same reason: too many products, applied in the wrong order, changed too often to see what is actually working. A routine only needs three steps to be effective - cleanse, treat, moisturize - and a fourth, sunscreen, every single morning without exception.',
      'Introduce one new product at a time and give it two to three weeks before judging it. Skin turnover takes about 28 days, so a serum that looks like it is "doing nothing" in week one may just need more time, while a product that causes irritation will usually show it within days.',
      'Consistency beats complexity. A five-step routine followed every day will outperform a twelve-step routine followed twice a week.',
    ],
  },
  {
    title: 'Five Ingredients Worth Reading the Label For',
    category: 'Ingredients',
    imageUrl: '/products/1814829_343.jpg',
    isFeatured: true,
    daysAgo: 6,
    body: [
      'Niacinamide shows up in almost everything now, and for good reason - it calms redness, refines the look of pores, and plays well with nearly every other active, which makes it a safe first step into "actives" for beginners.',
      'Hyaluronic acid is a humectant, not a moisturizer on its own - it pulls water into the skin, so it works best applied to damp skin and sealed in with a cream, not applied to bone-dry skin where it can pull moisture out instead.',
      'Vitamin C, retinoids and SPF round out the list. Vitamin C brightens and protects against environmental damage during the day; retinoids do the heavy lifting overnight; and SPF is what actually protects the investment you have made in the other four.',
    ],
  },
  {
    title: 'Foundation Matching: Getting the Undertone Right',
    category: 'Makeup Guides',
    imageUrl: '/products/1883.jpg',
    isFeatured: false,
    daysAgo: 10,
    body: [
      'Shade matching goes wrong most often because of undertone, not depth. A foundation can be the right lightness and still look wrong if it leans too pink, yellow, or neutral against your skin.',
      'The simplest test does not involve your wrist - wrists are often a different tone than your face. Swatch two or three close shades along your jawline in daylight and pick the one that seems to disappear, rather than the one that looks best on the back of your hand.',
      'When in doubt between two shades, size down rather than up. A foundation that oxidizes slightly darker over the day is far less noticeable than one that stays visibly lighter than your neck.',
    ],
  },
  {
    title: 'The Truth About "Natural" and "Clean" Beauty Labels',
    category: 'Ingredients',
    imageUrl: '/products/4300975_18213.jpg',
    isFeatured: false,
    daysAgo: 15,
    body: [
      '"Natural" and "clean" are marketing terms, not regulated claims - there is no legal standard that defines what qualifies, which is why two products can both wear the label and have almost nothing in common on the ingredient list.',
      'Naturally derived does not automatically mean gentler, either. Several plant extracts and essential oils are more likely to cause irritation or sensitization than their lab-formulated counterparts, which are often designed specifically to be stable and low-irritant.',
      'The label worth trusting is the ingredient list itself, read in order of concentration, not the word printed across the front of the bottle.',
    ],
  },
  {
    title: "A Reviewer's Month With Vitamin C Serum",
    category: 'Product Reviews',
    imageUrl: '/products/6831392_27506.jpg',
    isFeatured: false,
    daysAgo: 20,
    body: [
      'We used a vitamin C serum every morning for four weeks under sunscreen, on skin that runs slightly dry and reactive in the colder months, to see whether the brightening claims held up outside a lab.',
      'Week one brought mild tingling on application and nothing visible. By week two the tingling had stopped and morning skin looked noticeably less dull. By week four, a handful of post-blemish marks had faded faster than they usually do unassisted.',
      'It did not work miracles, and it will not replace sunscreen or a good moisturizer - but as a five-minute addition to an existing routine, the brightening effect was real enough to keep it in daily rotation.',
    ],
  },
  {
    title: 'Makeup Storage That Actually Protects Your Products',
    category: 'Tips & Tricks',
    imageUrl: '/products/6831397_27511.jpg',
    isFeatured: false,
    daysAgo: 26,
    body: [
      'Heat, light and humidity are the three things that shorten a product\'s shelf life fastest, and a bathroom windowsill has all three. Store actives like vitamin C and retinoids in a cool, dark drawer rather than anywhere near direct sun or a hot shower.',
      'Keep brushes and sponges upright and separated so bristles keep their shape and nothing stays damp against another surface - damp, enclosed storage is exactly the environment bacteria need.',
      'Write the opening date on anything without a clear expiry, especially mascara and liquid liner. Most should be replaced every three to six months regardless of how much product is left in the tube.',
    ],
  },
  {
    title: "Sunscreen Myths That Won't Go Away",
    category: 'Skincare Tips',
    imageUrl: '/products/6831398_27512.jpg',
    isFeatured: false,
    daysAgo: 32,
    body: [
      'Cloudy days and indoor time are not exemptions - UVA rays pass through cloud cover and window glass, which is why sunscreen belongs in the routine every single day, not just at the beach.',
      'A higher SPF number is not a reason to apply less. Most people apply roughly half the amount used in official SPF testing, which quietly cuts the real-world protection of a "50" down closer to a "25".',
      'Darker skin tones still need sunscreen. Melanin offers some natural protection against sunburn, but it does not prevent UV-driven premature aging or block the skin cancer risk that comes with daily unprotected exposure.',
    ],
  },
  {
    title: 'Building a Five-Minute Everyday Makeup Look',
    category: 'Makeup Guides',
    imageUrl: '/products/7612.jpg',
    isFeatured: false,
    daysAgo: 38,
    body: [
      'A fast everyday look needs exactly four products: a tinted moisturizer or light foundation, cream blush, a neutral eyeshadow swept across the lid, and a tinted lip balm - anything more starts eating into the five minutes.',
      'Cream products are what make the timeline possible. They blend with fingertips in seconds, so there is no brush-cleaning delay and no harsh lines to soften.',
      'Do eyes before base. A little fallout under the eye is invisible on bare skin and easy to wipe away, but it is a genuine setback once foundation and concealer are already in place.',
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
