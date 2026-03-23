import 'dotenv/config';
import mongoose from 'mongoose';

const WATER_HEATERS = [
  {
    name: 'AO Smith HSE-VAS-X-015',
    slug: 'ao-smith-hse-vas',
    description: '15 Litre Vertical Water Heater with Blue Diamond Glass Lined Tank and Advanced PUF Technology.',
    price: 9290,
    mrp: 12500,
    brand: 'AO Smith',
    category: '', 
    stock: 25,
    images: [{ url: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=1000&auto=format&fit=crop', publicId: 'wh_1' }]
  },
  {
    name: 'Crompton Arno Neo 15-L',
    slug: 'crompton-arno-neo-15',
    description: '15-Litre 5 Star Rated Storage Water Heater with Advanced 3 Level Safety.',
    price: 6290,
    mrp: 8700,
    brand: 'Crompton',
    category: '',
    stock: 40,
    images: [{ url: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=1000&auto=format&fit=crop', publicId: 'wh_2' }]
  },
  {
    name: 'Bajaj New Shakti Storage 25L',
    slug: 'bajaj-new-shakti-25l',
    description: '25-Litre Storage Water Geyser with Glassline Inner Tank and Titanium Armour technology.',
    price: 8999,
    mrp: 14200,
    brand: 'Bajaj',
    category: '',
    stock: 15,
    images: [{ url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1000&auto=format&fit=crop', publicId: 'wh_3' }]
  },
  {
    name: 'Havells Monza EC 10L',
    slug: 'havells-monza-10l',
    description: '10 Litre Storage Water Heater with Feroglas Tech and Incoloy Glass Coated Heating Element.',
    price: 5499,
    mrp: 7990,
    brand: 'Havells',
    category: '',
    stock: 35,
    images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop', publicId: 'wh_4' }]
  },
  {
    name: 'V-Guard Divino 15L',
    slug: 'v-guard-divino-15l',
    description: '15 Litre 5 Star Storage Water Geyser with Extra Thick PUF Insulation.',
    price: 6799,
    mrp: 9500,
    brand: 'V-Guard',
    category: '',
    stock: 50,
    images: [{ url: 'https://images.unsplash.com/photo-1556910103-1c02745a8e63?q=80&w=1000&auto=format&fit=crop', publicId: 'wh_5' }]
  }
];

const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image:       { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    parent:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive:    { type: Boolean, default: true },
    sortOrder:   { type: Number, default: 0 },
    isFeatured:  { type: Boolean, default: false }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true },
    slug:             { type: String, unique: true, lowercase: true, trim: true },
    description:      { type: String, required: true },
    price:            { type: Number, required: true },
    category:         { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand:            { type: String, required: true },
    images:           [{ url: String, publicId: String, alt: String }],
    stock:            { type: Number, required: true, default: 0 },
    sku:              { type: String, required: true, unique: true },
    isActive:         { type: Boolean, default: true },
  },
  { timestamps: true, strict: false }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product  = mongoose.models.Product  || mongoose.model('Product',  productSchema);

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');

    // First delete old water heater data
    const oldCat = await Category.findOne({ slug: 'water-heaters' });
    if (oldCat) {
      await Product.deleteMany({ category: oldCat._id });
      await Category.deleteOne({ _id: oldCat._id });
    }

    const category = await Category.create({
      name: 'Water Heaters',
      slug: 'water-heaters',
      description: 'Advanced heating solutions for your home.',
      image: { url: '/images/appliances/cat-water-heater.png', publicId: 'local_water_heater' },
      isFeatured: true,
      sortOrder: 10
    });

    console.log('Created Category:', category.name);

    for (let p of WATER_HEATERS) {
      p.category = category._id;
      p.sku = 'WH' + Math.floor(Math.random() * 100000);
      await Product.create(p);
      console.log('Created product', p.name);
    }

    console.log('🎉 Done seeding water heaters!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
