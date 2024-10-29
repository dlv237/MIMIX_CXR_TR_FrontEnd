const Tooltip = ({ message, tooltipClassName, children }) => {
  const tooltipClasses = `absolute top-10 scale-0 group-hover:scale-100 transition-all duration-75 bg-gray-800 text-white text-xs py-1 px-2 z-50 opacity-85 rounded-md ${tooltipClassName}`;

  return (
    <div className="relative flex justify-center group">
      {children}
      <span className={tooltipClasses}>{message}</span>
    </div>
  );
};

export default Tooltip;
