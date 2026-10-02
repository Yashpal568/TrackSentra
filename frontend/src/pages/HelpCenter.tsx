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
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-card border border-border-subtle shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-primary/20 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-emerald-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative px-8 py-16 text-center z-10">
          <div className="w-16 h-16 mx-auto bg-surface-main border border-emerald-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Book size={32} className="text-emerald-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <h1 className="text-4xl font-black text-text-main mb-4 tracking-tight">How can we help?</h1>
          <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto">
            Search our knowledge base for guides, tutorials, and troubleshooting articles.
          </p>
          
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-emerald-primary to-emerald-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-surface-main border border-border-subtle rounded-full overflow-hidden shadow-xl">
              <Search className="absolute left-6 text-emerald-primary" size={22} />
              <input
                type="text"
                placeholder="Search for articles, guides, and FAQs..."
                className="w-full py-4 pl-16 pr-6 bg-transparent text-text-main placeholder-text-muted outline-none text-lg"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-primary/20 border-t-emerald-primary rounded-full animate-spin"></div>
        </div>
      ) : Object.keys(categories).length === 0 ? (
        <div className="text-center py-20 bg-surface-card border border-border-subtle rounded-2xl border-dashed">
          <Search size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-text-main mb-2">No articles found</h3>
          <p className="text-text-secondary">We couldn't find any articles matching your search.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(categories).map(([category, items]) => (
            <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px bg-border-subtle flex-1" />
                <h2 className="text-xl font-bold text-text-main flex items-center gap-2 px-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  {category}
                </h2>
                <div className="h-px bg-border-subtle flex-1" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                  <Link 
                    key={item._id} 
                    to={`/help/${item.slug}`}
                    className="group block p-6 border border-border-subtle rounded-xl bg-surface-card hover:bg-surface-hover/50 hover:border-emerald-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_-12px_rgba(16,185,129,0.2)]"
                  >
                    <h3 className="font-bold text-text-main group-hover:text-emerald-primary transition-colors mb-3 line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                        {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <ChevronRight className="text-text-muted group-hover:text-emerald-primary transform group-hover:translate-x-1 transition-all" size={18} />
                    </div>
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
