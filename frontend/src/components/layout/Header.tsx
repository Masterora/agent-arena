import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Swords } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Swords className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">Agent Arena</span>
          </Link>

          <nav className="flex gap-8">
            <Link
              to="/"
              className={`font-medium transition-colors pb-0.5 relative ${
                isActive('/') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              首页
              {isActive('/') && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
            </Link>
            <Link
              to="/strategies"
              className={`font-medium transition-colors pb-0.5 relative ${
                isActive('/strategies') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              策略
              {isActive('/strategies') && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
            </Link>
            <Link
              to="/matches"
              className={`font-medium transition-colors pb-0.5 relative ${
                isActive('/matches') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              比赛
              {isActive('/matches') && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
