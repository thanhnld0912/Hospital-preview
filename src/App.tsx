/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmergencyModal } from './components/EmergencyModal';
import { BookingModal } from './components/BookingModal';
import { SearchModal } from './components/SearchModal';
import { ArticleModal } from './components/ArticleModal';

import { HomeScreen } from './components/screens/HomeScreen';
import { AboutScreen } from './components/screens/AboutScreen';
import { ServicesScreen } from './components/screens/ServicesScreen';
import { NoticesScreen } from './components/screens/NoticesScreen';
import { VaccinationScreen } from './components/screens/VaccinationScreen';
import { NewsScreen } from './components/screens/NewsScreen';
import { HealthGuideScreen } from './components/screens/HealthGuideScreen';
import { ContactScreen } from './components/screens/ContactScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('trang-chu');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDefaultService, setBookingDefaultService] = useState<string | undefined>();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [fontScale, setFontScale] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [articleModalData, setArticleModalData] = useState<{
    type: 'announcement' | 'news' | 'guide';
    item: any;
  } | null>(null);

  // Global keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to top on navigation
  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (serviceName?: string) => {
    setBookingDefaultService(serviceName);
    setIsBookingOpen(true);
  };

  const handleOpenArticle = (type: 'announcement' | 'news' | 'guide', item: any) => {
    setArticleModalData({ type, item });
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#f8f9ff] text-[#121c2a] font-scale-${fontScale}`}>
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenBooking={() => handleOpenBooking()}
        onOpenSearch={() => setIsSearchOpen(true)}
        fontScale={fontScale}
        onChangeFontScale={setFontScale}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full">
        {currentTab === 'trang-chu' && (
          <HomeScreen
            onNavigate={handleSelectTab}
            onOpenBooking={handleOpenBooking}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenArticle={handleOpenArticle}
          />
        )}

        {currentTab === 'gioi-thieu' && (
          <AboutScreen
            onNavigate={handleSelectTab}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentTab === 'dich-vu-y-te' && (
          <ServicesScreen
            onNavigate={handleSelectTab}
            onOpenBooking={handleOpenBooking}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {currentTab === 'thong-bao' && (
          <NoticesScreen
            onNavigate={handleSelectTab}
            onOpenArticle={handleOpenArticle}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {currentTab === 'tiem-chung' && (
          <VaccinationScreen
            onNavigate={handleSelectTab}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentTab === 'tin-tuc-va-hoat-dong' && (
          <NewsScreen
            onNavigate={handleSelectTab}
            onOpenArticle={handleOpenArticle}
          />
        )}

        {currentTab === 'huong-dan-suc-khoe' && (
          <HealthGuideScreen
            onNavigate={handleSelectTab}
            onOpenArticle={handleOpenArticle}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {currentTab === 'lien-he' && (
          <ContactScreen
            onNavigate={handleSelectTab}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer
        onNavigate={handleSelectTab}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Modals & Dialogs */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        defaultService={bookingDefaultService}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleSelectTab}
        onSelectArticle={handleOpenArticle}
      />

      <ArticleModal
        isOpen={!!articleModalData}
        onClose={() => setArticleModalData(null)}
        data={articleModalData}
      />
    </div>
  );
}
