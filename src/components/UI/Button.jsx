import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export const Button = ({
  buttonType,
  disabledCondition,
  isLoading,
  buttonName,
}) => {
  return (
    <button
      type={buttonType}
      disabled={disabledCondition}
      className="disabled:bg-primary/70 w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/30 hover:opacity-90 transition flex justify-center items-center"
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white border-b-transparent rounded-full inline-block animate-spin" />
      ) : (
        buttonName
      )}
    </button>
  );
};

export default function BackButton({ details }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-4">
      <div
        onClick={() => navigate(-1)}
        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
      >
        <ArrowLeft size={20} />
      </div>
      <div>
        <h1 className="text-slate-500 hover:text-indigo-600 transition-colors font-medium text-lg">
          Back
        </h1>
        <p className="text-sm text-slate-500">{details}</p>
      </div>
    </div>
  );
}
