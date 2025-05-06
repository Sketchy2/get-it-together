export type {Filters,FilterSection}
// Type for sorting options
type FilterSection = {
  title: string;
  type: string;
  inputType: "checkbox" | "radio";
  options: { label: string; value: string }[];
};

type Filters = Record<string, string[] | string>;
