import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['refresh', 'passwordReset', 'emailVerification'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: { type: Boolean, default: false },
    userAgent: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ user: 1, type: 1 });
tokenSchema.index({ token: 1 });

const Token = mongoose.model('Token', tokenSchema);
export default Token;
