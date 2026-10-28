export interface FieldMetadata {
  type: string;
  required: boolean;
  allowedValues?: string[];
}

export interface SearchOptionMetadata {
  id: number;
  searchOptionName: string;
  searchCondition: Record<string, FieldMetadata>;
  displayOrder: number;
}

export interface SearchOptionsApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: SearchOptionMetadata[];
  timestamp: string;
}

interface FilterValue {
  [key: string]: string | number | undefined;
}

export interface ActiveFilter {
  id: number;
  searchOptionName: string;
  searchCondition: Record<string, FieldMetadata>;
  values: FilterValue;
}
