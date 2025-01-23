'use client';

import React, { useEffect, useState } from 'react';

interface LoadingBarProps {
    isLoading: boolean;
    progress?: number;
  }

  const LoadingBar: React.FC<LoadingBarProps> = ({ isLoading, progress = 0 }) => {
    const [localProgress, setLocalProgress] = useState(0);
  const [showSlowLoadingAlert, setShowSlowLoadingAlert] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer1 = setTimeout(() => setLocalProgress(30), 500);
      const timer2 = setTimeout(() => setLocalProgress(60), 1500);
      const timer3 = setTimeout(() => setShowSlowLoadingAlert(true), 5000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setLocalProgress(100);
      setShowSlowLoadingAlert(false);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-lg max-w-md w-full mx-4 border border-zinc-700">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              Loading NFT Collections
            </h3>
            <div className="w-full bg-zinc-700 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress || localProgress}%` }}
              />
            </div>
            <p className="text-sm text-zinc-400 mt-2">
              Fetching collection data...
            </p>
          </div>

          {showSlowLoadingAlert && (
            <div className="bg-red-900/20 border border-red-900 text-red-300 px-4 py-3 rounded relative">
              <strong className="font-bold">Hold on tight!</strong>
              <p className="text-sm mt-1">
  The loading is slow because we&apos;re loading images/data of multiple NFTs. We&apos;ll fix it soon!
</p>
            </div>
          )}

          <div className="flex justify-center">

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingBar;