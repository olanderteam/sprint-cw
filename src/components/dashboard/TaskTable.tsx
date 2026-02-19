import { useState, useMemo } from 'react';
import { TaskItem } from '@/types/dashboard';
import { ChevronDown, ChevronUp, Search, Download } from 'lucide-react';

interface Props {
  tasks: TaskItem[];
}

type SortKey = 'key' | 'summary' | 'squad' | 'assignee' | 'status' | 'priority' | 'storyPoints' | 'type';
type SortDir = 'asc' | 'desc';

const priorityOrder = { High: 0, Medium: 1, Low: 2 };
const statusOrder = { 'To Do': 0, 'In Progress': 1, 'In Review': 2, Done: 3 };

const statusBadge: Record<string, string> = {
  Done: 'badge-success',
  'In Progress': 'bg-primary/10 text-primary',
  'In Review': 'badge-warning',
  'To Do': 'bg-muted text-muted-foreground',
};

const priorityBadge: Record<string, string> = {
  High: 'badge-critical',
  Medium: 'badge-warning',
  Low: 'badge-success',
};

const ROWS_PER_PAGE = 8;

const TaskTable = ({ tasks }: Props) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('key');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterSquad, setFilterSquad] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const squads = useMemo(() => Array.from(new Set(tasks.map(t => t.squad))), [tasks]);

  const filtered = useMemo(() => {
    let result = tasks;
    if (filterSquad !== 'all') result = result.filter(t => t.squad === filterSquad);
    if (filterStatus !== 'all') result = result.filter(t => t.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.key.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q));
    }
    return result;
  }, [tasks, filterSquad, filterStatus, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'priority') cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
      else if (sortKey === 'status') cmp = statusOrder[a.status] - statusOrder[b.status];
      else if (sortKey === 'storyPoints') cmp = a.storyPoints - b.storyPoints;
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / ROWS_PER_PAGE);
  const pageData = sorted.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const exportCsv = () => {
    const headers = ['Key', 'Summary', 'Squad', 'Assignee', 'Status', 'Priority', 'SP', 'Type'];
    const rows = sorted.map(t => [t.key, t.summary, t.squad, t.assignee, t.status, t.priority, t.storyPoints, t.type]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sprint-tasks.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />;
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => setIsCollapsed(c => !c)} className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          Sprint Tasks
          <span className="text-xs font-normal text-muted-foreground">({filtered.length})</span>
        </button>
        {!isCollapsed && (
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Download className="h-3 w-3" /> Export CSV
          </button>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Filters */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search tasks..."
                className="h-7 w-44 rounded-md border border-border bg-background pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <select value={filterSquad} onChange={e => { setFilterSquad(e.target.value); setPage(0); }} className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="all">All Squads</option>
              {squads.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0); }} className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="all">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {([['key', 'Key'], ['summary', 'Summary'], ['squad', 'Squad'], ['assignee', 'Assignee'], ['status', 'Status'], ['priority', 'Priority'], ['storyPoints', 'SP'], ['type', 'Type']] as [SortKey, string][]).map(([k, label]) => (
                    <th key={k} onClick={() => toggleSort(k)} className="cursor-pointer pb-2 pr-3 text-left font-medium text-muted-foreground hover:text-foreground whitespace-nowrap">
                      {label} <SortIcon col={k} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map(t => (
                  <tr key={t.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 font-mono font-medium text-primary">{t.key}</td>
                    <td className="py-2 pr-3 max-w-[240px] truncate text-foreground">{t.summary}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">{t.squad}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-foreground">{t.assignee}</td>
                    <td className="py-2 pr-3"><span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge[t.status]}`}>{t.status}</span></td>
                    <td className="py-2 pr-3"><span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityBadge[t.priority]}`}>{t.priority}</span></td>
                    <td className="py-2 pr-3 font-semibold text-foreground">{t.storyPoints}</td>
                    <td className="py-2 text-muted-foreground">{t.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground disabled:opacity-40 hover:bg-accent">Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground disabled:opacity-40 hover:bg-accent">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskTable;
