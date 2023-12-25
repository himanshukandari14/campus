const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  media: {
    type: String, // You can store the URL of the image or video
    required: true,
  },
  viewers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to users who viewed the story
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual field to calculate the expiration time (24 hours after createdAt)
storySchema.virtual('expiresAt').get(function() {
  return new Date(this.createdAt.getTime() + 24 * 60 * 60 * 1000);
});

// Ensure virtuals are included in toJSON output
storySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Story', storySchema);


