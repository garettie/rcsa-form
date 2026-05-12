import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Risk } from '../types';
import { RISK_COLORS, RESIDUAL_RISK_LABELS, ICONS } from '../constants';
import { getRiskLevel } from '../hooks/useRCSA';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, X } from 'lucide-react';

interface RiskTableProps {
    risks: Risk[];
    page: number;
    onView: (risk: Risk) => void;
    onEdit: (risk: Risk) => void;
    onDelete: (id: string) => void;
    onPageChange: (newPage: number) => void;
}

const PAGE_SIZE = 20;

type SortColumn = 'process_name' | 'residual_risk_score' | null;
type SortDir = 'asc' | 'desc' | null;

export default function RiskTable({
    risks,
    page,
    onView,
    onEdit,
    onDelete,
    onPageChange,
}: RiskTableProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [processFilter, setProcessFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
    const [levelFilter, setLevelFilter] = useState<Set<number>>(new Set());
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);

    const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const filterBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const hasActiveFilters = processFilter || statusFilter.size > 0 || levelFilter.size > 0;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!openDropdown) return;
            const target = e.target as Node;
            const dropdown = dropdownRefs.current[openDropdown];
            const btn = filterBtnRefs.current[openDropdown];
            if (dropdown && !dropdown.contains(target) && btn && !btn.contains(target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    const toggleDropdown = (name: string) => {
        setOpenDropdown(open => open === name ? null : name);
    };

    const filteredRisks = useMemo(() => {
        let result = [...risks];

        if (processFilter) {
            const q = processFilter.toLowerCase();
            result = result.filter(r =>
                r.process_name.toLowerCase().includes(q)
            );
        }

        if (statusFilter.size > 0) {
            result = result.filter(r => statusFilter.has(r.status));
        }

        if (levelFilter.size > 0) {
            result = result.filter(r => levelFilter.has(getRiskLevel(r.residual_risk_score)));
        }

        if (sortColumn && sortDir) {
            result.sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];
                const cmp = typeof aVal === 'string'
                    ? aVal.localeCompare(bVal as string)
                    : (aVal as number) - (bVal as number);
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }

        return result;
    }, [risks, processFilter, statusFilter, levelFilter, sortColumn, sortDir]);

    const clearFilters = useCallback(() => {
        setProcessFilter('');
        setStatusFilter(new Set());
        setLevelFilter(new Set());
        setSortColumn(null);
        setSortDir(null);
        setOpenDropdown(null);
        onPageChange(0);
    }, [onPageChange]);

    const handleSort = (col: SortColumn) => {
        if (sortColumn !== col) {
            setSortColumn(col);
            setSortDir('asc');
        } else if (sortDir === 'asc') {
            setSortDir('desc');
        } else if (sortDir === 'desc') {
            setSortColumn(null);
            setSortDir(null);
        }
    };

    const toggleStatus = (s: string) => {
        setStatusFilter(prev => {
            const next = new Set(prev);
            if (next.has(s)) next.delete(s); else next.add(s);
            return next;
        });
        onPageChange(0);
    };

    const toggleLevel = (l: number) => {
        setLevelFilter(prev => {
            const next = new Set(prev);
            if (next.has(l)) next.delete(l); else next.add(l);
            return next;
        });
        onPageChange(0);
    };

    const effectivePage = filteredRisks.length === 0 ? 0 : (page > Math.ceil(filteredRisks.length / PAGE_SIZE) - 1 ? 0 : page);
    const paginatedRisks = filteredRisks.slice(effectivePage * PAGE_SIZE, (effectivePage + 1) * PAGE_SIZE);
    const totalPages = Math.ceil(filteredRisks.length / PAGE_SIZE);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="m-0 text-lg font-bold text-slate-800 flex items-center gap-2">
                    Logged Risks
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors ${hasActiveFilters ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                        {hasActiveFilters ? `${filteredRisks.length}/${risks.length}` : risks.length}
                    </span>
                </h2>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={12} /> Clear filters
                    </button>
                )}
            </div>

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="relative">
                                <div className="flex items-center gap-0.5">
                                    <span>Process</span>
                                    <button
                                        ref={el => { filterBtnRefs.current['process'] = el; }}
                                        onClick={() => toggleDropdown('process')}
                                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${processFilter ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                        aria-label="Filter by process"
                                    >
                                        <Filter size={11} />
                                    </button>
                                    <button
                                        onClick={() => handleSort('process_name')}
                                        className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                        aria-label="Sort by process"
                                    >
                                        {sortColumn === 'process_name' ? (
                                            sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                                        ) : (
                                            <ArrowUpDown size={11} />
                                        )}
                                    </button>
                                    {openDropdown === 'process' && (
                                        <div
                                            ref={el => { dropdownRefs.current['process'] = el; }}
                                            className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
                                        >
                                            <div className="relative">
                                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={processFilter}
                                                    onChange={e => { setProcessFilter(e.target.value); onPageChange(0); }}
                                                    placeholder="Search process..."
                                                    className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-2 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                                                    autoFocus
                                                />
                                                {processFilter && (
                                                    <button onClick={() => { setProcessFilter(''); onPageChange(0); }} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </th>
                            <th className="min-w-[300px]">Risk Description</th>
                            <th className="min-w-[140px] relative">
                                <div className="flex items-center gap-0.5">
                                    <span>Residual Risk</span>
                                    <button
                                        ref={el => { filterBtnRefs.current['level'] = el; }}
                                        onClick={() => toggleDropdown('level')}
                                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${levelFilter.size > 0 ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                        aria-label="Filter by risk level"
                                    >
                                        <Filter size={11} />
                                    </button>
                                    <button
                                        onClick={() => handleSort('residual_risk_score')}
                                        className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                        aria-label="Sort by residual risk"
                                    >
                                        {sortColumn === 'residual_risk_score' ? (
                                            sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                                        ) : (
                                            <ArrowUpDown size={11} />
                                        )}
                                    </button>
                                    {openDropdown === 'level' && (
                                        <div
                                            ref={el => { dropdownRefs.current['level'] = el; }}
                                            className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
                                        >
                                            <div className="space-y-1">
                                                {[
                                                    { label: 'Low', value: 1 },
                                                    { label: 'Medium', value: 2 },
                                                    { label: 'High', value: 3 },
                                                    { label: 'Critical', value: 4 },
                                                ].map(opt => (
                                                    <label key={opt.value} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={levelFilter.has(opt.value)}
                                                            onChange={() => toggleLevel(opt.value)}
                                                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                                        />
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS[opt.value as keyof typeof RISK_COLORS] }} />
                                                            {opt.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </th>
                            <th className="min-w-[120px] text-center relative">
                                <div className="flex items-center justify-center gap-0.5">
                                    <span>Status</span>
                                    <button
                                        ref={el => { filterBtnRefs.current['status'] = el; }}
                                        onClick={() => toggleDropdown('status')}
                                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${statusFilter.size > 0 ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                        aria-label="Filter by status"
                                    >
                                        <Filter size={11} />
                                    </button>
                                    {openDropdown === 'status' && (
                                        <div
                                            ref={el => { dropdownRefs.current['status'] = el; }}
                                            className="absolute left-1/2 top-full z-50 mt-1 w-40 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
                                        >
                                            <div className="space-y-1">
                                                {['Open', 'In Progress', 'Closed'].map(s => (
                                                    <label key={s} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={statusFilter.has(s)}
                                                            onChange={() => toggleStatus(s)}
                                                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                                        />
                                                        {s}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </th>
                            <th className="min-w-[100px] text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredRisks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Filter size={20} className="text-slate-300" />
                                        <span className="text-sm text-slate-400">
                                            {hasActiveFilters ? 'No risks match your filters.' : 'No risks logged yet.'}
                                        </span>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedRisks.map(r => {
                                const rl = getRiskLevel(r.residual_risk_score);
                                return (
                                    <tr key={r.id} className="hover:bg-slate-50 even:bg-slate-50/50 transition-colors">
                                        <td className="font-medium text-slate-700">{r.process_name}</td>
                                        <td className="max-w-xl whitespace-normal break-words text-slate-600">{r.risk_description}</td>
                                        <td className="whitespace-nowrap">
                                            <span className="rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider" style={{ background: `${RISK_COLORS[rl as keyof typeof RISK_COLORS]}18`, color: RISK_COLORS[rl as keyof typeof RISK_COLORS] }}>
                                                {r.residual_risk_score} - {RESIDUAL_RISK_LABELS[rl as keyof typeof RESIDUAL_RISK_LABELS]}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap text-center">
                                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${r.status === 'Open' ? 'bg-amber-100 text-amber-700' : r.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center gap-1">
                                                <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400" onClick={() => onView(r)} title="View" aria-label="View risk"><ICONS.view size={16} /></button>
                                                <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400" onClick={() => onEdit(r)} title="Edit" aria-label="Edit risk"><ICONS.edit size={16} /></button>
                                                <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400" onClick={() => onDelete(r.id)} title="Delete" aria-label="Delete risk"><ICONS.trash size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <button className="rounded-lg bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400" disabled={effectivePage === 0} onClick={() => onPageChange(effectivePage - 1)}>Previous</button>
                    <span className="text-xs text-slate-400">Page {effectivePage + 1} of {totalPages}</span>
                    <button className="rounded-lg bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400" disabled={effectivePage + 1 >= totalPages} onClick={() => onPageChange(effectivePage + 1)}>Next</button>
                </div>
            )}
        </div>
    );
}
