/**
 * Seed script: Creates 5 categories + 4 products each (20 total).
 * Run: node scripts/seedData.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';

// ─── Connect ────────────────────────────────────────────────────────────────
console.log('🔌 Connecting to MongoDB...');
await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected:', process.env.MONGODB_URI.split('@')[1]);

// ─── Inline schemas (avoids ESM import complications) ───────────────────────
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
const Product   = mongoose.models.Product  || mongoose.model('Product',  productSchema);

// ─── Helper ─────────────────────────────────────────────────────────────────
const slug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Picsum placeholder images (stable, free, no API key)
const img = (seed, w = 600, h = 600) => ({
  url:      `https://picsum.photos/seed/${seed}/${w}/${h}`,
  publicId: `seed/${seed}`,
  alt:      seed,
});

// ─── Category definitions ────────────────────────────────────────────────────
const CATEGORIES = [
  {
    name:        'Smartphones',
    description: 'Latest smartphones from top brands with cutting-edge features.',
    image:       img('smartphones', 400, 400),
    sortOrder:   1,
  },
  {
    name:        'Laptops',
    description: 'High-performance laptops for work, gaming, and creativity.',
    image:       img('laptops', 400, 400),
    sortOrder:   2,
  },
  {
    name:        'Headphones',
    description: 'Premium headphones and earbuds for the ultimate audio experience.',
    image:       img('headphones', 400, 400),
    sortOrder:   3,
  },
  {
    name:        'Smart TVs',
    description: '4K and OLED smart televisions with streaming and voice control.',
    image:       img('smarttv', 400, 400),
    sortOrder:   4,
  },
  {
    name:        'Cameras',
    description: 'DSLR, mirrorless, and action cameras for every photography need.',
    image:       img('cameras', 400, 400),
    sortOrder:   5,
  },
];

// ─── Product definitions ─────────────────────────────────────────────────────
const PRODUCTS_BY_CATEGORY = {
  Smartphones: [
    {
      name: 'Apple iPhone 15 Pro',
      brand: 'Apple',
      price: 134900,
      discountPercent: 5,
      stock: 45,
      isFeatured: true,
      warranty: '1 Year Apple Warranty',
      shortDescription: 'Titanium design, A17 Pro chip, 48MP camera system.',
      description: 'iPhone 15 Pro redefines what a smartphone can do. Forged from titanium — the same material used in spacecraft — it\'s incredibly strong and featherlight. The A17 Pro chip powers next-generation experiences. The 48MP main camera with 3× optical zoom brings every shot to life.',
      images: [img('iphone15pro'), img('iphone15pro-2'), img('apple-phone')],
      specifications: [
        { key: 'Chip', value: 'A17 Pro' },
        { key: 'Display', value: '6.1-inch Super Retina XDR' },
        { key: 'Camera', value: '48MP Main + 12MP Ultrawide + 12MP Telephoto' },
        { key: 'Battery', value: 'Up to 23 hours video playback' },
        { key: 'Storage', value: '128GB / 256GB / 512GB / 1TB' },
        { key: 'OS', value: 'iOS 17' },
      ],
      variants: [
        { name: 'Color', value: 'Natural Titanium', priceModifier: 0,     stock: 15, sku: 'IPH15P-NT-128' },
        { name: 'Color', value: 'Blue Titanium',    priceModifier: 0,     stock: 15, sku: 'IPH15P-BT-128' },
        { name: 'Color', value: 'Black Titanium',   priceModifier: 0,     stock: 15, sku: 'IPH15P-BLT-128' },
      ],
      tags: ['apple', 'iphone', '5g', 'flagship'],
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      brand: 'Samsung',
      price: 129999,
      discountPercent: 8,
      stock: 38,
      isFeatured: true,
      warranty: '1 Year Samsung Warranty',
      shortDescription: 'Built-in S Pen, 200MP camera, Snapdragon 8 Gen 3.',
      description: 'Samsung Galaxy S24 Ultra sets a new standard for mobile photography and productivity. The 200MP camera captures detail beyond what the eye can see. The integrated S Pen lets you write, draw, and annotate naturally. Galaxy AI features transform your daily tasks.',
      images: [img('galaxys24ultra'), img('samsung-phone'), img('samsung-ultra')],
      specifications: [
        { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
        { key: 'Display', value: '6.8-inch Dynamic AMOLED 2X, 120Hz' },
        { key: 'Camera', value: '200MP + 12MP + 10MP + 50MP' },
        { key: 'RAM', value: '12GB' },
        { key: 'Battery', value: '5000mAh, 45W Fast Charging' },
        { key: 'OS', value: 'Android 14' },
      ],
      variants: [
        { name: 'Storage', value: '256GB', priceModifier: 0,     stock: 20, sku: 'SGS24U-256' },
        { name: 'Storage', value: '512GB', priceModifier: 10000, stock: 10, sku: 'SGS24U-512' },
        { name: 'Storage', value: '1TB',   priceModifier: 20000, stock: 8,  sku: 'SGS24U-1TB' },
      ],
      tags: ['samsung', 'android', '5g', 's-pen'],
    },
    {
      name: 'OnePlus 12',
      brand: 'OnePlus',
      price: 64999,
      discountPercent: 10,
      stock: 55,
      isFeatured: false,
      warranty: '1 Year OnePlus Warranty',
      shortDescription: 'Snapdragon 8 Gen 3, 50MP Hasselblad camera, 100W SUPERVOOC.',
      description: 'OnePlus 12 combines flagship performance with industry-leading charging speed. Powered by Snapdragon 8 Gen 3 and co-engineered with Hasselblad, it delivers exceptional photography. The 100W SUPERVOOC charging gets you from 0 to 100% in just 26 minutes.',
      images: [img('oneplus12'), img('oneplus-phone'), img('oneplus-camera')],
      specifications: [
        { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
        { key: 'Display', value: '6.82-inch LTPO AMOLED, 120Hz' },
        { key: 'Camera', value: '50MP + 48MP + 64MP (Hasselblad)' },
        { key: 'RAM', value: '12GB / 16GB' },
        { key: 'Battery', value: '5400mAh, 100W SUPERVOOC' },
        { key: 'OS', value: 'OxygenOS 14' },
      ],
      variants: [
        { name: 'Color', value: 'Silky Black',  priceModifier: 0, stock: 25, sku: 'OP12-BLK-256' },
        { name: 'Color', value: 'Flowy Emerald', priceModifier: 0, stock: 30, sku: 'OP12-GRN-256' },
      ],
      tags: ['oneplus', 'flagship', 'fast-charging'],
    },
    {
      name: 'Google Pixel 8 Pro',
      brand: 'Google',
      price: 106999,
      discountPercent: 12,
      stock: 30,
      isFeatured: false,
      warranty: '3 Years Android Updates',
      shortDescription: 'Google Tensor G3, 7 years of updates, pro camera with AI.',
      description: 'Pixel 8 Pro is the most powerful and helpful Pixel yet. Google Tensor G3 brings new AI features to your phone, from photo editing to real-time translation. The pro camera system with Temperature Sensor captures what other phones can\'t.',
      images: [img('pixel8pro'), img('google-pixel'), img('pixel-camera')],
      specifications: [
        { key: 'Processor', value: 'Google Tensor G3' },
        { key: 'Display', value: '6.7-inch LTPO OLED, 1-120Hz' },
        { key: 'Camera', value: '50MP Wide + 48MP Ultra + 48MP Telephoto' },
        { key: 'RAM', value: '12GB' },
        { key: 'Battery', value: '5050mAh, 30W Wired + 23W Wireless' },
        { key: 'OS', value: 'Android 14' },
      ],
      variants: [
        { name: 'Color', value: 'Obsidian', priceModifier: 0, stock: 15, sku: 'PX8P-OBS-128' },
        { name: 'Color', value: 'Porcelain', priceModifier: 0, stock: 15, sku: 'PX8P-POR-128' },
      ],
      tags: ['google', 'pixel', 'ai', 'android'],
    },
  ],

  Laptops: [
    {
      name: 'Apple MacBook Pro 14" M3',
      brand: 'Apple',
      price: 168900,
      discountPercent: 4,
      stock: 25,
      isFeatured: true,
      warranty: '1 Year Apple Warranty',
      shortDescription: 'M3 chip, Liquid Retina XDR display, up to 18 hours battery.',
      description: 'MacBook Pro 14‑inch unleashes the full power of M3 with up to 36GB unified memory and the fastest GPU in any Mac. The Liquid Retina XDR display shines at 1000 nits sustained brightness. Outstanding battery life and a blazing-fast SSD round out the ultimate pro laptop.',
      images: [img('macbookpro'), img('apple-laptop'), img('macbook-keyboard')],
      specifications: [
        { key: 'Chip', value: 'Apple M3' },
        { key: 'Display', value: '14.2"  Liquid Retina XDR, 3024×1964' },
        { key: 'RAM', value: '8GB / 16GB / 36GB Unified Memory' },
        { key: 'Storage', value: '512GB / 1TB / 2TB SSD' },
        { key: 'Battery', value: 'Up to 18 hours' },
        { key: 'Ports', value: '3× Thunderbolt 4, HDMI, SD Card, MagSafe 3' },
      ],
      variants: [
        { name: 'RAM', value: '8GB',  priceModifier: 0,     stock: 10, sku: 'MBP14-M3-8' },
        { name: 'RAM', value: '16GB', priceModifier: 20000, stock: 10, sku: 'MBP14-M3-16' },
        { name: 'RAM', value: '36GB', priceModifier: 60000, stock: 5,  sku: 'MBP14-M3-36' },
      ],
      tags: ['apple', 'macbook', 'm3', 'professional'],
    },
    {
      name: 'Dell XPS 15 (2024)',
      brand: 'Dell',
      price: 149990,
      discountPercent: 7,
      stock: 18,
      isFeatured: true,
      warranty: '1 Year Dell Onsite Warranty',
      shortDescription: 'Intel Core Ultra 9, RTX 4060, stunning OLED display.',
      description: 'The Dell XPS 15 is a masterclass in thin-bezel design and premium performance. Powered by Intel Core Ultra 9 and NVIDIA RTX 4060, it blazes through creative workloads and gaming alike. The optional OLED 3.5K display is simply breathtaking.',
      images: [img('dellxps'), img('dell-laptop'), img('dell-xps-screen')],
      specifications: [
        { key: 'Processor', value: 'Intel Core Ultra 9 185H' },
        { key: 'GPU', value: 'NVIDIA GeForce RTX 4060 8GB' },
        { key: 'Display', value: '15.6" 3.5K OLED, 120Hz' },
        { key: 'RAM', value: '16GB / 32GB DDR5' },
        { key: 'Storage', value: '1TB NVMe SSD' },
        { key: 'Battery', value: '86Whr, 130W USB-C Charging' },
      ],
      variants: [
        { name: 'RAM', value: '16GB', priceModifier: 0,     stock: 10, sku: 'XPS15-16-1TB' },
        { name: 'RAM', value: '32GB', priceModifier: 15000, stock: 8,  sku: 'XPS15-32-1TB' },
      ],
      tags: ['dell', 'xps', 'gaming', 'oled'],
    },
    {
      name: 'Lenovo ThinkPad X1 Carbon Gen 12',
      brand: 'Lenovo',
      price: 159990,
      discountPercent: 6,
      stock: 15,
      isFeatured: false,
      warranty: '3 Year Lenovo Warranty',
      shortDescription: 'Ultra-light 1.12 kg, Intel Core Ultra 7, enterprise security.',
      description: 'ThinkPad X1 Carbon Gen 12 is the world\'s lightest 14-inch business laptop at just 1.12 kg. Intel Core Ultra 7 with Intel AI Boost delivers AI-powered productivity. MIL-SPEC tested durability, enterprise-grade security, and all-day battery make it the definitive business laptop.',
      images: [img('thinkpad'), img('lenovo-laptop'), img('thinkpad-open')],
      specifications: [
        { key: 'Processor', value: 'Intel Core Ultra 7 165U' },
        { key: 'Display', value: '14" 2.8K OLED, 120Hz, Touch' },
        { key: 'RAM', value: '16GB / 32GB LPDDR5' },
        { key: 'Storage', value: '512GB / 1TB NVMe SSD' },
        { key: 'Weight', value: '1.12 kg' },
        { key: 'Battery', value: '57Whr, Up to 15 hours' },
      ],
      variants: [
        { name: 'Storage', value: '512GB', priceModifier: 0,     stock: 8, sku: 'X1C12-512' },
        { name: 'Storage', value: '1TB',   priceModifier: 10000, stock: 7, sku: 'X1C12-1TB' },
      ],
      tags: ['lenovo', 'thinkpad', 'business', 'ultralight'],
    },
    {
      name: 'ASUS ROG Zephyrus G16',
      brand: 'ASUS',
      price: 174990,
      discountPercent: 9,
      stock: 12,
      isFeatured: false,
      warranty: '2 Year ASUS Warranty',
      shortDescription: 'AMD Ryzen 9, RTX 4080, stunning 240Hz QHD+ OLED display.',
      description: 'ROG Zephyrus G16 redefines gaming excellence with AMD Ryzen 9 8945HS and NVIDIA RTX 4080. The ultra-slim magnesium chassis hides a 16-inch 240Hz QHD+ OLED display that makes every game a visual masterpiece. Vapor chamber cooling keeps performance at its peak.',
      images: [img('roggaming'), img('asus-rog'), img('gaming-laptop')],
      specifications: [
        { key: 'Processor', value: 'AMD Ryzen 9 8945HS' },
        { key: 'GPU', value: 'NVIDIA GeForce RTX 4080 12GB' },
        { key: 'Display', value: '16" QHD+ OLED, 240Hz' },
        { key: 'RAM', value: '32GB DDR5' },
        { key: 'Storage', value: '1TB NVMe SSD' },
        { key: 'Battery', value: '90Whr, 240W Adapter' },
      ],
      variants: [
        { name: 'Color', value: 'Eclipse Gray',  priceModifier: 0, stock: 6, sku: 'ROG-G16-GRY' },
        { name: 'Color', value: 'Platinum White', priceModifier: 0, stock: 6, sku: 'ROG-G16-WHT' },
      ],
      tags: ['asus', 'rog', 'gaming', 'oled', 'amd'],
    },
  ],

  Headphones: [
    {
      name: 'Sony WH-1000XM5',
      brand: 'Sony',
      price: 29990,
      discountPercent: 15,
      stock: 80,
      isFeatured: true,
      warranty: '1 Year Sony Warranty',
      shortDescription: 'Industry-leading ANC, 30-hour battery, multipoint connection.',
      description: 'Sony WH-1000XM5 headphones lead the industry in noise canceling with two processors and eight microphones. 30mm drivers deliver exceptional sound quality. MultiPoint allows simultaneous connection to two devices. With up to 30 hours of battery life, these are the definitive wireless headphones.',
      images: [img('sonywh1000xm5'), img('sony-headphones'), img('sony-nc')],
      specifications: [
        { key: 'Driver', value: '40mm, Carbon Fibre Composite' },
        { key: 'ANC', value: '8 microphones, Dual Processor' },
        { key: 'Battery', value: '30 hours (ANC on), 3 min = 3 hours' },
        { key: 'Codec', value: 'LDAC, AAC, SBC' },
        { key: 'Frequency', value: '4 Hz – 40,000 Hz' },
        { key: 'Weight', value: '250g' },
      ],
      variants: [
        { name: 'Color', value: 'Black',  priceModifier: 0, stock: 40, sku: 'WH1000XM5-BLK' },
        { name: 'Color', value: 'Silver', priceModifier: 0, stock: 40, sku: 'WH1000XM5-SLV' },
      ],
      tags: ['sony', 'anc', 'wireless', 'premium'],
    },
    {
      name: 'Apple AirPods Pro (2nd Gen)',
      brand: 'Apple',
      price: 24900,
      discountPercent: 8,
      stock: 95,
      isFeatured: true,
      warranty: '1 Year Apple Warranty',
      shortDescription: 'H2 chip, Adaptive Audio, USB-C charging, 30hr total battery.',
      description: 'AirPods Pro (2nd generation) deliver up to 2× more ANC than the previous generation. The H2 chip enables Adaptive Audio, which continuously tailors noise control to your environment. USB-C charging case provides up to 30 hours of total battery life and works as a precision finding device.',
      images: [img('airpodspro'), img('apple-airpods'), img('airpods-case')],
      specifications: [
        { key: 'Chip', value: 'Apple H2' },
        { key: 'ANC', value: 'Active Noise Cancellation + Transparency Mode' },
        { key: 'Battery', value: '6 hrs (30 hrs with case)' },
        { key: 'Sweat Resistance', value: 'IPX4' },
        { key: 'Audio', value: 'Adaptive Audio, Personalized Spatial Audio' },
        { key: 'Charging', value: 'USB-C, MagSafe, Qi' },
      ],
      variants: [
        { name: 'Color', value: 'White', priceModifier: 0, stock: 95, sku: 'AIRPP2-WHT' },
      ],
      tags: ['apple', 'airpods', 'tws', 'anc'],
    },
    {
      name: 'Bose QuietComfort 45',
      brand: 'Bose',
      price: 26900,
      discountPercent: 18,
      stock: 60,
      isFeatured: false,
      warranty: '1 Year Bose Warranty',
      shortDescription: 'Legendary Bose ANC, 24-hour battery, plush ear cushions.',
      description: 'Bose QuietComfort 45 delivers the legendary Bose noise cancellation perfected over decades. Quiet Mode blocks out the world around you, while Aware Mode brings it back in. TriPort acoustic architecture reproduces clear, balanced audio with deep lows and extended highs.',
      images: [img('boseqc45'), img('bose-headphones'), img('bose-quiet')],
      specifications: [
        { key: 'ANC', value: 'Bose QuietComfort Technology' },
        { key: 'Battery', value: '24 hours, 15 min = 3 hours' },
        { key: 'Codec', value: 'aptX, AAC, SBC' },
        { key: 'Microphone', value: '4-mic system, Adjustable EQ' },
        { key: 'Weight', value: '238g' },
        { key: 'Connectivity', value: 'Bluetooth 5.1, Multipoint' },
      ],
      variants: [
        { name: 'Color', value: 'Triple Black', priceModifier: 0, stock: 30, sku: 'QC45-BLK' },
        { name: 'Color', value: 'White Smoke',  priceModifier: 0, stock: 30, sku: 'QC45-WHT' },
      ],
      tags: ['bose', 'anc', 'wireless', 'comfort'],
    },
    {
      name: 'Sennheiser Momentum 4',
      brand: 'Sennheiser',
      price: 22990,
      discountPercent: 20,
      stock: 40,
      isFeatured: false,
      warranty: '2 Year Sennheiser Warranty',
      shortDescription: 'Hi-Fi tuning, 60-hour battery, foldable design, USB-C.',
      description: 'Momentum 4 Wireless boasts an incredible 60-hour battery life — the longest in its class. Sennheiser\'s signature Hi-Fi sound is perfectly tuned through the Smart Control app. Adaptive Noise Cancellation adjusts to your environment automatically, and the built-in voice assistant responds instantly.',
      images: [img('sennheiser'), img('sennheiser-m4'), img('sennheiser-audio')],
      specifications: [
        { key: 'Driver', value: '42mm Transducers' },
        { key: 'Battery', value: '60 hours (ANC on)' },
        { key: 'Codec', value: 'aptX Adaptive, aptX, AAC, SBC' },
        { key: 'ANC', value: 'Adaptive Noise Cancellation' },
        { key: 'Weight', value: '293g' },
        { key: 'Charging', value: 'USB-C, 10 min = 2 hours' },
      ],
      variants: [
        { name: 'Color', value: 'Black',   priceModifier: 0, stock: 20, sku: 'MM4W-BLK' },
        { name: 'Color', value: 'Natural', priceModifier: 0, stock: 20, sku: 'MM4W-NAT' },
      ],
      tags: ['sennheiser', 'hifi', 'wireless', 'anc'],
    },
  ],

  'Smart TVs': [
    {
      name: 'Samsung 65" Neo QLED 8K QN800D',
      brand: 'Samsung',
      price: 349990,
      discountPercent: 12,
      stock: 10,
      isFeatured: true,
      warranty: '1 Year Samsung On-site Warranty',
      shortDescription: '8K AI Upscaling, Neo Quantum Processor 8K, Dolby Atmos.',
      description: 'Neo QLED 8K TV delivers 8K resolution with Samsung\'s most intelligent upscaling. The Neo Quantum Processor 8K upscales every piece of content in real time to near 8K quality. Quantum Mini LEDs provide extreme contrast with peak brightness up to 5000 nits.',
      images: [img('samsungtv'), img('samsung-neqled'), img('samsung-tv-room')],
      specifications: [
        { key: 'Resolution', value: '8K (7680×4320)' },
        { key: 'Display', value: 'Neo QLED, Quantum Mini LED' },
        { key: 'HDR', value: 'HDR10+, HLG' },
        { key: 'Processor', value: 'Neo Quantum Processor 8K' },
        { key: 'Audio', value: '70W, Dolby Atmos, Object Tracking Sound+' },
        { key: 'Smart Platform', value: 'Tizen, Samsung Gaming Hub' },
      ],
      variants: [
        { name: 'Size', value: '65"', priceModifier: 0,      stock: 5, sku: 'QN800D-65' },
        { name: 'Size', value: '75"', priceModifier: 100000, stock: 3, sku: 'QN800D-75' },
        { name: 'Size', value: '85"', priceModifier: 200000, stock: 2, sku: 'QN800D-85' },
      ],
      tags: ['samsung', '8k', 'qled', 'smart-tv'],
    },
    {
      name: 'LG 55" OLED evo C4',
      brand: 'LG',
      price: 149990,
      discountPercent: 10,
      stock: 20,
      isFeatured: true,
      warranty: '2 Year LG Warranty',
      shortDescription: 'Self-lit pixels, α9 AI Processor 4K, Dolby Vision IQ.',
      description: 'LG OLED evo C4 delivers perfect black levels with self-lit OLED pixels. Powered by the α9 AI Processor Gen7, it analyzes and enhances every frame with artificial intelligence. Dolby Vision IQ with Precision Detail and Dolby Atmos create reference-level picture and sound from a thin panel.',
      images: [img('lgoled'), img('lg-tv'), img('oled-display')],
      specifications: [
        { key: 'Panel', value: 'OLED evo, Self-Lit Pixels' },
        { key: 'Resolution', value: '4K (3840×2160)' },
        { key: 'HDR', value: 'Dolby Vision IQ, HDR10, HLG' },
        { key: 'Processor', value: 'α9 AI Processor Gen7' },
        { key: 'Audio', value: '60W, Dolby Atmos, AI Sound Pro' },
        { key: 'Gaming', value: '144Hz, G-Sync, FreeSync Premium, HDMI 2.1' },
      ],
      variants: [
        { name: 'Size', value: '55"', priceModifier: 0,     stock: 10, sku: 'OC4-55' },
        { name: 'Size', value: '65"', priceModifier: 50000, stock: 7,  sku: 'OC4-65' },
        { name: 'Size', value: '77"', priceModifier: 1000000, stock: 3, sku: 'OC4-77' },
      ],
      tags: ['lg', 'oled', '4k', 'smart-tv', 'gaming'],
    },
    {
      name: 'Sony BRAVIA 7 55" Mini LED',
      brand: 'Sony',
      price: 159990,
      discountPercent: 8,
      stock: 15,
      isFeatured: false,
      warranty: '2 Year Sony Warranty',
      shortDescription: 'XR Backlight Master Drive, Cognitive Processor XR, Google TV.',
      description: 'BRAVIA 7 uses XR Backlight Master Drive with thousands of precisely controlled Mini LED zones. Cognitive Processor XR replicates how humans see and hear for lifelike picture and sound. Google TV integration gives you access to 700,000+ movies and TV episodes, personalized just for you.',
      images: [img('sonybravia'), img('sony-tv'), img('sony-bravia-room')],
      specifications: [
        { key: 'Panel', value: 'Mini LED, XR TRILUMINOS Pro' },
        { key: 'Resolution', value: '4K, 100Hz' },
        { key: 'HDR', value: 'Dolby Vision, HDR10, HLG' },
        { key: 'Processor', value: 'Cognitive Processor XR' },
        { key: 'Audio', value: 'Acoustic Multi-Audio+, Dolby Atmos' },
        { key: 'Smart Platform', value: 'Google TV' },
      ],
      variants: [
        { name: 'Size', value: '55"', priceModifier: 0,     stock: 8, sku: 'BR7-55' },
        { name: 'Size', value: '65"', priceModifier: 50000, stock: 7, sku: 'BR7-65' },
      ],
      tags: ['sony', 'bravia', 'mini-led', '4k', 'google-tv'],
    },
    {
      name: 'TCL 50" QLED C655',
      brand: 'TCL',
      price: 44990,
      discountPercent: 20,
      stock: 50,
      isFeatured: false,
      warranty: '1 Year TCL Warranty',
      shortDescription: 'QLED, 4K, Google TV, Game Master 3.0, 60Hz.',
      description: 'TCL C655 QLED delivers vivid colour and contrast at an incredible value. Quantum Dot technology enhances colour volume to cover 98% of the DCI-P3 colour space. Game Master 3.0 with 60Hz VRR, auto low-latency mode, and FreeSync Premium ensures smooth gaming. Google TV gives you access to all your favourite streaming services.',
      images: [img('tclqled'), img('tcl-tv'), img('tcl-room')],
      specifications: [
        { key: 'Panel', value: 'QLED, Quantum Dot' },
        { key: 'Resolution', value: '4K (3840×2160), 60Hz' },
        { key: 'HDR', value: 'Dolby Vision, HDR10+, HLG' },
        { key: 'Audio', value: '30W, Dolby Atmos' },
        { key: 'Gaming', value: 'Game Master 3.0, FreeSync Premium' },
        { key: 'Smart Platform', value: 'Google TV' },
      ],
      variants: [
        { name: 'Size', value: '50"', priceModifier: 0,     stock: 25, sku: 'C655-50' },
        { name: 'Size', value: '55"', priceModifier: 10000, stock: 15, sku: 'C655-55' },
        { name: 'Size', value: '65"', priceModifier: 30000, stock: 10, sku: 'C655-65' },
      ],
      tags: ['tcl', 'qled', '4k', 'budget'],
    },
  ],

  Cameras: [
    {
      name: 'Sony Alpha A7 IV',
      brand: 'Sony',
      price: 259990,
      discountPercent: 5,
      stock: 12,
      isFeatured: true,
      warranty: '2 Year Sony Warranty',
      shortDescription: '33MP BSI-CMOS, 4K 60fps, Real-time Eye AF, 10fps burst.',
      description: 'Sony Alpha A7 IV is the most well-rounded full-frame mirrorless camera ever made. 33MP BSI sensor, 10fps burst shooting, and Real-time Eye AF that locks on to humans and animals with uncanny accuracy. 4K 60fps video with full pixel readout makes it a powerhouse for hybrid shooters.',
      images: [img('sonya7iv'), img('sony-camera'), img('sony-mirrorless')],
      specifications: [
        { key: 'Sensor', value: '33MP BSI CMOS Full-Frame' },
        { key: 'Autofocus', value: '759-point Phase Detect, Real-time Eye AF' },
        { key: 'Burst', value: '10 fps mechanical, 8 fps electronic' },
        { key: 'Video', value: '4K 60fps, 4K 120fps (APS-C), 10-bit' },
        { key: 'Stabilisation', value: '5-axis IBIS, 5.5 stops' },
        { key: 'Battery', value: 'NP-FZ100, ~610 shots' },
      ],
      variants: [
        { name: 'Kit', value: 'Body Only',        priceModifier: 0,      stock: 8, sku: 'A7IV-BODY' },
        { name: 'Kit', value: 'With 28-70mm Lens', priceModifier: 30000, stock: 4, sku: 'A7IV-KIT' },
      ],
      tags: ['sony', 'mirrorless', 'fullframe', 'professional'],
    },
    {
      name: 'Canon EOS R6 Mark II',
      brand: 'Canon',
      price: 249990,
      discountPercent: 6,
      stock: 10,
      isFeatured: true,
      warranty: '2 Year Canon Warranty',
      shortDescription: '40MP sensor, 40fps burst, 6K RAW video, subject detection AF.',
      description: 'Canon EOS R6 Mark II is built for speed. 40fps electronic shutter burst, Dual Pixel CMOS AF II with subject detection, and 6K RAW video output via HDMI give professionals unmatched flexibility. Up to 8-stop IS with compatible lenses means sharp images in challenging conditions.',
      images: [img('canonr6'), img('canon-camera'), img('canon-eos')],
      specifications: [
        { key: 'Sensor', value: '40MP CMOS Full-Frame (35.9×23.9mm)' },
        { key: 'Autofocus', value: 'Dual Pixel CMOS AF II, 1053 zones' },
        { key: 'Burst', value: '40 fps (electronic), 12 fps (mechanical)' },
        { key: 'Video', value: '6K RAW (HDMI), 4K 60fps' },
        { key: 'Stabilisation', value: 'Up to 8 stops with IS lenses' },
        { key: 'Battery', value: 'LP-E6NH, ~450 shots' },
      ],
      variants: [
        { name: 'Kit', value: 'Body Only',       priceModifier: 0,      stock: 6, sku: 'R6MK2-BODY' },
        { name: 'Kit', value: 'With 24-105mm IS', priceModifier: 55000, stock: 4, sku: 'R6MK2-KIT' },
      ],
      tags: ['canon', 'mirrorless', 'fullframe', 'professional'],
    },
    {
      name: 'GoPro HERO12 Black',
      brand: 'GoPro',
      price: 38500,
      discountPercent: 22,
      stock: 70,
      isFeatured: false,
      warranty: '1 Year GoPro Warranty',
      shortDescription: '5.3K60 video, 27MP photo, HyperSmooth 6.0, waterproof 10m.',
      description: 'HERO12 Black delivers unprecedented video quality with a new, larger sensor optimized for 4K and 5.3K60. HyperSmooth 6.0 produces gimbal-like stabilization in any mode — even at max resolution. Improved low-light performance and 10m waterproof design without a housing make it the toughest action camera ever.',
      images: [img('gopro12'), img('gopro-hero'), img('gopro-action')],
      specifications: [
        { key: 'Video', value: '5.3K60, 4K120, 2.7K240' },
        { key: 'Photo', value: '27MP RAW + JPG' },
        { key: 'Stabilisation', value: 'HyperSmooth 6.0' },
        { key: 'Waterproof', value: '10m without housing' },
        { key: 'Battery', value: 'Enduro 1720mAh' },
        { key: 'Display', value: '2.27" touch, 1.4" front' },
      ],
      variants: [
        { name: 'Bundle', value: 'Camera Only',    priceModifier: 0,    stock: 40, sku: 'H12-SOLO' },
        { name: 'Bundle', value: 'Accessories Kit', priceModifier: 5000, stock: 30, sku: 'H12-KIT' },
      ],
      tags: ['gopro', 'action-camera', 'waterproof', '4k'],
    },
    {
      name: 'Fujifilm X100VI',
      brand: 'Fujifilm',
      price: 159999,
      discountPercent: 4,
      stock: 8,
      isFeatured: false,
      warranty: '2 Year Fujifilm Warranty',
      shortDescription: '40MP APS-C X-Trans CMOS 5 HR, IBIS, 6.2K RAW video.',
      description: 'Fujifilm X100VI is the pinnacle of compact camera design with a 40MP X-Trans CMOS 5 HR sensor and 5-axis IBIS. The 23mm f/2 fixed lens renders images with the signature character that Fujifilm is famous for. Film Simulation modes recreate legendary analogue films digitally, giving every image a timeless quality.',
      images: [img('fujifilmx100'), img('fujifilm-camera'), img('fuji-vintage')],
      specifications: [
        { key: 'Sensor', value: '40MP APS-C X-Trans CMOS 5 HR' },
        { key: 'Lens', value: '23mm f/2 (35mm equivalent)' },
        { key: 'Stabilisation', value: '5-axis IBIS, Up to 6 stops' },
        { key: 'Video', value: '6.2K RAW, 4K 60fps' },
        { key: 'Shutter', value: 'Mechanical / Electronic, up to 1/180,000s' },
        { key: 'Film Simulations', value: '20 modes including Classic Negative' },
      ],
      variants: [
        { name: 'Color', value: 'Black',  priceModifier: 0, stock: 4, sku: 'X100VI-BLK' },
        { name: 'Color', value: 'Silver', priceModifier: 0, stock: 4, sku: 'X100VI-SLV' },
      ],
      tags: ['fujifilm', 'compact', 'apsc', 'film-simulation'],
    },
  ],
};

// ─── Seed ────────────────────────────────────────────────────────────────────
console.log('\n🗑  Clearing existing categories and products...');
await Product.deleteMany({});
await Category.deleteMany({});
console.log('✅ Cleared.\n');

console.log('📦 Inserting categories and products...\n');

let catCount = 0;
let prodCount = 0;

for (const catData of CATEGORIES) {
  const catSlug = slug(catData.name);
  const category = await Category.create({ ...catData, slug: catSlug });
  catCount++;
  console.log(`✅ Category: ${catData.name} (${category._id})`);

  const products = PRODUCTS_BY_CATEGORY[catData.name] || [];
  for (const prodData of products) {
    const prodSlug = slug(prodData.name);
    // Generate a top-level product SKU from the slug (required field)
    const topSku = prodSlug.replace(/-/g, '').toUpperCase().slice(0, 12);
    await Product.create({ ...prodData, slug: prodSlug, sku: topSku, category: category._id });
    prodCount++;
    console.log(`   🛍  ${prodData.name}`);
  }
}

console.log(`\n🎉 Seed complete!`);
console.log(`   Categories : ${catCount}`);
console.log(`   Products   : ${prodCount}`);
console.log(`\n🌐 Visit : http://localhost:3000\n`);

await mongoose.disconnect();
process.exit(0);

