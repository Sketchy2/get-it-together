import { Filters, FilterSection } from '@/types/auxilary';
import { Filter } from 'lucide-react';
import React, { useRef } from 'react'
import "./FilterMenu.css"
import { useOnClickOutside } from '@/utils/utils';



interface FilterProps {
  filters: Filters;
  onChange: (type: string, value: string) => void;
  isOpen: boolean;
  toggleOpen: () => void;
  sections: FilterSection[];
}

export default function FilterMenu({
    filters,
    sections,
    onChange,
    isOpen,
    toggleOpen,
  }:FilterProps) {
    const dropdownRef = useRef(null)
    useOnClickOutside(dropdownRef,toggleOpen)// fix this error
  return (
    <div className="filterContainer" >
    <button className="actionButton" onClick={toggleOpen}>
      <Filter size={18} />
      <span>Filter</span>
    </button>

    {isOpen && (
      <div className="filterMenu">
        {sections.map(({ title, type, inputType, options }) => (
          <div className="filterSection" key={type}>
            <h4>{title}</h4>
            <div className="filterOptions">
              {options.map(({ label, value }) => {
                const isChecked =
                  inputType === "checkbox"
                    ? (filters[type] as string[]).includes(value)
                    : filters[type] === value;

                return (
                  <label className="filterOption" key={value}>
                    <input
                      type={inputType}
                      name={type}
                      checked={isChecked}
                      onChange={() => onChange(type, value)}
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
//   
}
