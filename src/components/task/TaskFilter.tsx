import React from 'react'
import FilterMenu from '../common/FilterMenu'
import { FilterSection,Filters } from '@/types/auxilary';

interface TaskFilterProps {
    filters: Filters;
    onChange: (type: string, value: string) => void;
    isOpen: boolean;
    toggleOpen: () => void;
  }

export default function TaskFilter({
    filters,
    onChange,
    isOpen,
    toggleOpen,
  }:TaskFilterProps) {
    const filterOptions:FilterSection[] = [
        {
          title: "Status",
          type: "status",
          inputType: "checkbox",
          options: [
            { label: "To Do", value: "To-Do" },
            { label: "In Progress", value: "In Progress" },
            { label: "Completed", value: "Completed" },
            { label: "Unassigned", value: "unassigned" },
          ],
        },
        {
          title: "Priority",
          type: "priority",
          inputType: "checkbox",
          options: [
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ],
        },
        {
          title: "Due Date",
          type: "deadline",
          inputType: "radio",
          options: [
            { label: "All", value: "all" },
            { label: "Today", value: "today" },
            { label: "This Week", value: "week" },
            { label: "This Month", value: "month" },
          ],
        },
      ];

  return (
                  <FilterMenu
                filters={filters}
                onChange={onChange}
                isOpen={isOpen}
                toggleOpen={toggleOpen}
                sections={filterOptions}
              />
  )
}
