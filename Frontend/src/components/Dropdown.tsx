import React, { useState, useRef, useEffect } from "react";

interface DropdownProps {
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  id: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  onChange,
  placeholder,
  label,
  id,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedOption(null);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: { value: string; label: string }) => {
    setSearchTerm(option.label);
    setSelectedOption(option.value);
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 shadow-lg rounded-md max-h-60 overflow-auto">
          <ul>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleOptionSelect(option)}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500"
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500 dark:text-gray-400">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
