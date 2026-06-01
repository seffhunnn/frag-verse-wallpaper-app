const SkeletonCard = ({ isFeatured = false, className = '', aspectRatio = '4/3' }) => (
  <div
    className={`
      w-full overflow-hidden rounded-[16px]
      ${className || (isFeatured ? 'min-h-[380px]' : '')}
    `}
    style={!className ? { aspectRatio } : undefined}
  >
    <div className="w-full h-full min-h-[120px] fv-skeleton" style={{ aspectRatio: className ? undefined : aspectRatio }} />
  </div>
);

export default SkeletonCard;
