const CategoryCard = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer
        ${active
          ? 'text-gradient border-b-2 border-purple-500'
          : 'text-slate-500 hover:text-slate-200 border-b-2 border-transparent'
        }
      `}
    >
      {label}
    </button>
  );
};

export default CategoryCard;
