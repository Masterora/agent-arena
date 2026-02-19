import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="text-gray-600">加载中...</p>
      </div>
    </div>
  );
};
