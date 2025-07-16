import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  title: { type: String },
  favicon: { type: String },
  summary: { type: String },
}, { timestamps: true });

export default mongoose.model('Bookmark', bookmarkSchema); 