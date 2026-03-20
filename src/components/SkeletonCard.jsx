// Shimmer skeleton card displayed while wallpapers are loading
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-dark-700 border border-white/5 animate-pulse">
    {/* Image placeholder */}
    <div className="w-full aspect-[16/10] shimmer-bg" />

    {/* Footer placeholder */}
    <div className="px-3 py-3 flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 bg-white/10 rounded w-3/4" />
        <div className="h-2 bg-white/8 rounded w-1/2" />
      </div>
      <div className="h-2 bg-white/8 rounded w-10 flex-shrink-0" />
    </div>
  </div>
);

export default SkeletonCard;
