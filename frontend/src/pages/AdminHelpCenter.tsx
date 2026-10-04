import React, { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  slug: string;
  category: string;
  isPublished: boolean;
}

export const AdminHelpCenter = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ _id: '', title: '', slug: '', category: 'General', content: '', isPublished: false });

  const fetchArticles = async () => {
    try {
      const { data } = await api.get('/help-center/admin/articles');
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form._id) {
        await api.put(`/help-center/admin/articles/${form._id}`, form);
      } else {
        await api.post('/help-center/admin/articles', form);
      }
      setShowModal(false);
      setForm({ _id: '', title: '', slug: '', category: 'General', content: '', isPublished: false });
      fetchArticles();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to save article');
    }
  };

  const handleEdit = async (article: Article) => {
    try {
      // Fetch full article for content
      const { data } = await api.get(`/help-center/articles/${article.slug}`);
      setForm({
        _id: article._id,
        title: data.title,
        slug: data.slug,
        category: data.category,
        content: data.content,
        isPublished: data.isPublished
      });
      setShowModal(true);
    } catch (e) {
      console.error(e);
      // Fallback edit
      setForm({ ...article, content: '' });
      setShowModal(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/help-center/admin/articles/${id}`);
      fetchArticles();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Help Center</h1>
        <Button onClick={() => {
          setForm({ _id: '', title: '', slug: '', category: 'General', content: '', isPublished: false });
          setShowModal(true);
        }} className="flex items-center gap-2">
          <Plus size={16} /> New Article
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {articles.map(article => (
            <Card key={article._id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-text-main">{article.title}</h3>
                <p className="text-sm text-text-secondary">{article.category} • /{article.slug} • {article.isPublished ? <span className="text-emerald-primary">Published</span> : <span className="text-yellow-600">Draft</span>}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => handleEdit(article)}><Edit2 size={16} /></Button>
                <Button variant="danger" onClick={() => handleDelete(article._id)}><Trash2 size={16} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-card rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold mb-4">{form._id ? 'Edit Article' : 'New Article'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex text-sm font-medium mb-1">Title</label>
                  <input required className="w-full border p-2 rounded" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div>
                  <label className="flex text-sm font-medium mb-1">Slug (URL)</label>
                  <input required className="w-full border p-2 rounded" value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                </div>
              </div>
              <div>
                <label className="flex text-sm font-medium mb-1">Category</label>
                <input required className="w-full border p-2 rounded" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              <div>
                <label className="flex text-sm font-medium mb-1">Content (Markdown supported in rendering)</label>
                <textarea required className="w-full border p-2 rounded min-h-75" value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} />
                <label htmlFor="isPublished">Publish immediately</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Save Article</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
