import React, { useEffect, useState } from 'react';

// Router tối giản cho khu vực /admin (website công khai không dùng URL routing).
// Dùng History API; Vite (dev/preview) và vercel.json trả index.html cho mọi đường dẫn /admin/*.

const NAVIGATE_EVENT = 'admin:navigate';

function normalize(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

export function navigate(to: string, options: { replace?: boolean } = {}): void {
  if (normalize(window.location.pathname) === normalize(to)) return;
  if (options.replace) window.history.replaceState(null, '', to);
  else window.history.pushState(null, '', to);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
  window.scrollTo({ top: 0 });
}

export function usePathname(): string {
  const [pathname, setPathname] = useState(() => normalize(window.location.pathname));

  useEffect(() => {
    const update = () => setPathname(normalize(window.location.pathname));
    window.addEventListener('popstate', update);
    window.addEventListener(NAVIGATE_EVENT, update);
    // Effect của component con chạy trước component cha: một navigate() xảy ra trước khi
    // listener được gắn sẽ bị bỏ lỡ — đồng bộ lại ngay sau khi gắn listener.
    update();
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener(NAVIGATE_EVENT, update);
    };
  }, []);

  return pathname;
}

type AdminLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string };

/** Thẻ <a> thật (mở tab mới, sao chép link vẫn hoạt động), click thường thì điều hướng không tải lại trang */
export const AdminLink: React.FC<AdminLinkProps> = ({ to, onClick, ...props }) => (
  <a
    {...props}
    href={to}
    onClick={(event) => {
      onClick?.(event);
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      navigate(to);
    }}
  />
);
