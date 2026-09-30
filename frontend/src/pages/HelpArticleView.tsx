import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';


interface Article {
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export const HelpArticleView = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await api.get(`/api/help-center/articles/${slug}`);
        setArticle(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) return <p className="p-8 text-center text-gray-500">Loading...</p>;
  if (!article) return <p className="p-8 text-center text-red-500">Article not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link to="/help" className="text-blue-600 hover:underline flex items-center gap-1 mb-4">
        <ArrowLeft size={16} /> Back to Help Center
      </Link>
      
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
        <div className="mb-2 text-sm text-blue-600 font-semibold uppercase tracking-wider">{article.category}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
        
        <div className="flex items-center text-gray-500 text-sm mb-8 pb-4 border-b">
          <Clock size={16} className="mr-1" />
          Last updated: {new Date(article.updatedAt).toLocaleDateString()}
        </div>

        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
          {article.content}
        </div>
      </div>
    </div>
  );
};
