import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Swords } from "lucide-react";
import styles from "./Header.module.css";

export const Header: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.row}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Swords className="h-6 w-6 text-white" />
            </div>
            <span className={styles.logoText}>Agent Arena</span>
          </Link>

          <nav className={styles.nav}>
            <Link to="/" className={`tab-button ${isActive("/") ? "active" : ""}`}>
              首页
            </Link>
            <Link
              to="/strategies"
              className={`tab-button ${isActive("/strategies") ? "active" : ""}`}
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
