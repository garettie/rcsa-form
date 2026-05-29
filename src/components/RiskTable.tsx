import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Risk } from '../types';
import { RISK_COLORS, RESIDUAL_RISK_LABELS, ICONS } from '../constants';
import { getRiskLevel } from '../hooks/useRCSA';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, X, Download, ChevronDown } from 'lucide-react';

interface RiskTableProps {
    risks: Risk[];
    page: number;
    onView: (risk: Risk) => void;
    onEdit: (risk: Risk) => void;
    onDelete: (id: string) => void;
    onPageChange: (newPage: number) => void;
}

const PAGE_SIZE = 20;

const CSV_COLUMNS: { header: string; key: keyof Risk }[] = [
    { header: 'Department', key: 'department' },
    { header: 'Process', key: 'process_name' },
    { header: 'Assessment Period', key: 'assessment_period' },
    { header: 'Risk Description', key: 'risk_description' },
    { header: 'Possible Causes', key: 'possible_causes' },
    { header: 'Root Cause', key: 'root_cause' },
    { header: 'Event Type', key: 'event_type' },
    { header: 'Likelihood', key: 'likelihood_score' },
    { header: 'Impact', key: 'impact_score' },
    { header: 'Inherent Risk Score', key: 'inherent_risk_score' },
    { header: 'Control Description', key: 'control_description' },
    { header: 'Control Type', key: 'control_type' },
    { header: 'Control Design', key: 'control_design_score' },
    { header: 'Control Implementation', key: 'control_implementation_score' },
    { header: 'Controls Rating', key: 'controls_rating' },
    { header: 'Residual Risk Score', key: 'residual_risk_score' },
    { header: 'Risk Treatment', key: 'risk_treatment' },
    { header: 'Action Plan', key: 'action_plan' },
    { header: 'Action Plan Deadline', key: 'action_plan_deadline' },
    { header: 'Status', key: 'status' },
];

function escapeCsvValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function exportToCsv(risks: Risk[], filtered: boolean): void {
    const header = CSV_COLUMNS.map(c => c.header).join(',');
    const rows = risks.map(r =>
        CSV_COLUMNS.map(c => escapeCsvValue(r[c.key])).join(',')
    );
    const csv = [header, ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const suffix = filtered ? '-filtered' : '';
    const a = document.createElement('a');
    a.href = url;
    a.download = `rcsa-risks${suffix}-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

type SortColumn = 'process_name' | 'residual_risk_score' | null;
type SortDir = 'asc' | 'desc' | null;

const LEVEL_OPTIONS = [
    { label: 'Minor', value: 1 },
    { label: 'Moderate', value: 2 },
    { label: 'Major', value: 3 },
    { label: 'Critical', value: 4 },
];

const STATUS_OPTIONS = ['Open', 'In Progress', 'Closed'];

export default function RiskTable({
    risks,
    page,
    onView,
    onEdit,
    onDelete,
    onPageChange,
}: RiskTableProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [processFilter, setProcessFilter] = useState<Set<string>>(new Set());
    const [processSearch, setProcessSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
    const [levelFilter, setLevelFilter] = useState<Set<number>>(new Set());
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);

    const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const filterBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const hasActiveFilters = processFilter.size > 0 || statusFilter.size > 0 || levelFilter.size > 0;

    const uniqueProcesses = useMemo(
        () => [...new Set(risks.map(r => r.process_name))].sort(),
        [risks]
    );

    const visibleProcesses = useMemo(() => {
        if (!processSearch.trim()) return uniqueProcesses;
        const q = processSearch.toLowerCase();
        return uniqueProcesses.filter(p => p.toLowerCase().includes(q));
    }, [uniqueProcesses, processSearch]);

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

        if (processFilter.size > 0) {
            result = result.filter(r => processFilter.has(r.process_name));
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
        setProcessFilter(new Set());
        setProcessSearch('');
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

    const toggleProcess = (name: string) => {
        setProcessFilter(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name); else next.add(name);
            return next;
        });
        onPageChange(0);
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

    // Shared filter button class builders
    const filterBtnCls = (active: boolean, open: boolean) =>
        `flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${active || open
            ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300'
        }`;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            {/* Header row */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="m-0 text-lg font-bold text-slate-800 flex items-center gap-2">
                    Logged Risks
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors ${hasActiveFilters ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                        {hasActiveFilters ? `${filteredRisks.length}/${risks.length}` : risks.length}
                    </span>
                </h2>
                <div className="flex items-center gap-3">
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={12} /> Clear filters
                        </button>
                    )}
                    <button
                        onClick={() => exportToCsv(filteredRisks, hasActiveFilters)}
                        disabled={filteredRisks.length === 0}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Download size={13} />
                        {hasActiveFilters ? `Export Filtered (${filteredRisks.length})` : 'Export CSV'}
                    </button>
                </div>
            </div>

            {/* Filter bar */}
            {risks.length > 0 && (
                <div className="mb-5 flex items-center gap-2">

                    {/* Process filter */}
                    <div className="relative">
                        <button
                            ref={el => { filterBtnRefs.current['process'] = el; }}
                            onClick={() => toggleDropdown('process')}
                            className={filterBtnCls(processFilter.size > 0, openDropdown === 'process')}
                            aria-label="Filter by process"
                        >
                            Process
                            {processFilter.size > 0 && (
                                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                                    {processFilter.size}
                                </span>
                            )}
                            <ChevronDown size={12} className={`transition-transform ${openDropdown === 'process' ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === 'process' && (
                            <div
                                ref={el => { dropdownRefs.current['process'] = el; }}
                                className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-slate-200 bg-white shadow-lg"
                            >
                                {/* Search input */}
                                <div className="p-2.5 border-b border-slate-100">
                                    <div className="relative">
                                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={processSearch}
                                            onChange={e => setProcessSearch(e.target.value)}
                                            placeholder="Search processes..."
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-2 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                                            autoFocus
                                        />
                                        {processSearch && (
                                            <button
                                                onClick={() => setProcessSearch('')}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {/* Scrollable checkbox list */}
                                <div className="max-h-48 overflow-y-auto p-2">
                                    {visibleProcesses.length === 0 ? (
                                        <p className="px-2 py-3 text-center text-xs text-slate-400">No matches</p>
                                    ) : (
                                        visibleProcesses.map(name => (
                                            <label key={name} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={processFilter.has(name)}
                                                    onChange={() => toggleProcess(name)}
                                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                                />
                                                <span className="truncate">{name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {processFilter.size > 0 && (
                                    <div className="border-t border-slate-100 px-3 py-2">
                                        <button
                                            onClick={() => { setProcessFilter(new Set()); setProcessSearch(''); onPageChange(0); }}
                                            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            Clear selection
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Risk Level filter */}
                    <div className="relative">
                        <button
                            ref={el => { filterBtnRefs.current['level'] = el; }}
                            onClick={() => toggleDropdown('level')}
                            className={filterBtnCls(levelFilter.size > 0, openDropdown === 'level')}
                            aria-label="Filter by risk level"
                        >
                            Residual Risk
                            {levelFilter.size > 0 && (
                                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                                    {levelFilter.size}
                                </span>
                            )}
                            <ChevronDown size={12} className={`transition-transform ${openDropdown === 'level' ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === 'level' && (
                            <div
                                ref={el => { dropdownRefs.current['level'] = el; }}
                                className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
                            >
                                {LEVEL_OPTIONS.map(opt => (
                                    <label key={opt.value} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={levelFilter.has(opt.value)}
                                            onChange={() => toggleLevel(opt.value)}
                                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                        />
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: RISK_COLORS[opt.value as keyof typeof RISK_COLORS] }} />
                                            {opt.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <button
                            ref={el => { filterBtnRefs.current['status'] = el; }}
                            onClick={() => toggleDropdown('status')}
                            className={filterBtnCls(statusFilter.size > 0, openDropdown === 'status')}
                            aria-label="Filter by status"
                        >
                            Status
                            {statusFilter.size > 0 && (
                                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                                    {statusFilter.size}
                                </span>
                            )}
                            <ChevronDown size={12} className={`transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === 'status' && (
                            <div
                                ref={el => { dropdownRefs.current['status'] = el; }}
                                className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
                            >
                                {STATUS_OPTIONS.map(s => (
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
                        )}
                    </div>

                </div>
            )}

            {/* Table */}
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>
                                <div className="flex items-center gap-1">
                                    <span>Process</span>
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
                                </div>
                            </th>
                            <th className="min-w-[300px]">Risk Description</th>
                            <th className="min-w-[140px]">
                                <div className="flex items-center gap-1">
                                    <span>Residual Risk</span>
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
                                </div>
                            </th>
                            <th className="min-w-[120px] text-center">Status</th>
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
