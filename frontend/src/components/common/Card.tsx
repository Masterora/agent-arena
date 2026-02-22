import React from "react";
import { cn } from "../../utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, title }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-primary-200 transition-all duration-200",
        className,
      )}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
