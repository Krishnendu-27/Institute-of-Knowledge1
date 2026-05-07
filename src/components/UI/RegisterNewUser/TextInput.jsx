import { AlertCircle } from "lucide-react";

export const TextInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  error,
  disabled,
  maxLength,
}) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      maxLength={maxLength}
      className={`w-full px-4 py-3 rounded-xl border ${
        error
          ? "border-amber-400 focus:ring-amber-400"
          : "border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
      } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-all`}
    />
    {error && (
      <p className="text-amber-500 text-xs mt-2 flex items-center gap-1">
        <AlertCircle size={14} /> {error}
      </p>
    )}
  </div>
);
