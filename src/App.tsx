import React, { useState, useEffect } from 'react';
import { HeaderBanner } from './components/HeaderBanner';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CalculatorShell, CalculatorTab } from './components/CalculatorShell';
import { HowItWorksModal } from './components/HowItWorks';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('SGPA');
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Enforce permanent dark mode for public use
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleOpenOcr = () => {
    setActiveTab('SGPA');
    setIsOcrOpen(true);
    const el = document.getElementById('calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Global clipboard paste listener for instantaneous screenshot drop anywhere on page
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          handleOpenOcr();
          break;
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0c0d0e] text-neutral-100 font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      {/* Bold Feature Banner below top bar */}
      <HeaderBanner onOpenOcr={handleOpenOcr} />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 flex flex-col py-4 sm:py-6">
        <Hero />
        <CalculatorShell
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOcrOpen={isOcrOpen}
          onOcrOpenChange={setIsOcrOpen}
        />
      </main>

      {/* Footer */}
      <Footer
        onSelectTab={setActiveTab}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      {/* How it Works Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
};

export default App;
