declare module "@stackline/multiselect" {
  export interface StacklineMultiSelectOptions<TItem = Record<string, unknown>> {
    data?: TItem[];
    selected?: TItem[];
    settings?: Record<string, unknown>;
    onChange?: (items: TItem[]) => void;
    onSelect?: (item: TItem) => void;
    onDeSelect?: (item: TItem) => void;
  }

  export default class StacklineMultiSelect<TItem = Record<string, unknown>> {
    constructor(target: string | Element, options?: StacklineMultiSelectOptions<TItem>);
    setData(data: TItem[]): void;
    setSelected(items: TItem[]): void;
    getSelected(): TItem[];
    destroy(): void;
  }
}
