import React from "react";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      <main className="flex-1 w-full py-8 md:py-12 relative z-10">
        <div className="container-wide">
          <div className="animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
};
