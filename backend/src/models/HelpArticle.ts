import mongoose, { Schema, Document } from 'mongoose';

export interface IHelpArticle extends Document {
  title: string;
  slug: string;
  category: string;
  content: string;
  isPublished: boolean;
  authorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HelpArticleSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    isPublished: { type: Boolean, default: false, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const HelpArticle = mongoose.model<IHelpArticle>('HelpArticle', HelpArticleSchema);
