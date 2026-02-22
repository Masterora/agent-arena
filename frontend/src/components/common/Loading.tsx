import React from "react";

export const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full blur-md opacity-50 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 border-r-primary-600 animate-spin" />
        </div>
        <p className="text-gray-600 font-medium">加载中...</p>
      </div>
    </div>
  );
};
