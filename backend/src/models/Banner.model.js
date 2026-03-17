import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    subtitle: {
      type: String,
      default: '',
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      alt: { type: String, default: '' },
    },
    link: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      enum: ['hero', 'mid', 'bottom', 'sidebar'],
      default: 'hero',
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    backgroundColor: { type: String, default: '' },
    textColor: { type: String, default: '' },
    ctaText: { type: String, default: 'Shop Now' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bannerSchema.virtual('isLive').get(function () {
  if (!this.isActive) return false;
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
});

bannerSchema.index({ position: 1, sortOrder: 1 });
bannerSchema.index({ isActive: 1 });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
