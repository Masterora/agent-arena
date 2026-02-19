import React from 'react';
import { useParams } from 'react-router-dom';

const MatchDetail: React.FC = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">比赛详情</h1>
      <p className="text-gray-600">比赛 ID: {id}</p>
    </div>
  );
};

export default MatchDetail;
