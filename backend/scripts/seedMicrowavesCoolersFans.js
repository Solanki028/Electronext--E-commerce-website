import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const categorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    image: { url: String, publicId: String },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    price: Number,
    mrp: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    brand: String,
    stock: Number,
    isFeatured: Boolean,
    isActive: { type: Boolean, default: true },
    images: [{ url: String, publicId: String }],
    specifications: [
      {
        name: String,
        value: String,
      }
    ],
  },
  { timestamps: true, strict: false }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const createSeedData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected.');

    const applianceCat = await Category.findOne({ slug: 'appliances' }) || await Category.create({
      name: 'Appliances',
      slug: 'appliances',
      description: 'Home appliances',
    });

    const categoriesData = [
      {
        name: 'Microwave Ovens',
        slug: 'microwave-ovens',
        description: 'Smart convection and solo microwaves',
        image: { url: '/images/categories/cat_apple_microwave.png' },
        parent: applianceCat._id,
        featured: true,
        sortOrder: 10
      },
      {
        name: 'Air Coolers',
        slug: 'air-coolers',
        description: 'Desert and tower cooling solutions',
        image: { url: '/images/categories/cat_apple_cooler.png' },
        parent: applianceCat._id,
        featured: true,
        sortOrder: 11
      },
      {
        name: 'Fans',
        slug: 'fans',
        description: 'Premium BLDC ceiling and pedestal fans',
        image: { url: '/images/categories/cat_apple_fan.png' },
        parent: applianceCat._id,
        featured: true,
        sortOrder: 12
      }
    ];

    console.log('📝 Creating Categories...');
    const createdCats = {};
    for (const catData of categoriesData) {
      await Category.deleteOne({ slug: catData.slug });
      createdCats[catData.slug] = await Category.create(catData);
      console.log(`  Created category: ${catData.name}`);
    }

    const productsData = [
      // Microwaves
      ...Array.from({ length: 5 }).map((_, i) => ({
        name: `ProChef Smart Microwave ${['20L', '23L', '28L', '32L', '40L'][i]}`,
        slug: `prochef-microwave-${i}`,
        sku: `MWV-${Date.now()}-${i}`,
        description: 'Auto-cook menus, charcoal lighting heater, and smart inverter technology.',
        price: 8000 + i * 4000,
        mrp: 10000 + i * 5000,
        category: createdCats['microwave-ovens']._id,
        brand: ['Samsung', 'LG', 'Panasonic', 'IFB', 'Whirlpool'][i],
        stock: 50,
        isFeatured: i === 0,
        images: [
          { url: `https://picsum.photos/seed/micro${i}a/800/800` },
          { url: `https://picsum.photos/seed/micro${i}b/800/800` }
        ],
        specifications: [{ name: 'Capacity', value: ['20L', '23L', '28L', '32L', '40L'][i] }, { name: 'Type', value: 'Convection' }]
      })),
      
      // Coolers
      ...Array.from({ length: 5 }).map((_, i) => ({
        name: `Arctic Breeze Tower Cooler ${60 + i * 15}L`,
        slug: `arctic-cooler-${i}`,
        sku: `CLR-${Date.now()}-${i}`,
        description: 'Honeycomb cooling pads, ice chamber, and inverter compatible.',
        price: 5000 + i * 1500,
        mrp: 7000 + i * 2000,
        category: createdCats['air-coolers']._id,
        brand: ['Symphony', 'Bajaj', 'Kenstar', 'Crompton', 'Voltas'][i],
        stock: 40,
        isFeatured: i === 0,
        images: [
          { url: `https://picsum.photos/seed/cooler${i}a/800/800` },
          { url: `https://picsum.photos/seed/cooler${i}b/800/800` }
        ],
        specifications: [{ name: 'Capacity', value: `${60 + i * 15}L` }, { name: 'Type', value: 'Desert/Tower' }]
      })),

      // Fans
      ...Array.from({ length: 5 }).map((_, i) => ({
        name: `AeroFlow BLDC Smart Fan ${['1200mm', '1400mm', 'Pedestal', 'Tower', 'Wall'][i]}`,
        slug: `aeroflow-fan-${i}`,
        sku: `FAN-${Date.now()}-${i}`,
        description: 'Energy efficient BLDC motor, remote control, and anti-dust coating.',
        price: 2500 + i * 500,
        mrp: 3500 + i * 700,
        category: createdCats['fans']._id,
        brand: ['Atomberg', 'Orient', 'Havells', 'Crompton', 'Usha'][i],
        stock: 100,
        isFeatured: i === 0,
        images: [
          { url: `https://picsum.photos/seed/fan${i}a/800/800` },
          { url: `https://picsum.photos/seed/fan${i}b/800/800` }
        ],
        specifications: [{ name: 'Sweep Size', value: '1200mm' }, { name: 'Motor', value: 'BLDC' }]
      }))
    ];

    console.log('📦 Creating Products (cleaning old specific products first)...');
    for (const p of productsData) {
      await Product.deleteOne({ slug: p.slug });
      await Product.create(p);
    }
    console.log(`  Created ${productsData.length} total products.`);

    console.log('🎉 Done seeding appliances!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

createSeedData();
