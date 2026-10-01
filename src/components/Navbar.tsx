import React, { useState } from 'react';
import { NavTab } from '../types';
import { ClinicLogo } from './ClinicLogo';
import { useSiteContent } from '../services/siteContent';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenEmergency: () => void;
  onOpenBooking: () => void;
  onOpenSearch: () => void;
  fontScale: 'sm' | 'md' | 'lg' | 'xl';
  onChangeFontScale: (scale: 'sm' | 'md' | 'lg' | 'xl') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenEmergency,
  onOpenBooking,
  onOpenSearch,
  fontScale,
  onChangeFontScale
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { stationInfo } = useSiteContent();

  const navItems: { id: NavTab; label: string; icon: string }[] = [
    { id: 'trang-chu', label: 'Trang chủ', icon: 'home' },
    { id: 'gioi-thieu', label: 'Giới thiệu', icon: 'account_balance' },
    { id: 'dich-vu-y-te', label: 'Dịch vụ y tế', icon: 'medical_services' },
    { id: 'thong-bao', label: 'Thông báo', icon: 'campaign' },
    { id: 'tiem-chung', label: 'Tiêm chủng', icon: 'vaccines' },
    { id: 'tin-tuc-va-hoat-dong', label: 'Tin tức & Hoạt động', icon: 'newspaper' },
    { id: 'huong-dan-suc-khoe', label: 'Hướng dẫn sức khỏe', icon: 'health_and_safety' },
    { id: 'lien-he', label: 'Liên hệ', icon: 'pin_drop' },
  ];

  const handleDecreaseFont = () => {
    if (fontScale === 'xl') onChangeFontScale('lg');
    else if (fontScale === 'lg') onChangeFontScale('md');
    else if (fontScale === 'md') onChangeFontScale('sm');
  };

  const handleIncreaseFont = () => {
    if (fontScale === 'sm') onChangeFontScale('md');
    else if (fontScale === 'md') onChangeFontScale('lg');
    else if (fontScale === 'lg') onChangeFontScale('xl');
  };

  return (
    <header className="sticky top-0 left-0 right-0 w-full z-40 bg-white shadow-xs border-b border-gray-100">
      {/* Top Emergency Red Bar */}
      <div className="bg-[#bb0112] text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0 animate-pulse">campaign</span>
            <span className="font-medium tracking-wide">
              Cổng thông tin điện tử phục vụ người dân phường An Hải - Đường dây nóng tư vấn sức khỏe: {stationInfo.hotline}
            </span>
          </div>

          <div className="flex items-center gap-4 text-white">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Trực cấp cứu 24/7</span>
            </div>

            {/* Accessibility Font Size Controls */}
            <div className="flex items-center gap-1.5 bg-black/10 px-2 py-0.5 rounded">
              <span className="text-[11px] font-medium opacity-90">Cỡ chữ:</span>
              <button
                type="button"
                onClick={handleDecreaseFont}
                title="Thu nhỏ cỡ chữ"
                className={`px-1.5 py-0.5 rounded font-mono font-bold transition-colors ${fontScale === 'sm' ? 'bg-white text-[#bb0112]' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => onChangeFontScale('md')}
                title="Cỡ chữ mặc định"
                className={`px-1.5 py-0.5 rounded font-mono font-bold transition-colors ${fontScale === 'md' ? 'bg-white text-[#bb0112]' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={handleIncreaseFont}
                title="Phóng to cỡ chữ"
                className={`px-1.5 py-0.5 rounded font-mono font-bold transition-colors ${fontScale === 'lg' || fontScale === 'xl' ? 'bg-white text-[#bb0112]' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand & Action Header */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo and Typography */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onSelectTab('trang-chu')}
        >
          <ClinicLogo className="w-13 h-13 group-hover:scale-105 transition-transform" />
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[#414755]">
              {stationInfo.managingUnit}
            </p>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-[#1c7a42] tracking-tight group-hover:text-[#155f33] transition-colors leading-tight">
              {stationInfo.name} - {stationInfo.city}
            </h1>
            <p className="text-xs text-[#414755] hidden sm:block">
              Hệ thống quản lý, tư vấn và chăm sóc sức khỏe cộng đồng tuyến cơ sở
            </p>
          </div>
        </div>

        {/* Right Action Blocks */}
        <div className="flex items-center gap-3">
          {/* Search Trigger Input */}
          <div 
            onClick={onOpenSearch}
            className="hidden xl:flex items-center bg-[#eef6f0] hover:bg-[#e3f0e6] cursor-pointer rounded-xl px-3 py-2 w-64 border border-[#c3cbc5]/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[#414755] text-lg mr-2 shrink-0">search</span>
            <span className="text-xs text-[#727786] select-none">Tìm kiếm thông tin y tế...</span>
            <span className="ml-auto text-[10px] bg-white text-gray-400 px-1.5 py-0.5 rounded border border-gray-200">⌘K</span>
          </div>

          {/* Quick Booking Button */}
          <button
            type="button"
            onClick={onOpenBooking}
            className="hidden lg:flex items-center gap-1.5 bg-[#eef6f0] hover:bg-[#d4ecdb] text-[#1c7a42] px-3.5 py-2 rounded-xl text-xs font-bold border border-[#a6d3b4] transition-all shadow-2xs"
          >
            <span className="material-symbols-outlined text-base">calendar_month</span>
            <span>Đặt lịch khám</span>
          </button>

          {/* Emergency Hotline Button */}
          <div className="hidden md:flex flex-col items-end">
            <button
              type="button"
              onClick={onOpenEmergency}
              className="flex items-center gap-1.5 bg-[#bb0112] hover:bg-[#a0010f] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-base">e911_emergency</span>
              <span>Cấp cứu / Trực trạm: {stationInfo.hotline}</span>
            </button>
            <span className="text-[11px] text-[#006c4e] font-semibold mt-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006c4e] inline-block animate-pulse"></span>
              Sẵn sàng tiếp nhận 24/7
            </span>
          </div>

          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="xl:hidden p-2 text-gray-600 hover:text-[#1c7a42] hover:bg-gray-100 rounded-lg"
            title="Tìm kiếm"
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-[#1c7a42] hover:bg-gray-100 rounded-lg"
            title="Mở menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar for Desktop */}
      <nav className="bg-[#eef6f0] border-t border-b border-[#d9eadd] hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center overflow-x-auto gap-1 py-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1c7a42] text-white font-bold shadow-xs'
                    : 'text-[#414755] hover:bg-[#d9eadd] hover:text-[#121c2a]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-gray-100">
            <button
              onClick={() => {
                onOpenEmergency();
                setMobileMenuOpen(false);
              }}
              className="p-2 bg-red-50 text-[#bb0112] rounded-lg text-xs font-bold flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">e911_emergency</span>
              <span>Cấp cứu 24/7</span>
            </button>
            <button
              onClick={() => {
                onOpenBooking();
                setMobileMenuOpen(false);
              }}
              className="p-2 bg-green-50 text-[#1c7a42] rounded-lg text-xs font-bold flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              <span>Đặt lịch khám</span>
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 font-medium ${
                    isActive
                      ? 'bg-[#1c7a42] text-white font-bold'
                      : 'text-[#414755] hover:bg-gray-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
