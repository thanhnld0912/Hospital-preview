import React, { useState, useMemo } from 'react';
import { MEDICAL_SERVICES, ANNOUNCEMENTS, NEWS_ARTICLES, HEALTH_GUIDES, VACCINE_CATALOG } from '../data/healthStationData';
import { NavTab } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onSelectArticle?: (type: 'announcement' | 'news' | 'guide', item: any) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate, onSelectArticle }) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { services: [], announcements: [], news: [], guides: [], vaccines: [] };

    return {
      services: MEDICAL_SERVICES.filter(s => s.title.toLowerCase().includes(q) || s.shortDesc.toLowerCase().includes(q)),
      announcements: ANNOUNCEMENTS.filter(a => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)),
      news: NEWS_ARTICLES.filter(n => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)),
      guides: HEALTH_GUIDES.filter(g => g.title.toLowerCase().includes(q) || g.summary.toLowerCase().includes(q)),
      vaccines: VACCINE_CATALOG.filter(v => v.name.toLowerCase().includes(q) || v.diseaseTarget.toLowerCase().includes(q)),
    };
  }, [query]);

  if (!isOpen) return null;

  const totalResults = 
    results.services.length + 
    results.announcements.length + 
    results.news.length + 
    results.guides.length + 
    results.vaccines.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-blue-100 max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-[#f8f9ff]">
          <span className="material-symbols-outlined text-[#0057c2] text-2xl">search</span>
          <input
            type="text"
            autoFocus
            placeholder="Tìm kiếm dịch vụ y tế, lịch tiêm chủng, thông báo sốt xuất huyết, BHYT..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base bg-transparent text-[#121c2a] focus:outline-none placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 text-sm p-1"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-200 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-8 text-[#414755]">
              <span className="material-symbols-outlined text-4xl text-blue-200 mb-2">manage_search</span>
              <p className="text-sm font-semibold text-[#121c2a]">Tra cứu nhanh cổng thông tin y tế</p>
              <p className="text-xs text-gray-400 mt-1">Gợi ý: "tiêm chủng", "sốt xuất huyết", "người cao tuổi", "vắc xin 5 trong 1", "BHYT"</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Lịch tiêm chủng', 'Sốt xuất huyết', 'Khám BHYT', 'Huyết áp', 'Giờ làm việc'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-[#0057c2] hover:bg-blue-100 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-[#414755]">
              <p className="text-sm font-semibold">Không tìm thấy nội dung phù hợp cho "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Vui lòng thử từ khóa khác hoặc gọi trực tiếp đến số (0236) 3844 567.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Services matches */}
              {results.services.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-bold text-[#0057c2] tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">medical_services</span>
                    <span>Dịch vụ y tế ({results.services.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {results.services.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onClose();
                          onNavigate('dich-vu-y-te');
                        }}
                        className="p-2.5 rounded-lg hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-100 transition-all flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-[#121c2a]">{s.title}</p>
                          <p className="text-xs text-[#414755] line-clamp-1">{s.shortDesc}</p>
                        </div>
                        <span className="material-symbols-outlined text-blue-500 text-sm">arrow_forward</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements matches */}
              {results.announcements.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-bold text-[#bb0112] tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">campaign</span>
                    <span>Thông báo chính thức ({results.announcements.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {results.announcements.map(a => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onClose();
                          if (onSelectArticle) onSelectArticle('announcement', a);
                          else onNavigate('thong-bao');
                        }}
                        className="p-2.5 rounded-lg hover:bg-red-50 cursor-pointer border border-transparent hover:border-red-100 transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-semibold">{a.tag}</span>
                            <span className="text-[11px] text-gray-400">{a.date}</span>
                          </div>
                          <p className="text-sm font-bold text-[#121c2a]">{a.title}</p>
                        </div>
                        <span className="material-symbols-outlined text-red-500 text-sm">arrow_forward</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vaccine matches */}
              {results.vaccines.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-bold text-[#006c4e] tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">vaccines</span>
                    <span>Vắc xin tiêm chủng ({results.vaccines.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {results.vaccines.map(v => (
                      <div
                        key={v.id}
                        onClick={() => {
                          onClose();
                          onNavigate('tiem-chung');
                        }}
                        className="p-2.5 rounded-lg hover:bg-emerald-50 cursor-pointer border border-transparent hover:border-emerald-100 transition-all flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-[#121c2a]">{v.name}</p>
                          <p className="text-xs text-[#414755]">{v.diseaseTarget} • Độ tuổi: {v.recommendedAge}</p>
                        </div>
                        <span className="material-symbols-outlined text-emerald-600 text-sm">arrow_forward</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Health Guides matches */}
              {results.guides.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-bold text-gray-700 tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">health_and_safety</span>
                    <span>Cẩm nang sức khỏe ({results.guides.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {results.guides.map(g => (
                      <div
                        key={g.id}
                        onClick={() => {
                          onClose();
                          if (onSelectArticle) onSelectArticle('guide', g);
                          else onNavigate('huong-dan-suc-khoe');
                        }}
                        className="p-2.5 rounded-lg hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-100 transition-all flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-[#121c2a]">{g.title}</p>
                          <p className="text-xs text-[#414755] line-clamp-1">{g.summary}</p>
                        </div>
                        <span className="material-symbols-outlined text-blue-500 text-sm">arrow_forward</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
