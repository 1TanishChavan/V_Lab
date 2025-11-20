import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // Close when clicking backdrop
    >
      <div
        className="relative w-full max-w-md rounded-lg border bg-background p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md p-0 opacity-70 hover:opacity-100 transition-opacity"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
