import { NavLink } from 'react-router-dom';
import { User, LayoutDashboard, Radio, Boxes, Languages, Menu, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

export function Navigation() {
  const { language, toggleLanguage, theme, toggleTheme, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: User, label: t.nav.onboarding },
    { path: '/dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    { path: '/realtime', icon: Radio, label: t.nav.realtime },
    { path: '/sensors', icon: Boxes, label: t.nav.sensors },
  ];

  return (
    <nav className="bg-[#fffef5] dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-[#51553a] via-[#7a8a45] to-[#a0b868] bg-clip-text text-transparent">
              {t.appTitle}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm lg:text-base ${
                      isActive
                        ? 'bg-[#51553a]/20 text-[#51553a] border border-[#51553a]/30'
                        : 'text-gray-600 dark:text-gray-300 hover:text-[#51553a] hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium hidden lg:inline">{item.label}</span>
                </NavLink>
              );
            })}

            {/* Theme toggle hidden temporarily */}
            {/* <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-[#51553a]" />
              ) : (
                <Sun className="w-4 h-4 text-[#7a8a45]" />
              )}
            </button> */}

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 bg-[#51553a]/20 px-3 lg:px-4 py-2 rounded-lg border border-[#51553a]/30 hover:bg-[#51553a]/30 transition-colors"
              aria-label="Toggle language"
            >
              <Languages className="w-4 h-4 text-[#51553a]" />
              <span className="text-[#51553a] text-sm font-semibold hidden lg:inline">
                {language === 'en' ? 'ENG' : 'ไทย'}
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              aria-label="Toggle language"
            >
              <Languages className="w-5 h-5 text-[#51553a]" />
            </button>
            {/* Theme toggle hidden temporarily */}
            {/* <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-[#51553a]" />
              ) : (
                <Sun className="w-5 h-5 text-[#7a8a45]" />
              )}
            </button> */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#51553a]/20 text-[#51553a] border border-[#51553a]/30'
                          : 'text-gray-600 dark:text-gray-300 hover:text-[#51553a] hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
