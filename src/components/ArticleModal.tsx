import React from 'react';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    type: 'announcement' | 'news' | 'guide';
    item: any;
  } | null;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data || !data.item) return null;

  const { type, item } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-green-100 max-h-[88vh] flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Top Header */}
        <div className="bg-[#f7faf8] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-green-100 text-[#1c7a42]">
              {type === 'announcement' ? 'Thông báo hành chính' : type === 'news' ? 'Tin tức y tế' : 'Cẩm nang sức khỏe'}
            </span>
            {item.date && <span className="text-xs text-gray-500">• Ngày đăng: {item.date}</span>}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#121c2a] leading-snug">
            {item.title}
          </h2>

          {/* Announcement content */}
          {type === 'announcement' && (
            <div className="space-y-4 text-sm text-[#414755]">
              <div className="p-3 bg-red-50 border-l-4 border-[#bb0112] rounded-r-lg">
                <p className="font-semibold text-[#121c2a]">Cơ quan phát hành: {item.issuedBy || 'Trạm Y tế phường An Hải'}</p>
                <p className="text-xs text-gray-600 mt-0.5">{item.summary}</p>
              </div>
              <div className="whitespace-pre-line leading-relaxed text-[#121c2a] bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-xs sm:text-sm">
                {item.content}
              </div>
            </div>
          )}

          {/* News content */}
          {type === 'news' && (
            <div className="space-y-4 text-sm text-[#414755]">
              {item.imageUrl && (
                <div className="rounded-xl overflow-hidden shadow-sm">
                  <img src={item.imageUrl} alt={item.imageAlt || item.title} className="w-full h-64 object-cover" />
                  <p className="text-[11px] text-gray-500 p-2 bg-gray-50 italic text-center">
                    {item.imageAlt || item.title}
                  </p>
                </div>
              )}
              <p className="font-semibold text-base text-[#121c2a]">{item.summary}</p>
              <div className="space-y-3 leading-relaxed text-[#121c2a]">
                {Array.isArray(item.content) ? (
                  item.content.map((p: string, idx: number) => (
                    <p key={idx}>{p}</p>
                  ))
                ) : (
                  <p>{item.content}</p>
                )}
              </div>
              {item.author && (
                <p className="text-xs text-right italic font-semibold text-[#1c7a42]">
                  Bài viết & Ảnh: {item.author}
                </p>
              )}
            </div>
          )}

          {/* Health Guide content */}
          {type === 'guide' && item.fullArticle && (
            <div className="space-y-4 text-sm text-[#414755]">
              <p className="text-base text-[#121c2a] font-medium leading-relaxed">
                {item.fullArticle.overview}
              </p>

              {item.fullArticle.symptoms && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">warning</span>
                    <span>Dấu hiệu nhận biết:</span>
                  </h4>
                  <ul className="space-y-1 text-xs sm:text-sm text-amber-950 list-disc list-inside">
                    {item.fullArticle.symptoms.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.fullArticle.preventiveSteps && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <h4 className="font-bold text-emerald-900 text-sm mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>Biện pháp phòng ngừa & chăm sóc:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-emerald-950 list-disc list-inside">
                    {item.fullArticle.preventiveSteps.map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.fullArticle.whenToSeeDoctor && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs sm:text-sm">
                  <strong className="block text-red-700 font-bold mb-1">Cảnh báo khi nào cần đến viện ngay:</strong>
                  {item.fullArticle.whenToSeeDoctor}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#414755]">
          <span>Cổng thông tin Trạm Y tế phường An Hải</span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>In trang</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1c7a42] hover:bg-[#155f33] text-white rounded-lg text-xs font-semibold"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
