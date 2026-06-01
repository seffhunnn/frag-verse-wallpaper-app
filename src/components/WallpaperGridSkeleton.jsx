import { useMemo } from 'react';
import SkeletonCard from './SkeletonCard';

export const SKELETON_RATIOS = ['3/4', '4/5', '16/10', '4/5', '3/4', '3/5', '4/5', '16/10', '3/4', '4/5'];

export const InitialSkeletonGrid = ({ numCols }) => {
  const skeletonColumns = useMemo(() => {
    const cols = Array.from({ length: numCols }, () => []);
    Array.from({ length: 10 }).forEach((_, i) => cols[i % numCols].push(i));
    return cols;
  }, [numCols]);

  return (
    <>
      {skeletonColumns.map((col, ci) => (
        <div key={`sk-col-${ci}`} className="flex-1 flex flex-col gap-2 sm:gap-2.5 min-w-0">
          {col.map((i) => (
            <SkeletonCard key={`sk-${i}`} aspectRatio={SKELETON_RATIOS[i % SKELETON_RATIOS.length]} />
          ))}
        </div>
      ))}
    </>
  );
};

export const AppendSkeletonGrid = ({ numCols }) => {
  return (
    <div className="flex gap-2 sm:gap-2.5 items-start mt-2 w-full">
      {Array.from({ length: numCols }).map((_, ci) => (
        <div key={`append-sk-col-${ci}`} className="flex-1 flex flex-col gap-2 sm:gap-2.5 min-w-0">
          <SkeletonCard aspectRatio={SKELETON_RATIOS[(ci * 2) % SKELETON_RATIOS.length]} />
        </div>
      ))}
    </div>
  );
};
