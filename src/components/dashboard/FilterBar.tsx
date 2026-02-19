import { FilterOption } from '@/types/dashboard';

interface FilterBarProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

const filters: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All Squads' },
  { value: 'at-risk', label: 'At Risk' },
  { value: 'critical', label: 'Critical' },
];

const FilterBar = ({ activeFilter, onFilterChange }: FilterBarProps) => {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
      {filters.map(f => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeFilter === f.value
              ? 'bg-foreground text-card'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
