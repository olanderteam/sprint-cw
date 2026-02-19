import { useState } from 'react';
import { Filter, X } from 'lucide-react';

export interface FilterValues {
  assignee: string[];
  priority: string[];
  status: string[];
  issueType: string[];
  squad: string[];
  sprint: string[];
}

interface AdvancedFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  availableOptions: {
    assignees: string[];
    priorities: string[];
    statuses: string[];
    issueTypes: string[];
    squads: string[];
    sprints: string[];
  };
}

const AdvancedFilters = ({ filters, onFiltersChange, availableOptions }: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = (category: keyof FilterValues, value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    onFiltersChange({ ...filters, [category]: updated });
  };

  const clearFilters = () => {
    onFiltersChange({
      assignee: [],
      priority: [],
      status: [],
      issueType: [],
      squad: [],
      sprint: [],
    });
  };

  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filtros
        {activeFilterCount > 0 && (
          <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full z-50 mt-2 w-[700px] max-h-[600px] overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Filtros Avançados</h3>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Limpar tudo
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4">
              {/* Sprint Filter */}
              <FilterSection
                title="Sprint"
                options={availableOptions.sprints}
                selected={filters.sprint}
                onToggle={(value) => toggleFilter('sprint', value)}
              />

              {/* Squad Filter */}
              <FilterSection
                title="Squad"
                options={availableOptions.squads}
                selected={filters.squad}
                onToggle={(value) => toggleFilter('squad', value)}
              />

              {/* Assignee Filter */}
              <FilterSection
                title="Responsável"
                options={availableOptions.assignees}
                selected={filters.assignee}
                onToggle={(value) => toggleFilter('assignee', value)}
              />

              {/* Priority Filter */}
              <FilterSection
                title="Prioridade"
                options={availableOptions.priorities}
                selected={filters.priority}
                onToggle={(value) => toggleFilter('priority', value)}
              />

              {/* Status Filter */}
              <FilterSection
                title="Status"
                options={availableOptions.statuses}
                selected={filters.status}
                onToggle={(value) => toggleFilter('status', value)}
              />

              {/* Issue Type Filter */}
              <FilterSection
                title="Tipo de Issue"
                options={availableOptions.issueTypes}
                selected={filters.issueType}
                onToggle={(value) => toggleFilter('issueType', value)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

const FilterSection = ({ title, options, selected, onToggle }: FilterSectionProps) => {
  if (options.length === 0) return null;

  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title} ({options.length})
      </h4>
      <div className="space-y-1 max-h-48 overflow-y-auto border border-border rounded-md p-2 bg-accent/30">
        {options.map(option => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5 transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary flex-shrink-0"
            />
            <span className="text-sm text-foreground truncate" title={option}>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default AdvancedFilters;
