import { Request, Response } from 'express';
import { HelpArticle } from '../models/HelpArticle';

export const getPublicArticles = async (req: Request, res: Response): Promise<void> => {
  const { category, search } = req.query;
  const filter: any = { isPublished: true };

  if (category) {
    filter.category = category;
  }
  
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const articles = await HelpArticle.find(filter)
    .select('-content -__v') // don't send full content for list
    .sort({ createdAt: -1 })
    .lean();
    
  res.json(articles);
};

export const getPublicArticleBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const article = await HelpArticle.findOne({ slug, isPublished: true }).lean();
  
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  
  res.json(article);
};

// Admin Endpoints
export const getAdminArticles = async (req: Request, res: Response): Promise<void> => {
  const articles = await HelpArticle.find()
    .populate('authorId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();
    
  res.json(articles);
};

export const createAdminArticle = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const { title, slug, category, content, isPublished } = req.body;

  try {
    const article = new HelpArticle({
      title,
      slug,
      category,
      content,
      isPublished,
      authorId: user.id
    });
    
    await article.save();
    res.status(201).json(article);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'An article with this slug already exists' });
      return;
    }
    res.status(400).json({ error: error.message });
  }
};

export const updateAdminArticle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, slug, category, content, isPublished } = req.body;

  try {
    const article = await HelpArticle.findByIdAndUpdate(
      id,
      { title, slug, category, content, isPublished },
      { new: true, runValidators: true }
    );
    
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    
    res.json(article);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'An article with this slug already exists' });
      return;
    }
    res.status(400).json({ error: error.message });
  }
};

export const deleteAdminArticle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const article = await HelpArticle.findByIdAndDelete(id);
  
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  
  res.json({ success: true });
};
