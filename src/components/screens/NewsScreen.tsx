import React, { useState } from 'react';
import { useSiteContent } from '../../services/siteContent';
import { NavTab, NewsArticle } from '../../types';

interface NewsScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenArticle: (type: 'announcement' | 'news' | 'guide', item: any) => void;
}

export const NewsScreen: React.FC<NewsScreenProps> = ({ onNavigate, onOpenArticle }) => {
  const { news } = useSiteContent();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả tin tức' },
    { id: 'Truyền thông y tế', label: 'Truyền thông y tế' },
    { id: 'Tiêm chủng mở rộng', label: 'Tiêm chủng mở rộng' },
    { id: 'Vệ sinh phòng dịch', label: 'Vệ sinh phòng dịch' },
  ];

  const filteredNews = news.filter(
    (n) => selectedCategory === 'all' || n.category === selectedCategory
  );

  const featured = news[0];

  return (
    <div className="w-full bg-[#f7faf8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 space-y-10">
        {/* Header Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs text-[#414755] mb-2">
            <button onClick={() => onNavigate('trang-chu')} className="hover:text-[#1c7a42]">Trang chủ</button>
            <span>/</span>
            <span className="text-[#1c7a42] font-semibold">Tin tức & Hoạt động</span>
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#1c7a42] bg-green-50 px-2.5 py-1 rounded-full">
            Đời sống y tế cơ sở
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121c2a] mt-2">
            Tin tức & Hoạt động thực địa y tế địa phương
          </h1>
          <p className="text-sm text-[#414755] mt-1 max-w-3xl leading-relaxed">
            Các hoạt động phòng dịch sốt xuất huyết, tiêm chủng, truyền thông chăm sóc sức khỏe ban đầu tại các tổ dân phố thuộc phường An Hải.
          </p>
        </div>

        {/* Featured Big Story Card */}
        {featured && (
          <div
            onClick={() => onOpenArticle('news', featured)}
            className="group bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-200 hover:shadow-lg transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-7 h-64 sm:h-80 overflow-hidden bg-gray-200">
              <img
                src={featured.imageUrl}
                alt={featured.imageAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-green-100 text-[#1c7a42]">
                    {featured.category}
                  </span>
                  <span className="text-xs text-gray-400">• {featured.date}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#121c2a] group-hover:text-[#1c7a42] transition-colors leading-snug">
                  {featured.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#414755] line-clamp-3 leading-relaxed">
                  {featured.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1c7a42]">
                <span>Tác giả: {featured.author}</span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Đọc toàn văn →
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === c.id
                    ? 'bg-[#1c7a42] text-white shadow-xs'
                    : 'bg-white hover:bg-gray-100 text-[#414755] border border-gray-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredNews.map((article) => (
              <article
                key={article.id}
                onClick={() => onOpenArticle('news', article)}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-gray-200 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-[#414755] mb-2">
                      <span className={`font-bold ${
                        article.categoryColor === 'secondary'
                          ? 'text-[#006c4e]'
                          : article.categoryColor === 'tertiary'
                          ? 'text-[#bb0112]'
                          : 'text-[#1c7a42]'
                      }`}>
                        {article.category}
                      </span>
                      <span>{article.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#121c2a] group-hover:text-[#1c7a42] transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-[#414755] line-clamp-3 mt-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between text-xs text-[#1c7a42] font-bold">
                  <span className="text-gray-400 font-normal">{article.author}</span>
                  <span className="inline-flex items-center gap-1">
                    Đọc tiếp →
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
