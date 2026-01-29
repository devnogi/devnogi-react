export interface ItemOptionInfo {
  optionType: string;
  optionSubType: string;
  optionValue: string;
  optionValue2: string;
  optionDesc: string;
}

export interface ItemOptionInfoGroup {
  optionType: string;
  items: ItemOptionInfo[];
}
