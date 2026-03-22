import { motion } from 'framer-motion';

const CategoryCard = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 pt-6 pb-2 px-2 text-[17px] transition-colors duration-300 cursor-pointer group
        ${active
          ? 'text-slate-900 dark:text-white font-extrabold scale-110'
          : 'text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-slate-200 font-medium'
        }
      `}
    >
      <span className="relative z-10 transition-transform duration-300">
        {label}
      </span>
      
      {/* Animated Sliding Underline */}
      {active && (
        <motion.div 
          layoutId="activeCategoryUnderline"
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500"
          initial={false}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      {/* Hover hint */}
      {!active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 scale-x-0 group-hover:scale-x-50 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
      )}
    </button>
  );
};

export default CategoryCard;
