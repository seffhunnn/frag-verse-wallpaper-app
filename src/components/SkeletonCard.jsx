// Shimmer skeleton card displayed while wallpapers are loading
const SkeletonCard = ({ isFeatured = false }) => (
  <div className={`w-full h-full rounded-2xl overflow-hidden bg-white dark:bg-dark-700 border border-slate-100 dark:border-white/5 animate-pulse transition-colors duration-500 shadow-sm dark:shadow-none flex flex-col min-h-[350px]`}>
    {/* Image placeholder */}
    <div className={`w-full flex-1 bg-slate-100 dark:bg-dark-600 shimmer-bg`} />

    {/* Footer placeholder */}
    <div className="px-3 py-3 flex items-center gap-2 flex-shrink-0">
      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
        <div className="h-2 bg-slate-100 dark:bg-white/8 rounded w-1/2" />
      </div>
      <div className="h-2 bg-slate-100 dark:bg-white/8 rounded w-10 flex-shrink-0" />
    </div>
  </div>
);

export default SkeletonCard;
