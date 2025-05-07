import { ReactNode } from "react";
import type {User} from "./assignment"
export type {Filters,FilterSection ,ViewMode,SortOption, SortDirection}

// Types for sorting options
type SortOption = {
    key: string;
    label: string;
    icon: React.ReactNode;
  }
  type SortDirection = "asc" | "desc";



// Types for Filtering options
type FilterSection = {
  title: string;
  type: string;
  inputType: "checkbox" | "radio";
  options: { label: string; value: string }[];
};

type Filters = Record<string, string[] | string>;



//View options

type ViewMode ={
  label:string
  icon?:React.ReactNode
}