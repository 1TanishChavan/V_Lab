import React from "react";
import Navbar from "./Navbar";
import { Toaster } from "./ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />

      {/* Flex-grow ensures this section takes remaining height */}
      <main className="flex-grow w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <Toaster />
    </div>
  );
};

export default Layout;
