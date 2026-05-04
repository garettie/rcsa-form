import type { Risk } from '../types';
import { RISK_COLORS, RESIDUAL_RISK_LABELS, ICONS } from '../constants';
import { getRiskLevel } from '../hooks/useRCSA';

interface RiskTableProps {
    risks: Risk[];
    page: number;
    onView: (risk: Risk) => void;
    onEdit: (risk: Risk) => void;
    onDelete: (id: string) => void;
    onPageChange: (newPage: number) => void;
}

const PAGE_SIZE = 10;

export default function RiskTable({
    risks,
    page,
    onView,
    onEdit,
    onDelete,
    onPageChange,
}: RiskTableProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="m-0 text-lg font-bold text-slate-800">Logged Risks ({risks.length})</h2>
            </div>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Process</th>
                            <th>Risk Description</th>
                            <th>Residual</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {risks.length === 0 ? (
                            <tr><td colSpan={5} className="p-12 text-center text-slate-400">No risks logged yet.</td></tr>
                        ) : (
                            risks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(r => {
                                const rl = getRiskLevel(r.residual_risk_score);
                                return (
                                    <tr key={r.id} className="hover:bg-slate-50 even:bg-slate-50/50 transition-colors">
                                        <td className="font-medium text-slate-700">{r.process_name}</td>
                                        <td className="max-w-md truncate text-slate-600">{r.risk_description}</td>
                                        <td>
                                            <span className="rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider" style={{ background: `${RISK_COLORS[rl as keyof typeof RISK_COLORS]}18`, color: RISK_COLORS[rl as keyof typeof RISK_COLORS] }}>
                                                {r.residual_risk_score} - {RESIDUAL_RISK_LABELS[rl as keyof typeof RESIDUAL_RISK_LABELS]}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${r.status === 'Open' ? 'bg-amber-100 text-amber-700' : r.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" onClick={() => onView(r)} title="View"><ICONS.view size={16} /></button>
                                                <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" onClick={() => onEdit(r)} title="Edit"><ICONS.edit size={16} /></button>
                                                <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" onClick={() => onDelete(r.id)} title="Delete"><ICONS.trash size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            {risks.length > PAGE_SIZE && (
                <div className="mt-6 flex items-center justify-between">
                    <button className="rounded-lg bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-30" disabled={page === 0} onClick={() => onPageChange(page - 1)}>Previous</button>
                    <span className="text-xs text-slate-400">Page {page + 1} of {Math.ceil(risks.length / PAGE_SIZE)}</span>
                    <button className="rounded-lg bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-30" disabled={(page + 1) * PAGE_SIZE >= risks.length} onClick={() => onPageChange(page + 1)}>Next</button>
                </div>
            )}
        </div>
    );
}