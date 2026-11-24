'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
  label,
  options = [],
  value,
  onChange,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listboxId = useId();

  const selectedOption =
    options.find((opt) => String(opt.value) === String(value)) || options[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        const currentIndex = options.findIndex((opt) => String(opt.value) === String(value));
        setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
      } else if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.length - 1);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    }
  }

  function handleSelect(optValue) {
    onChange(optValue);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#7B5D69] mb-1.5">
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border text-left flex items-center justify-between gap-2 text-xs font-medium transition-all select-none ${
          isOpen
            ? 'bg-white border-[#B02F5E] ring-2 ring-[#B02F5E]/15 text-[#12233F] shadow-sm'
            : 'bg-[#FFF4F3]/60 hover:bg-[#FFF4F3] border-[#F5D5DB] text-[#12233F]'
        }`}
      >
        <span className="truncate pr-1">
          {selectedOption?.label || selectedOption?.name || 'Select'}
        </span>
        <ChevronDown
          size={15}
          strokeWidth={2}
          className={`shrink-0 text-[#7B5D69] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#B02F5E]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popup - Strictly matches parent container width, never overflows */}
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 w-full max-h-60 overflow-y-auto rounded-xl bg-white border border-[#F5D5DB] shadow-xl z-50 py-1.5 text-xs text-[#12233F] animate-fade-in focus:outline-none"
        >
          {options.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = idx === highlightedIndex;

            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`min-h-[40px] px-3.5 py-2.5 cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                  isSelected
                    ? 'bg-[#FFF4F3] text-[#B02F5E] font-semibold'
                    : isHighlighted
                    ? 'bg-[#FCE4E8]/50 text-[#12233F]'
                    : 'text-[#12233F] hover:bg-[#FFF4F3]'
                }`}
              >
                <span className="truncate">{opt.label || opt.name}</span>
                {isSelected && (
                  <Check size={14} strokeWidth={2.5} className="shrink-0 text-[#B02F5E]" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
