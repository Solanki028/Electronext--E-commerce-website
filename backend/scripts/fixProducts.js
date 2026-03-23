import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const fixProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const Product = mongoose.model('Product', new mongoose.Schema({ isActive: Boolean }, { strict: false }));
    const result = await Product.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`Fixed ${result.modifiedCount} products!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixProducts();
