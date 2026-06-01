import { useState, useMemo, useCallback, useRef, useEffect, Fragment } from 'react';
import type { Risk } from '../types';
import { RISK_COLORS, ICONS } from '../constants';
import { getRiskLevel } from '../hooks/useRCSA';
import { getRiskLevel as getRiskLevelString, getControlsLabel, RISK_TEXT, CONTROLS_LABEL_COLORS } from '../utils/riskLevels';
import { Search, ArrowUpDown, Filter, X, Download, ChevronDown, ChevronUp } from 'lucide-react';

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

interface ScoreBadgeProps {
    label: string | number;
    subLabel?: string | number;
    color: string;
    bgColor?: string;
    tooltip?: string;
}

function ScoreBadge({ label, subLabel, color, bgColor, tooltip }: ScoreBadgeProps) {
    return (
        <div
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-bold font-mono justify-center relative group/tip"
            style={{
                backgroundColor: bgColor || `${color}15`,
                color: color,
                borderColor: `${color}30`,
            }}
        >
            <span className="opacity-80">{label}</span>
            {subLabel !== undefined && (
                <>
                    <span className="w-px h-2 bg-current opacity-25" />
                    <span className="truncate">{subLabel}</span>
                </>
            )}
            {tooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[9px] font-medium rounded opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-lg">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    );
}

interface MiniBadgeProps {
    label: string | number;
    color: string;
    bgColor?: string;
}

function MiniBadge({ label, color, bgColor }: MiniBadgeProps) {
    return (
        <span
            className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold border"
            style={{
                backgroundColor: bgColor || `${color}15`,
                color: color,
                borderColor: `${color}30`,
            }}
        >
            {label}
        </span>
    );
}

const LEVEL_OPTIONS = [
    { label: 'Minor', value: 1 },
    { label: 'Moderate', value: 2 },
    { label: 'Major', value: 3 },
    { label: 'Critical', value: 4 },
];

const STATUS_OPTIONS = ['Open', 'In Progress', 'Closed'];

const STATUS_COLORS: Record<string, string> = {
    Open: '#d97706',
    Closed: '#059669',
    'In Progress': '#2563eb',
};

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
    const [processFilter, setProcessFilter] = useState<Set<string>>(new Set());
    const [processSearch, setProcessSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
    const [levelFilter, setLevelFilter] = useState<Set<number>>(new Set());
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

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

    const handlePageChange = useCallback((newPage: number) => {
        setExpandedRow(null);
        onPageChange(newPage);
    }, [onPageChange]);

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
                const aVal = a[sortColumn as keyof Risk];
                const bVal = b[sortColumn as keyof Risk];
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;
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
        handlePageChange(0);
    }, [handlePageChange]);

    const handleSort = (col: string) => {
        if (sortColumn !== col) {
            setSortColumn(col);
            setSortDir('asc');
        } else if (sortDir === 'asc') {
            setSortDir('desc');
        } else {
            setSortColumn(null);
            setSortDir(null);
        }
    };

    const renderSortIcon = (col: string) => {
        if (sortColumn !== col) {
            return <ArrowUpDown size={11} className="text-slate-300 transition-colors group-hover:text-slate-400" />;
        }
        return sortDir === 'asc'
            ? <ChevronUp size={11} className="text-blue-600" />
            : <ChevronDown size={11} className="text-blue-600" />;
    };

    const toggleProcess = (name: string) => {
        setProcessFilter(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name); else next.add(name);
            return next;
        });
        handlePageChange(0);
    };

    const toggleStatus = (s: string) => {
        setStatusFilter(prev => {
            const next = new Set(prev);
            if (next.has(s)) next.delete(s); else next.add(s);
            return next;
        });
        handlePageChange(0);
    };

    const toggleLevel = (l: number) => {
        setLevelFilter(prev => {
            const next = new Set(prev);
            if (next.has(l)) next.delete(l); else next.add(l);
            return next;
        });
        handlePageChange(0);
    };

    const effectivePage = filteredRisks.length === 0 ? 0 : (page > Math.ceil(filteredRisks.length / PAGE_SIZE) - 1 ? 0 : page);
    const paginatedRisks = filteredRisks.slice(effectivePage * PAGE_SIZE, (effectivePage + 1) * PAGE_SIZE);
    const totalPages = Math.ceil(filteredRisks.length / PAGE_SIZE);

    const filterBtnCls = (active: boolean, open: boolean) =>
        `flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${active || open
            ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300'
        }`;

    const columns = [
        { key: 'process_name', label: 'Process', align: 'left' as const, sortable: true },
        { key: 'risk_description', label: 'Risk Description', align: 'left' as const, sortable: true },
        { key: 'residual_risk_score', label: 'Residual', align: 'center' as const, sortable: true },
        { key: 'status', label: 'Status', align: 'center' as const, sortable: true },
        { key: 'actions', label: 'Actions', align: 'center' as const, sortable: false },
    ];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        Logged Risks
                    </h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors ${hasActiveFilters ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {hasActiveFilters ? `${filteredRisks.length}/${risks.length}` : risks.length}
                    </span>
                </div>
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
                <div className="px-5 py-3 flex items-center gap-2 border-b border-slate-100">
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
                                            onClick={() => { setProcessFilter(new Set()); setProcessSearch(''); handlePageChange(0); }}
                                            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            Clear selection
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-slate-50/90 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200">
                        <tr className="text-xs text-slate-500 uppercase tracking-wider">
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={`px-4 py-3 font-semibold ${col.sortable ? 'cursor-pointer group hover:bg-slate-100/50 transition-colors select-none' : ''} ${col.align === 'center' ? 'text-center' : 'text-left'} first:pl-8 last:pr-8`}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                >
                                    <div className={`flex items-center gap-1.5 ${col.align === 'center' ? 'justify-center' : ''}`}>
                                        <span>{col.label}</span>
                                        {col.sortable && renderSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
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
                                const isExpanded = expandedRow === r.id;
                                const inherentLevel = getRiskLevelString(r.inherent_risk_score);
                                const residualLevel = getRiskLevelString(r.residual_risk_score);
                                const controlsLabel = getControlsLabel(r.controls_rating);
                                return (
                                    <Fragment key={r.id}>
                                        <tr
                                            onClick={() => setExpandedRow(isExpanded ? null : r.id)}
                                            className="hover:bg-slate-50/50 transition-colors cursor-pointer group/row"
                                        >
                                            <td className="px-4 py-4 align-top first:pl-8">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center justify-center w-4 h-4 text-slate-300 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                                                        <ChevronDown className="w-3 h-3" />
                                                    </span>
                                                    <span className="font-medium text-slate-700 text-[13px]">{r.process_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top w-full">
                                                <div className="flex flex-col gap-2 max-w-[500px]">
                                                    <div className="text-slate-700 text-[13px] leading-relaxed whitespace-normal line-clamp-2 group-hover/row:text-slate-900 transition-colors" title={r.risk_description}>
                                                        {r.risk_description}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cause:</span>
                                                        <MiniBadge
                                                            label={r.root_cause || '—'}
                                                            color={r.root_cause === 'People' ? '#3b82f6' : r.root_cause === 'Process' ? '#22c55e' : r.root_cause === 'Systems' ? '#f59e0b' : '#ef4444'}
                                                        />
                                                        <span className="text-slate-200">|</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{r.event_type}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top text-center">
                                                <div className="inline-flex flex-col items-center gap-1.5">
                                                    <ScoreBadge
                                                        label={residualLevel.toUpperCase()}
                                                        subLabel={r.residual_risk_score}
                                                        color={RISK_TEXT[residualLevel]}
                                                    />
                                                    <div className="flex gap-1 justify-center">
                                                        <ScoreBadge
                                                            label="I"
                                                            subLabel={r.inherent_risk_score}
                                                            color={RISK_TEXT[inherentLevel]}
                                                            tooltip="Inherent Risk"
                                                        />
                                                        <ScoreBadge
                                                            label="C"
                                                            subLabel={r.controls_rating}
                                                            color={CONTROLS_LABEL_COLORS[controlsLabel]}
                                                            tooltip="Controls Rating"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-middle text-center">
                                                <span
                                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold font-mono border uppercase tracking-widest"
                                                    style={{
                                                        backgroundColor: `${STATUS_COLORS[r.status]}15`,
                                                        color: STATUS_COLORS[r.status],
                                                        borderColor: `${STATUS_COLORS[r.status]}30`,
                                                    }}
                                                >
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center last:pr-8" onClick={e => e.stopPropagation()}>
                                                <div className="flex justify-center gap-1">
                                                    <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400" onClick={() => onView(r)} title="View" aria-label="View risk"><ICONS.view size={16} /></button>
                                                    <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400" onClick={() => onEdit(r)} title="Edit" aria-label="Edit risk"><ICONS.edit size={16} /></button>
                                                    <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400" onClick={() => onDelete(r.id)} title="Delete" aria-label="Delete risk"><ICONS.trash size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-slate-50/80 whitespace-normal">
                                                <td colSpan={5} className="px-8 py-6 border-b border-slate-100">
                                                    <div className="grid grid-cols-[1fr_2fr] gap-x-8 gap-y-4 text-sm">
                                                        <div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Risk Description</div>
                                                            <div className="text-slate-700 leading-relaxed">{r.risk_description}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Possible Causes</div>
                                                            <div className="text-slate-700 leading-relaxed">{r.possible_causes || '—'}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Control Type</div>
                                                            <div className="text-slate-700 leading-relaxed font-medium">{r.control_type || '—'}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Control Description</div>
                                                            <div className="text-slate-700 leading-relaxed">{r.control_description || '—'}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Treatment</div>
                                                            <div className="text-slate-700 leading-relaxed font-medium">{r.risk_treatment || '—'}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Action Plan</div>
                                                            <div className="text-slate-700 leading-relaxed">{r.action_plan || '—'}</div>
                                                            {r.action_plan_deadline && (
                                                                <div className="mt-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                                                    Deadline: <span className="text-blue-600">{r.action_plan_deadline}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <button disabled={effectivePage === 0} onClick={() => handlePageChange(effectivePage - 1)} className="rounded-lg bg-white border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors">Previous</button>
                    <span className="text-xs text-slate-400">Page {effectivePage + 1} of {totalPages}</span>
                    <button disabled={effectivePage + 1 >= totalPages} onClick={() => handlePageChange(effectivePage + 1)} className="rounded-lg bg-white border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors">Next</button>
                </div>
            )}
        </div>
    );
}
