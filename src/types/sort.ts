export type {SortOption, SortDirection}
// Type for sorting options
type SortOption = {
    key: string;
    label: string;
    icon: React.ReactNode;
  }
  type SortDirection = "asc" | "desc";