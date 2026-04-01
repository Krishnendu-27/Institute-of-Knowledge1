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
