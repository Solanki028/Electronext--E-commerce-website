/**
 * Seed script: Creates 4 Appliance categories + 5 products each (20 total).
 * Run from terminal: node scripts/seedAppliances.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';

console.log('🔌 Connecting to MongoDB...');
await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected.');

const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image:       { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    parent:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive:    { type: Boolean, default: true },
    sortOrder:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true },
    slug:             { type: String, unique: true, lowercase: true, trim: true },
    description:      { type: String, required: true },
    shortDescription: { type: String, default: '' },
    price:            { type: Number, required: true },
    discountPercent:  { type: Number, default: 0 },
    category:         { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand:            { type: String, required: true },
    images:           [{ url: String, publicId: String, alt: String }],
    specifications:   [{ key: String, value: String, unit: String }],
    variants:         [{ name: String, value: String, priceModifier: Number, stock: Number, sku: String }],
    stock:            { type: Number, required: true, default: 0 },
    sku:              { type: String, required: true, unique: true },
    tags:             [String],
    isFeatured:       { type: Boolean, default: false },
    isActive:         { type: Boolean, default: true },
    averageRating:    { type: Number, default: 0 },
    reviewCount:      { type: Number, default: 0 },
    soldCount:        { type: Number, default: 0 },
    warranty:         { type: String, default: '' },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product  = mongoose.models.Product  || mongoose.model('Product',  productSchema);

const slug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const img = (seed, w = 600, h = 600) => ({ url: `https://picsum.photos/seed/${seed}/${w}/${h}`, publicId: `seed/${seed}`, alt: seed });

const CATEGORIES = [
  { name: 'Refrigerators', description: 'Smart, energy-efficient cooling solutions.', image: { url: '/images/appliances/cat_refrigerator_1773930919094.png' }, sortOrder: 6 },
  { name: 'Washing Machines', description: 'Advanced front and top load washers.', image: { url: '/images/appliances/cat_washing_machine_1773930936864.png' }, sortOrder: 7 },
  { name: 'Air Conditioners', description: 'Powerful split and window ACs for instant cooling.', image: { url: '/images/appliances/cat_ac_1773930956241.png' }, sortOrder: 8 },
  { name: 'Geysers', description: 'Instant and storage water heaters.', image: { url: '/images/appliances/cat_geyser_1773930976177.png' }, sortOrder: 9 },
];

const PRODUCTS_BY_CATEGORY = {
  Refrigerators: [
    {
      name: 'Samsung 580L French Door Smart Refrigerator', brand: 'Samsung', price: 85990, discountPercent: 15, stock: 20, isFeatured: true,
      shortDescription: 'Twin Cooling Plus, Water Dispenser, Digital Inverter.',
      description: 'Upgrade your kitchen with this premium French Door Refrigerator. Features Twin Cooling Plus to keep food fresher longer.',
      images: [img('samsung-fridge')], specifications: [{ key: 'Capacity', value: '580L' }], variants: [], tags: ['fridge', 'samsung']
    },
    {
      name: 'LG 687L Side-by-Side Refrigerator', brand: 'LG', price: 92990, discountPercent: 10, stock: 15, isFeatured: true,
      shortDescription: 'InstaView Door-in-Door, Hygiene Fresh+.',
      description: 'Knock twice to see inside without opening the door. Massive 687L capacity perfect for large families.',
      images: [img('lg-fridge')], specifications: [{ key: 'Capacity', value: '687L' }], variants: [], tags: ['fridge', 'lg']
    },
    {
      name: 'Whirlpool 340L Intellifresh Double Door', brand: 'Whirlpool', price: 35490, discountPercent: 18, stock: 35, isFeatured: false,
      shortDescription: 'Convertible 5-in-1, Adaptive Intelligence.',
      description: 'Smart convertible fridge that adapts to your cooling needs with 5 different modes.',
      images: [img('whirlpool-fridge')], specifications: [{ key: 'Capacity', value: '340L' }], variants: [], tags: ['fridge', 'whirlpool']
    },
    {
      name: 'Haier 328L Bottom Mounted Refrigerator', brand: 'Haier', price: 29990, discountPercent: 20, stock: 40, isFeatured: false,
      shortDescription: '8-in-1 Convertible, Twin Inverter Technology.',
      description: 'Innovative bottom-mounted design reduces bending. Twin inverter ensures energy efficiency.',
      images: [img('haier-fridge')], specifications: [{ key: 'Capacity', value: '328L' }], variants: [], tags: ['fridge', 'haier']
    },
    {
      name: 'Bosch 559L Serie 4 Double Door', brand: 'Bosch', price: 65990, discountPercent: 12, stock: 18, isFeatured: false,
      shortDescription: 'VarioInverter, VitaFresh.',
      description: 'German engineering guarantees durability. VitaFresh keeps fruits and vegetables crisp.',
      images: [img('bosch-fridge')], specifications: [{ key: 'Capacity', value: '559L' }], variants: [], tags: ['fridge', 'bosch']
    }
  ],
  'Washing Machines': [
    {
      name: 'LG 8.0 Kg Inverter Fully-Automatic Front Load', brand: 'LG', price: 34990, discountPercent: 22, stock: 25, isFeatured: true,
      shortDescription: 'AI Direct Drive, Steam Wash, ThinQ.',
      description: 'Intelligent AI DD detects fabric weight and softness to choose the optimal wash pattern.',
      images: [img('lg-washer')], specifications: [{ key: 'Capacity', value: '8.0 Kg' }], variants: [], tags: ['washing-machine', 'lg']
    },
    {
      name: 'Samsung 7.0 Kg Fully-Automatic Top Load', brand: 'Samsung', price: 17490, discountPercent: 15, stock: 45, isFeatured: false,
      shortDescription: 'Eco Bubble, Digital Inverter, Diamond Drum.',
      description: 'Powerful washing with Eco Bubble technology that turns detergent into bubbles to penetrate fabric quickly.',
      images: [img('samsung-washer-top')], specifications: [{ key: 'Capacity', value: '7.0 Kg' }], variants: [], tags: ['washing-machine', 'samsung']
    },
    {
      name: 'IFB 8.5 Kg 5 Star Front Load', brand: 'IFB', price: 38990, discountPercent: 10, stock: 20, isFeatured: true,
      shortDescription: 'Aqua Energie, Cradle Wash for Delicates.',
      description: 'Built for tough Indian stains. Features Aqua Energie to treat hard water and ensure a softer wash.',
      images: [img('ifb-washer')], specifications: [{ key: 'Capacity', value: '8.5 Kg' }], variants: [], tags: ['washing-machine', 'ifb']
    },
    {
      name: 'Whirlpool 7.5 Kg Fully-Automatic Top Load', brand: 'Whirlpool', price: 15990, discountPercent: 25, stock: 50, isFeatured: false,
      shortDescription: '360° Bloom Wash Pro, Inbuilt Heater.',
      description: 'Inbuilt heater eliminates 99.9% of germs and allergens from clothes while cleaning tough stains.',
      images: [img('whirlpool-washer')], specifications: [{ key: 'Capacity', value: '7.5 Kg' }], variants: [], tags: ['washing-machine', 'whirlpool']
    },
    {
      name: 'Bosch 7 Kg 5 Star Front Load', brand: 'Bosch', price: 29990, discountPercent: 18, stock: 30, isFeatured: false,
      shortDescription: 'Anti-Tangle, Anti-Vibration Design.',
      description: 'Whisper-quiet operation with Anti-Vibration side panels. Anti-Tangle feature protects delicate clothes.',
      images: [img('bosch-washer')], specifications: [{ key: 'Capacity', value: '7.0 Kg' }], variants: [], tags: ['washing-machine', 'bosch']
    }
  ],
  'Air Conditioners': [
    {
      name: 'Daikin 1.5 Ton 5 Star Inverter Split AC', brand: 'Daikin', price: 45490, discountPercent: 12, stock: 35, isFeatured: true,
      shortDescription: 'PM 2.5 Filter, Dew Clean Technology.',
      description: 'High-performance cooling with superior energy efficiency. Auto-cleaning tech keeps the indoor unit fresh.',
      images: [img('daikin-ac')], specifications: [{ key: 'Capacity', value: '1.5 Ton' }], variants: [], tags: ['ac', 'daikin']
    },
    {
      name: 'Voltas 1.5 Ton 3 Star Split AC', brand: 'Voltas', price: 32990, discountPercent: 20, stock: 60, isFeatured: false,
      shortDescription: 'Turbo Cooling, Active Dehumidifier.',
      description: 'Reliable cooling for extreme summers. Turbo mode provides instant cooling when you step indoors.',
      images: [img('voltas-ac')], specifications: [{ key: 'Capacity', value: '1.5 Ton' }], variants: [], tags: ['ac', 'voltas']
    },
    {
      name: 'LG 1.5 Ton 5 Star AI Dual Inverter AC', brand: 'LG', price: 46990, discountPercent: 15, stock: 28, isFeatured: true,
      shortDescription: 'Super Convertible 6-in-1, HD Filter with Anti-Virus Protection.',
      description: 'AI-driven dual inverter compressor adjusts cooling based on room conditions.',
      images: [img('lg-ac')], specifications: [{ key: 'Capacity', value: '1.5 Ton' }], variants: [], tags: ['ac', 'lg']
    },
    {
      name: 'Carrier 1.5 Ton 4 Star Flexicool AC', brand: 'Carrier', price: 38990, discountPercent: 18, stock: 40, isFeatured: false,
      shortDescription: 'Convertible 4-in-1, Insta Cool.',
      description: 'Flexicool technology lets you operate the AC at 4 different cooling capacities to save energy.',
      images: [img('carrier-ac')], specifications: [{ key: 'Capacity', value: '1.5 Ton' }], variants: [], tags: ['ac', 'carrier']
    },
    {
      name: 'Blue Star 1.0 Ton 3 Star Inverter Split AC', brand: 'Blue Star', price: 30990, discountPercent: 22, stock: 30, isFeatured: false,
      shortDescription: 'Turbo Cool, Eco Mode, Hidden Display.',
      description: 'Compact and efficient 1-ton AC ideal for small bedrooms. Hidden display ensures undisturbed sleep.',
      images: [img('bluestar-ac')], specifications: [{ key: 'Capacity', value: '1.0 Ton' }], variants: [], tags: ['ac', 'blue-star']
    }
  ],
  Geysers: [
    {
      name: 'AO Smith HSE-VAS-X-025 Storage 25 L', brand: 'AO Smith', price: 9290, discountPercent: 25, stock: 45, isFeatured: true,
      shortDescription: 'Blue Diamond Glass Lined Tank, 5 Star.',
      description: 'Long-lasting water heater with advanced Blue Diamond glass lining that prevents corrosion.',
      images: [img('aosmith-geyser')], specifications: [{ key: 'Capacity', value: '25 L' }], variants: [], tags: ['geyser', 'ao-smith']
    },
    {
      name: 'Bajaj New Shakti Neo 15L Metal Body', brand: 'Bajaj', price: 5990, discountPercent: 30, stock: 60, isFeatured: false,
      shortDescription: 'Titanium Armour Technology, Swirl Flow.',
      description: 'Compact metal body geyser with swirl flow technology for faster heating and energy savings.',
      images: [img('bajaj-geyser')], specifications: [{ key: 'Capacity', value: '15 L' }], variants: [], tags: ['geyser', 'bajaj']
    },
    {
      name: 'Crompton Arno Neo 15-L 5 Star', brand: 'Crompton', price: 6290, discountPercent: 28, stock: 55, isFeatured: false,
      shortDescription: 'Advanced 3 Level Safety, Anti-Rust.',
      description: 'Highly efficient 5-star rated water heater with a polymer coated tank for rust resistance.',
      images: [img('crompton-geyser')], specifications: [{ key: 'Capacity', value: '15 L' }], variants: [], tags: ['geyser', 'crompton']
    },
    {
      name: 'V-Guard Divino 5 Star Rated 15 L', brand: 'V-Guard', price: 6490, discountPercent: 20, stock: 48, isFeatured: false,
      shortDescription: 'Extra Thick PUF Insulation, Vitreous Enamel Coating.',
      description: 'Superior insulation ensures water stays hot for longer, reducing electricity consumption.',
      images: [img('vguard-geyser')], specifications: [{ key: 'Capacity', value: '15 L' }], variants: [], tags: ['geyser', 'v-guard']
    },
    {
      name: 'Havells Instanio 3-Litre Instant Geyser', brand: 'Havells', price: 3490, discountPercent: 35, stock: 80, isFeatured: true,
      shortDescription: 'Color Changing LED Ring, Fire Retardant.',
      description: 'Instant geyser perfect for kitchens and small bathrooms. LED ring changes color when hot water is ready.',
      images: [img('havells-geyser')], specifications: [{ key: 'Capacity', value: '3 L' }], variants: [], tags: ['geyser', 'havells']
    }
  ]
};

console.log('📦 Upserting appliance categories and products...\n');

let catCount = 0;
let prodCount = 0;

for (const catData of CATEGORIES) {
  const catSlug = slug(catData.name);
  
  // Upsert Category
  const category = await Category.findOneAndUpdate(
    { slug: catSlug },
    { ...catData, slug: catSlug },
    { new: true, upsert: true }
  );
  catCount++;
  console.log(`✅ Category: ${catData.name}`);

  const products = PRODUCTS_BY_CATEGORY[catData.name] || [];
  for (const prodData of products) {
    const prodSlug = slug(prodData.name);
    const topSku = prodSlug.replace(/-/g, '').toUpperCase().slice(0, 12);
    
    // Upsert Product relative to category
    await Product.findOneAndUpdate(
      { slug: prodSlug },
      { ...prodData, slug: prodSlug, sku: topSku, category: category._id },
      { upsert: true }
    );
    prodCount++;
  }
}

console.log(`\n🎉 Appliance Seed complete!`);
console.log(`   Categories : ${catCount}`);
console.log(`   Products   : ${prodCount}`);

await mongoose.disconnect();
process.exit(0);
