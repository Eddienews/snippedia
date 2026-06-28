import React from "react";

type Props = { count?: number };

const SkeletonList: React.FC<Props> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-black/50 border border-white/10 rounded-2xl p-4 md:p-6"
        >
          <div className="flex gap-4">
            <div className="w-28 h-28 md:w-36 md:h-36 bg-white/10 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonList;
