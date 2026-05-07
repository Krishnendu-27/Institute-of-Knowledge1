export const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
    <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
      {Icon && <Icon className="text-indigo-500" size={20} />}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
    </div>
    {children}
  </div>
);
