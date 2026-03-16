"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Compass, Users, Terminal, Menu, X, Bookmark, Trophy, Moon, Sun } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { toggleTheme, getTheme } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '@/components/NotificationBell';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const { bookmarks, myTeamId, isHydrated } = useUser();

  useEffect(() => {
    const currentTheme = getTheme();
    setThemeState(currentTheme);
    // Apply dark class on initial load
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setThemeState(next);
  };

  const navLinks = [
    { href: '/hackathons', label: 'Hackathons', icon: Compass },
    { href: '/teams', label: 'Teams', icon: Users },
    { href: '/rankings', label: 'Rankings', icon: Trophy },
    { href: '/camp', label: 'Operation Room', icon: Terminal, matchExact: false },
  ];

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center font-bold font-heading group-hover:rotate-12 transition-transform">
            D
          </div>
          <span className="font-heading font-black text-xl tracking-tight hidden sm:block">DAKER<span className="text-muted-foreground/50">.ai</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-surface border border-border rounded-full px-2 py-1 shadow-sm">
          {navLinks.map((link) => {
            const isActive = link.matchExact === false ? pathname.startsWith(link.href) : pathname === link.href;
            const Icon = link.icon;
            
            if (link.href === '/camp' && isHydrated && !myTeamId) return null;

            return (
              <Link key={link.href} href={link.href} className="relative">
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 relative z-10 ${
                  isActive ? 'text-background' : 'text-muted-foreground hover:text-foreground'
                }`}>
                  {isActive && (
                    <motion.div layoutId="header-bg" className="absolute inset-0 bg-foreground rounded-full -z-10" />
                  )}
                  <Icon className="w-4 h-4" /> {link.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTheme}
            className="hidden sm:flex p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <NotificationBell />

          {isHydrated && (
            <Link href="/bookmarks" className="hidden sm:flex relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
              <Bookmark className="w-5 h-5" />
              {bookmarks.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-foreground rounded-full ring-2 ring-background" />
              )}
            </Link>
          )}

          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-full text-sm text-muted-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span className="pr-4">Search</span>
            <kbd className="hidden lg:inline-flex px-1.5 py-0.5 bg-background rounded text-[10px] uppercase font-mono ml-2 border">Ctrl K</kbd>
          </button>

          <button 
            className="md:hidden p-2 -mr-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                if (link.href === '/camp' && isHydrated && !myTeamId) return null;
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                    <div className={`px-4 py-3 rounded-xl text-base font-bold transition-all flex items-center gap-3 ${
                      isActive ? 'bg-foreground text-background' : 'text-muted-foreground active:bg-muted'
                    }`}>
                      <Icon className="w-5 h-5" /> {link.label}
                    </div>
                  </Link>
                );
              })}
              <Link href="/bookmarks" onClick={() => setMobileMenuOpen(false)}>
                <div className="px-4 py-3 rounded-xl text-base font-bold text-muted-foreground active:bg-muted flex items-center gap-3">
                  <Bookmark className="w-5 h-5" /> Bookmarks
                  {isHydrated && bookmarks.length > 0 && <span className="ml-auto bg-foreground text-background text-xs px-2 py-0.5 rounded-full">{bookmarks.length}</span>}
                </div>
              </Link>
              <button
                onClick={handleToggleTheme}
                className="px-4 py-3 rounded-xl text-base font-bold text-muted-foreground active:bg-muted flex items-center gap-3 w-full text-left"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
