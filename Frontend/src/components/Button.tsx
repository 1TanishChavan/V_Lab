import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const getButtonClass = () => {
    const baseClass =
      "px-4 py-2 rounded-md text-white font-semibold transition-colors duration-300";
    switch (variant) {
      case "primary":
        return `${baseClass} bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600`;
      case "secondary":
        return `${baseClass} bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600`;
      case "warning":
        return `${baseClass} bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600`;
      case "danger":
        return `${baseClass} bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600`;
      default:
        return baseClass;
    }
  };

  return (
    <button className={`${getButtonClass()} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
