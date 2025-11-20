import React, { useEffect } from "react";
import { useThemeStore } from "../store/themeStore";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  // Apply dark mode class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="rounded-full"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-yellow-500 transition-all" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default DarkModeToggle;
