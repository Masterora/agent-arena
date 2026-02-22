import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Swords } from "lucide-react";

export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="glass border-b border-slate-700/50 sticky top-0 z-50 shadow-xl shadow-indigo-500/10">
      <div className="container-wide">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <div className="p-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg group-hover:shadow-lg group-hover:shadow-indigo-500/40 transition-all">
              <Swords className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">
              Agent Arena
            </span>
          </Link>

          <nav className="flex gap-8 items-center">
            <Link
              to="/"
              className={`tab-button ${isActive("/") ? "active" : ""}`}
            >
              首页
            </Link>
            <Link
              to="/strategies"
              className={`tab-button ${
                isActive("/strategies") ? "active" : ""
              }`}
            >
              策略
            </Link>
            <Link
              to="/matches"
              className={`tab-button ${isActive("/matches") ? "active" : ""}`}
            >
              比赛
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
