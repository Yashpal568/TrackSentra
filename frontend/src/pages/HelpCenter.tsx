import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { Link } from 'react-router-dom';
import { Search, Book, ChevronRight } from 'lucide-react';


interface Article {
  _id: string;
  title: string;
  slug: string;
  category: string;
  updatedAt: string;
}

export const HelpCenter = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await api.get('/help-center/articles', { params: { search } });
        setArticles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchArticles, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // Group by category
  const categories = articles.reduce((acc, curr) => {
    acc[curr.category] = acc[curr.category] || [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, Article[]>);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center py-10 bg-emerald-primary text-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">How can we help?</h1>
        <div className="max-w-xl mx-auto px-4 relative">
          <Search className="absolute left-7 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for articles..."
            className="w-full py-2 pl-12 pr-4 rounded-full text-text-main outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-text-secondary">Loading articles...</p>
      ) : Object.keys(categories).length === 0 ? (
        <p className="text-center text-text-secondary">No articles found.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(categories).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-xl font-bold mb-4 text-text-main border-b pb-2 flex items-center gap-2">
                <Book size={20} className="text-emerald-primary" />
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <Link 
                    key={item._id} 
                    to={`/help/${item.slug}`}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-surface-card flex justify-between items-center group"
                  >
                    <div>
                      <h3 className="font-semibold text-text-main group-hover:text-emerald-primary transition-colors">{item.title}</h3>
                      <p className="text-xs text-text-secondary mt-1">Last updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-emerald-primary" size={20} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
