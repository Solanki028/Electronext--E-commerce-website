import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

console.log('🔌 Connecting to MongoDB...');
await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected');

const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, lowercase: true, trim: true },
    image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  },
  { strict: false }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

const updates = [
  { slug: 'smartphones', imgPrefix: 'iphone.jpg' },
  { slug: 'laptops', imgPrefix: 'cat_apple_laptop_' },
  { slug: 'headphones', imgPrefix: 'cat_apple_headphones_' },
  { slug: 'smart-tvs', imgPrefix: 'cat_apple_tv_' },
  { slug: 'cameras', imgPrefix: 'cat_apple_camera_' },
];

const categoryDir = path.resolve('../frontend/public/images/categories');
const files = fs.existsSync(categoryDir) ? fs.readdirSync(categoryDir) : [];

for (const update of updates) {
  const matchingFile = files.find(f => f.startsWith(update.imgPrefix));
  if (matchingFile) {
    const imageUrl = `/images/categories/${matchingFile}`;
    const result = await Category.updateOne({ slug: update.slug }, { $set: { 'image.url': imageUrl } });
    console.log(` Updated ${update.slug} -> ${imageUrl} (Modified: ${result.modifiedCount})`);
  } else {
    console.log(`  Could not find image for ${update.slug}`);
  }
}

console.log(' Done updating category images!');
await mongoose.disconnect();
process.exit(0);
