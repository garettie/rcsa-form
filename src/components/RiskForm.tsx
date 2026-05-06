import type { FormState, Process } from '../types';
import { EVENT_TYPES, ROOT_CAUSES, LIKELIHOOD_LABELS, IMPACT_LABELS, CONTROL_TYPES, CONTROL_DESIGN_LABELS, CONTROL_IMPL_LABELS, CONTROLS_RATING_LABELS, RESIDUAL_RISK_LABELS, RISK_TREATMENTS, STATUSES, RISK_COLORS, ICONS } from '../constants';

interface RiskFormProps {
    form: FormState;
    viewOnly: boolean;
    editingId: string | null;
    error: string | null;
    errorField: string | null;
    processes: Process[];
    saving: boolean;
    inherentLevel: number;
    controlsLevel: number;
    residualLevel: number;
    updateForm: (field: keyof FormState, value: unknown) => void;
    handleSaveRisk: () => void;
    onClearForm: () => void;
    onOpenProcessModal: () => void;
}

export default function RiskForm({
    form,
    viewOnly,
    editingId,
    error,
    errorField,
    processes,
    saving,
    inherentLevel,
    controlsLevel,
    residualLevel,
    updateForm,
    handleSaveRisk,
    onClearForm,
    onOpenProcessModal,
}: RiskFormProps) {
    return (
        <div className={`mb-10 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm transition-all duration-300 ${editingId ? 'editing-active' : ''}`}>
            <div className="mb-10 flex items-center justify-between border-b border-slate-100 pb-6">
                <h2 className="m-0 text-xl font-bold text-slate-800">{viewOnly ? "View Risk Entry" : (editingId ? "Edit Risk Entry" : "New Risk Entry")}</h2>
                {editingId && <button className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-all" onClick={onClearForm}><ICONS.x size={16} /> Close</button>}
            </div>

            {error && <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">{error}</div>}

            <div className="space-y-8">
                {/* Section: Identification */}
                <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
                    <div className="md:col-span-3">
                        <h3 className="border-l-2 border-teal-500 pl-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Risk Identification</h3>
                    </div>
                    <div>
                        <label>Assessment Period</label>
                        <input id="f-assessment_period" type="text" value={form.assessment_period} onChange={e => { updateForm('assessment_period', e.target.value); }} placeholder="e.g. Q1 2025" className={errorField === 'f-assessment_period' ? 'border-red-500 ring-2 ring-red-100' : ''} disabled={viewOnly} />
                    </div>
                    <div className="md:col-span-2">
                        <label>Process *</label>
                        <div className="flex gap-3">
                            {processes.length === 0 ? (
                                <div id="f-process_id-empty" className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm italic text-slate-400">No processes yet. Add one using Edit Processes</div>
                            ) : (
                                <select id="f-process_id" value={form.process_id} onChange={e => { updateForm('process_id', e.target.value); }} className={`select-custom ${!form.process_id ? 'text-slate-400' : ''} ${errorField === 'f-process_id' ? 'border-red-500 ring-2 ring-red-100' : ''}`} disabled={viewOnly}>
                                    <option value="" disabled>Select process...</option>
                                    {processes.map(p => <option key={p.id} value={p.id} className="text-slate-700">{p.process_name}</option>)}
                                </select>
                            )}
                            {!viewOnly && <button id="edit-processes-btn" className="flex items-center gap-2 whitespace-nowrap rounded-md bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors" onClick={onOpenProcessModal}><ICONS.edit size={12} /> Edit</button>}
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <label>Risk Description *</label>
                        <textarea id="f-risk_description" rows={3} value={form.risk_description} onChange={e => { updateForm('risk_description', e.target.value); }} placeholder="Describe the risk..." required className={errorField === 'f-risk_description' ? 'border-red-500 ring-2 ring-red-100' : ''} disabled={viewOnly}></textarea>
                    </div>

                    <div className="md:col-span-3">
                        <label>Possible Causes</label>
                        <textarea id="f-possible_causes" rows={3} value={form.possible_causes} onChange={e => { updateForm('possible_causes', e.target.value); }} placeholder="Describe possible causes..." className={errorField === 'f-possible_causes' ? 'border-red-500 ring-2 ring-red-100' : ''} disabled={viewOnly}></textarea>
                    </div>

                    <div>
                        <label>Root Cause</label>
                        <select id="f-root_cause" value={form.root_cause} onChange={e => { updateForm('root_cause', e.target.value); }} className={`select-custom ${errorField === 'f-root_cause' ? 'border-red-500 ring-2 ring-red-100' : ''}`} disabled={viewOnly}>
                            {ROOT_CAUSES.map(rc => <option key={rc} value={rc}>{rc}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label>Event Type</label>
                        <select id="f-event_type" value={form.event_type} onChange={e => { updateForm('event_type', e.target.value); }} className={`select-custom ${errorField === 'f-event_type' ? 'border-red-500 ring-2 ring-red-100' : ''}`} disabled={viewOnly}>
                            {EVENT_TYPES.map(et => <option key={et} value={et}>{et}</option>)}
                        </select>
                    </div>
                </div>

                {/* Section: Scoring */}
                <div className="grid grid-cols-1 gap-x-10 gap-y-8 border-t border-slate-100 pt-8 md:grid-cols-3">
                    <div className="md:col-span-3">
                        <h3 className="border-l-2 border-teal-500 pl-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Inherent Risk Scoring</h3>
                    </div>
                    <div>
                        <label>Likelihood Score</label>
                        <select id="f-likelihood_score" value={form.likelihood_score} onChange={e => updateForm('likelihood_score', Number(e.target.value))} className="select-custom" disabled={viewOnly}>
                            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} - {LIKELIHOOD_LABELS[n as keyof typeof LIKELIHOOD_LABELS]}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Impact Score</label>
                        <select id="f-impact_score" value={form.impact_score} onChange={e => updateForm('impact_score', Number(e.target.value))} className="select-custom" disabled={viewOnly}>
                            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} - {IMPACT_LABELS[n as keyof typeof IMPACT_LABELS]}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Inherent Risk Score</label>
                        <div id="cf-inherent-score" className="flex min-h-[46px] items-center gap-3 rounded-md bg-slate-100/80 px-4 py-2.5">
                            <span className="text-2xl font-bold" style={{ color: RISK_COLORS[inherentLevel as keyof typeof RISK_COLORS] }}>{form.inherent_risk_score}</span>
                            <span className="rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider" style={{ background: `${RISK_COLORS[inherentLevel as keyof typeof RISK_COLORS]}18`, color: RISK_COLORS[inherentLevel as keyof typeof RISK_COLORS] }}>{RESIDUAL_RISK_LABELS[inherentLevel as keyof typeof RESIDUAL_RISK_LABELS]}</span>
                        </div>
                    </div>
                </div>

                {/* Section: Controls */}
                <div className="grid grid-cols-1 gap-x-10 gap-y-8 border-t border-slate-100 pt-8 md:grid-cols-3">
                    <div className="md:col-span-3">
                        <h3 className="border-l-2 border-teal-500 pl-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Control Framework & Rating</h3>
                    </div>
                    <div className="md:col-span-3">
                        <label>Control Description</label>
                        <textarea id="f-control_description" rows={3} value={form.control_description} onChange={e => { updateForm('control_description', e.target.value); }} placeholder="Describe the controls in place..." className={errorField === 'f-control_description' ? 'border-red-500 ring-2 ring-red-100' : ''} disabled={viewOnly}></textarea>
                    </div>

                    <div>
                        <label>Control Type</label>
                        <select id="f-control_type" value={form.control_type} onChange={e => { updateForm('control_type', e.target.value); }} className={`select-custom ${!form.control_type ? 'text-slate-400' : ''} ${errorField === 'f-control_type' ? 'border-red-500 ring-2 ring-red-100' : ''}`} disabled={viewOnly}>
                            <option value="" disabled>Select Control Type...</option>
                            {CONTROL_TYPES.map(ct => <option key={ct} value={ct} className="text-slate-700">{ct}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Control Design</label>
                        <select id="f-control_design_score" value={form.control_design_score} onChange={e => updateForm('control_design_score', Number(e.target.value))} className="select-custom" disabled={viewOnly}>
                            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} - {CONTROL_DESIGN_LABELS[n as keyof typeof CONTROL_DESIGN_LABELS]}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Control Implementation</label>
                        <select id="f-control_implementation_score" value={form.control_implementation_score} onChange={e => updateForm('control_implementation_score', Number(e.target.value))} className="select-custom" disabled={viewOnly}>
                            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} - {CONTROL_IMPL_LABELS[n as keyof typeof CONTROL_IMPL_LABELS]}</option>)}
                        </select>
                    </div>

                    <div>
                        <label>Controls Rating</label>
                        <div id="cf-controls-rating" className="flex min-h-[46px] items-center gap-3 rounded-md bg-slate-100/80 px-4 py-2.5">
                            <span className="text-2xl font-bold" style={{ color: RISK_COLORS[controlsLevel as keyof typeof RISK_COLORS] }}>{form.controls_rating}</span>
                            <span className="rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider" style={{ background: `${RISK_COLORS[controlsLevel as keyof typeof RISK_COLORS]}18`, color: RISK_COLORS[controlsLevel as keyof typeof RISK_COLORS] }}>{CONTROLS_RATING_LABELS[controlsLevel as keyof typeof CONTROLS_RATING_LABELS]}</span>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label>Residual Risk Score</label>
                        <div className="flex min-h-[46px] items-center gap-3 rounded-md bg-slate-100/80 px-4 py-2.5" id="cf-residual">
                            <span className="text-2xl font-bold" style={{ color: RISK_COLORS[residualLevel as keyof typeof RISK_COLORS] }}>{form.residual_risk_score}</span>
                            <span className="rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider" style={{ background: `${RISK_COLORS[residualLevel as keyof typeof RISK_COLORS]}18`, color: RISK_COLORS[residualLevel as keyof typeof RISK_COLORS] }}>{RESIDUAL_RISK_LABELS[residualLevel as keyof typeof RESIDUAL_RISK_LABELS]}</span>
                        </div>
                    </div>
                </div>

                {/* Section: Treatment */}
                <div className="grid grid-cols-1 gap-x-10 gap-y-8 border-t border-slate-100 pt-8 md:grid-cols-3">
                    <div className="md:col-span-3">
                        <h3 className="border-l-2 border-teal-500 pl-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Treatment & Action Plan</h3>
                    </div>
                    <div>
                        <label>Risk Treatment</label>
                        <select id="f-risk_treatment" value={form.risk_treatment} onChange={e => updateForm('risk_treatment', e.target.value)} className="select-custom" disabled={viewOnly}>
                            {RISK_TREATMENTS.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label>Action Plan</label>
                        <input id="f-action_plan" type="text" value={form.action_plan ?? ""} onChange={e => { updateForm('action_plan', e.target.value); }} placeholder="What actions will be taken?" className={errorField === 'f-action_plan' ? 'border-red-500 ring-2 ring-red-100' : ''} disabled={viewOnly} />
                    </div>

                    <div>
                        <label>Action Plan Deadline</label>
                        <input id="f-action_plan_deadline" type="date" value={form.action_plan_deadline ?? ""} onChange={e => { updateForm('action_plan_deadline', e.target.value); }} className={errorField === 'f-action_plan_deadline' ? 'border-red-500 ring-2 ring-red-100' : ''} disabled={viewOnly} />
                    </div>
                    <div className="md:col-span-2">
                        <label>Status</label>
                        <select id="f-status" value={form.status} onChange={e => updateForm('status', e.target.value)} className="select-custom" disabled={viewOnly}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {!viewOnly && (
                <div className="mt-8 flex justify-end border-t border-slate-100 pt-8">
                    <button className="flex items-center gap-2 rounded-md bg-slate-800 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-700 disabled:opacity-50 transition-all active:scale-95" onClick={handleSaveRisk} disabled={saving}><ICONS.save size={16} /> {saving ? ' Saving...' : (editingId ? ' Update Entry' : ' Save Entry')}</button>
                </div>
            )}
        </div>
    );
}