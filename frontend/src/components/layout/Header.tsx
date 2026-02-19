import React from 'react';
import { Link } from 'react-router-dom';
import { Swords } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Swords className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Agent Arena</span>
          </Link>

          <nav className="flex gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              首页
            </Link>
            <Link
              to="/strategies"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              策略
            </Link>
            <Link
              to="/matches"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              比赛
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
