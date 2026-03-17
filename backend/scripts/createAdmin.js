/**
 * Seed script: Creates an admin user in MongoDB.
 * Run with: node scripts/createAdmin.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASS  = 'admin@123';
const ADMIN_NAME  = 'Admin';

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Inline schema — avoids importing module that may have ESM issues from scripts/
  const userSchema = new mongoose.Schema(
    {
      name:            { type: String, required: true },
      email:           { type: String, required: true, unique: true, lowercase: true },
      password:        { type: String, required: true, select: false },
      role:            { type: String, enum: ['user', 'admin'], default: 'user' },
      isActive:        { type: Boolean, default: true },
      isEmailVerified: { type: Boolean, default: false },
      avatar:          { url: String, publicId: String },
      phone:           { type: String, default: '' },
      addresses:       { type: Array, default: [] },
      wishlist:        { type: Array, default: [] },
    },
    { timestamps: true }
  );

  // Use existing model if already registered (avoids OverwriteModelError)
  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    // Make sure it's an admin
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`⬆️  Existing user "${ADMIN_EMAIL}" promoted to admin.`);
    } else {
      console.log(`ℹ️  Admin user "${ADMIN_EMAIL}" already exists. Nothing changed.`);
    }
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASS, 12);
    await User.create({
      name:            ADMIN_NAME,
      email:           ADMIN_EMAIL,
      password:        hashedPassword,
      role:            'admin',
      isActive:        true,
      isEmailVerified: true,
    });
    console.log(`🎉 Admin user created!`);
  }

  console.log(`\n📋 Admin Credentials:`);
  console.log(`   Email   : ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASS}`);
  console.log(`   URL     : http://localhost:3000/admin\n`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
