import { useState, useEffect } from 'react';
import { Book, HelpCircle } from 'lucide-react';
import type { FormState, Risk, Process } from './types';
import { fetchProcesses, fetchRisks, saveRiskData, deleteRiskData, saveProcessData, deleteProcessData, supabase } from './api';
import { DEPARTMENTS, EVENT_TYPES, ROOT_CAUSES, LIKELIHOOD_LABELS, IMPACT_LABELS, CONTROL_TYPES, CONTROL_DESIGN_LABELS, CONTROL_IMPL_LABELS, CONTROLS_RATING_LABELS, RESIDUAL_RISK_LABELS, STATUSES, RISK_TREATMENTS, RISK_COLORS, ICONS } from './constants';
import Login from './components/Login';

function getRiskLevel(score: number) {
    if (score <= 3) return 1;
    if (score <= 6) return 2;
    if (score <= 9) return 3;
    return 4;
}

function getEmptyForm(): FormState {
    return {
        department: "",
        risk_description: "",
        possible_causes: "",
        root_cause: "People",
        event_type: EVENT_TYPES[0],
        likelihood_score: 1,
        impact_score: 1,
        inherent_risk_score: 1,
        control_description: "",
        control_type: "",
        control_design_score: 1,
        control_implementation_score: 1,
        controls_rating: 1,
        residual_risk_score: 1,
        risk_treatment: "Accept",
        action_plan: "",
        action_plan_deadline: "",
        status: "Open",
        assessment_period: "",
        process_id: "",
        process_name: "",
    };
}

import ReferenceGuide from './components/ReferenceGuide';
import Tutorial from './components/Tutorial';

export default function App() {
    const [department, setDepartment] = useState(() => localStorage.getItem("rcsa_department") || "");
    const [showModal, setShowModal] = useState(() => !localStorage.getItem("rcsa_department"));
    const [showRef, setShowRef] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [risks, setRisks] = useState<Risk[]>([]);
    const [processes, setProcesses] = useState<Process[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorField, setErrorField] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [form, setForm] = useState<FormState>(getEmptyForm());
    const [authenticated, setAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const PAGE_SIZE = 10;

    // Auth check effect
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setAuthenticated(!!session);
            setCheckingAuth(false);
            if (!session) {
                setDepartment("");
                localStorage.removeItem("rcsa_department");
            }
        });
    }, []);

    // Load data when department changes
    useEffect(() => {
        if (!authenticated || checkingAuth) return;
        if (department) {
            localStorage.setItem("rcsa_department", department);
            loadData();
        } else {
            setShowModal(true);
            setLoading(false);
        }
    }, [department, authenticated, checkingAuth]);

    // Recalculate scores
    useEffect(() => {
        const inherent = form.likelihood_score * form.impact_score;
        const controls = form.control_design_score * form.control_implementation_score;
        const inherentLevel = getRiskLevel(inherent);
        const controlsLevel = getRiskLevel(controls);
        const residual = inherentLevel * controlsLevel;
        if (form.inherent_risk_score !== inherent || form.controls_rating !== controls || form.residual_risk_score !== residual) {
            setForm(f => ({ ...f, inherent_risk_score: inherent, controls_rating: controls, residual_risk_score: residual }));
        }
    }, [form.likelihood_score, form.impact_score, form.control_design_score, form.control_implementation_score]);

    const handleLogin = () => {
        setAuthenticated(true);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setAuthenticated(false);
        localStorage.removeItem("rcsa_department");
        setDepartment("");
    };

    // Conditional returns - AFTER all hooks
    if (checkingAuth) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
    }

    if (!authenticated) {
        return <Login onLogin={handleLogin} />;
    }

    async function loadData() {
        setLoading(true);
        try {
            const [ps, rs] = await Promise.all([
                fetchProcesses(department),
                fetchRisks(department)
            ]);
            setProcesses(ps);
            setRisks(rs);
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    }

    function validateForm(): { error: string; field: string } | null {
        if (!form.assessment_period) {
            return { error: "Please enter an Assessment Period (e.g., Q1 2025)", field: "f-assessment_period" };
        }
        if (!form.process_id) {
            return { error: "Please select a Process", field: "f-process_id" };
        }
        if (!form.risk_description?.trim()) {
            return { error: "Please enter a Risk Description", field: "f-risk_description" };
        }
        if (!form.possible_causes?.trim()) {
            return { error: "Please enter Possible Causes", field: "f-possible_causes" };
        }
        if (!form.root_cause) {
            return { error: "Please select a Root Cause", field: "f-root_cause" };
        }
        if (!form.event_type) {
            return { error: "Please select an Event Type", field: "f-event_type" };
        }
        if (!form.control_description?.trim()) {
            return { error: "Please enter a Control Description", field: "f-control_description" };
        }
        if (!form.control_type) {
            return { error: "Please select a Control Type", field: "f-control_type" };
        }
        if (form.risk_treatment === "Reduce") {
            if (!form.action_plan?.trim()) {
                return { error: "Action Plan is required when Risk Treatment is 'Reduce'", field: "f-action_plan" };
            }
            if (!form.action_plan_deadline) {
                return { error: "Action Plan Deadline is required when Risk Treatment is 'Reduce'", field: "f-action_plan_deadline" };
            }
        }
        return null;
    }

    async function handleSaveRisk() {
        const validation = validateForm();
        if (validation) {
            setError(validation.error);
            setErrorField(validation.field);
            return;
        }
        setSaving(true);
        setError(null);
        setErrorField(null);
        try {
            const p = processes.find(x => x.id === form.process_id);
            const dataToSave = { ...form, department, process_name: p?.process_name || "" };
            await saveRiskData(dataToSave, editingId);
            await loadData();
            setForm(getEmptyForm());
            setEditingId(null);
        } catch (e: any) {
            setError("Failed to save: " + e.message);
        }
        setSaving(false);
    }

    async function handleDeleteRisk(id: string) {
        if (!confirm("Are you sure you want to delete this risk?")) return;
        try {
            await deleteRiskData(id);
            await loadData();
        } catch (e: any) {
            setError("Failed to delete: " + e.message);
        }
    }

    function handleEditRisk(risk: Risk) {
        setEditingId(risk.id);
        setForm(risk);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleAddProcess(name: string) {
        if (!name) return;
        try {
            const newProcess = await saveProcessData(department, name);
            setProcesses(prev => [...prev, newProcess]);
        } catch (e: any) {
            setError("Failed to add process: " + e.message);
        }
    }

    async function handleDeleteProcess(id: string) {
        if (!confirm("Delete process? All associated risks will also be deleted.")) return;
        try {
            await deleteProcessData(id);
            setProcesses(prev => prev.filter(p => p.id !== id));
            setRisks(prev => prev.filter(r => r.process_id !== id));
        } catch (e: any) {
            setError("Failed to delete: " + e.message);
        }
    }

    const updateForm = (field: keyof FormState, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const inherentLevel = getRiskLevel(form.inherent_risk_score);
    const controlsLevel = getRiskLevel(form.controls_rating);
    const residualLevel = getRiskLevel(form.residual_risk_score);

    if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

    return (
        <div className="mx-auto max-w-7xl p-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Risk and Control Self-Assessment
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100" onClick={() => setShowTutorial(true)}><HelpCircle size={16} /> How to Use</button>
                    <button className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100" onClick={() => setShowRef(true)}><Book size={16} /> Reference Guide</button>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                        {department}
                        <button className="ml-1 flex items-center text-slate-400 hover:text-slate-600" onClick={() => setShowModal(true)} title="Change department" aria-label="Change department"><ICONS.x size={16} /></button>
                    </div>
                    <button className="flex items-center rounded-lg border border-slate-200 bg-white p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all" onClick={handleLogout} title="Logout"><ICONS.logout size={16} /></button>
                </div>
            </div>

            {/* Form */}
            <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
                <div className="mb-10 flex items-center justify-between border-b border-slate-100 pb-6">
                    <h2 className="m-0 text-xl font-bold text-slate-800">{editingId ? "Edit Risk Entry" : "New Risk Entry"}</h2>
                    {editingId && <button className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-all" onClick={() => { setEditingId(null); setForm(getEmptyForm()); }}><ICONS.x size={16} /> Cancel</button>}
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
                            <input id="f-assessment_period" type="text" value={form.assessment_period} onChange={e => { updateForm('assessment_period', e.target.value); setErrorField(null); }} placeholder="e.g. Q1 2025" className={errorField === 'f-assessment_period' ? 'border-red-500 ring-2 ring-red-100' : ''} />
                        </div>
                        <div className="md:col-span-2">
                            <label>Process *</label>
                            <div className="flex gap-3">
                                {processes.length === 0 ? (
                                    <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm italic text-slate-400">No processes yet. Add one using Edit Processes</div>
                                ) : (
                                    <select id="f-process_id" value={form.process_id} onChange={e => { updateForm('process_id', e.target.value); setErrorField(null); }} className={`select-custom ${!form.process_id ? 'text-slate-400' : ''} ${errorField === 'f-process_id' ? 'border-red-500 ring-2 ring-red-100' : ''}`}>
                                        <option value="" disabled>Select process...</option>
                                        {processes.map(p => <option key={p.id} value={p.id} className="text-slate-700">{p.process_name}</option>)}
                                    </select>
                                )}
                                <button id="edit-processes-btn" className="flex items-center gap-2 whitespace-nowrap rounded-md bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors" onClick={() => setShowProcessModal(true)}><ICONS.edit size={12} /> Edit</button>
                            </div>
                        </div>

                        <div className="md:col-span-3">
                            <label>Risk Description *</label>
                            <textarea id="f-risk_description" rows={3} value={form.risk_description} onChange={e => { updateForm('risk_description', e.target.value); setErrorField(null); }} placeholder="Describe the risk..." required className={errorField === 'f-risk_description' ? 'border-red-500 ring-2 ring-red-100' : ''}></textarea>
                        </div>

                        <div className="md:col-span-3">
                            <label>Possible Causes</label>
                            <textarea id="f-possible_causes" rows={3} value={form.possible_causes} onChange={e => { updateForm('possible_causes', e.target.value); setErrorField(null); }} placeholder="Describe possible causes..." className={errorField === 'f-possible_causes' ? 'border-red-500 ring-2 ring-red-100' : ''}></textarea>
                        </div>

                        <div>
                            <label>Root Cause</label>
                            <select id="f-root_cause" value={form.root_cause} onChange={e => { updateForm('root_cause', e.target.value); setErrorField(null); }} className={`select-custom ${errorField === 'f-root_cause' ? 'border-red-500 ring-2 ring-red-100' : ''}`}>
                                {ROOT_CAUSES.map(rc => <option key={rc} value={rc}>{rc}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label>Event Type</label>
                            <select id="f-event_type" value={form.event_type} onChange={e => { updateForm('event_type', e.target.value); setErrorField(null); }} className={`select-custom ${errorField === 'f-event_type' ? 'border-red-500 ring-2 ring-red-100' : ''}`}>
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
                            <select id="f-likelihood_score" value={form.likelihood_score} onChange={e => updateForm('likelihood_score', Number(e.target.value))} className="select-custom">
                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} - {LIKELIHOOD_LABELS[n as keyof typeof LIKELIHOOD_LABELS]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Impact Score</label>
                            <select id="f-impact_score" value={form.impact_score} onChange={e => updateForm('impact_score', Number(e.target.value))} className="select-custom">
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
                            <textarea id="f-control_description" rows={3} value={form.control_description} onChange={e => { updateForm('control_description', e.target.value); setErrorField(null); }} placeholder="Describe the controls in place..." className={errorField === 'f-control_description' ? 'border-red-500 ring-2 ring-red-100' : ''}></textarea>
                        </div>

                        <div>
                            <label>Control Type</label>
                            <select id="f-control_type" value={form.control_type} onChange={e => { updateForm('control_type', e.target.value); setErrorField(null); }} className={`select-custom ${!form.control_type ? 'text-slate-400' : ''} ${errorField === 'f-control_type' ? 'border-red-500 ring-2 ring-red-100' : ''}`}>
                                <option value="" disabled>Select Control Type...</option>
                                {CONTROL_TYPES.map(ct => <option key={ct} value={ct} className="text-slate-700">{ct}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Control Design</label>
                            <select id="f-control_design_score" value={form.control_design_score} onChange={e => updateForm('control_design_score', Number(e.target.value))} className="select-custom">
                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} - {CONTROL_DESIGN_LABELS[n as keyof typeof CONTROL_DESIGN_LABELS]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Control Implementation</label>
                            <select id="f-control_implementation_score" value={form.control_implementation_score} onChange={e => updateForm('control_implementation_score', Number(e.target.value))} className="select-custom">
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
                            <select id="f-risk_treatment" value={form.risk_treatment} onChange={e => updateForm('risk_treatment', e.target.value)} className="select-custom">
                                {RISK_TREATMENTS.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label>Action Plan</label>
                            <input id="f-action_plan" type="text" value={form.action_plan} onChange={e => { updateForm('action_plan', e.target.value); setErrorField(null); }} placeholder="What actions will be taken?" className={errorField === 'f-action_plan' ? 'border-red-500 ring-2 ring-red-100' : ''} />
                        </div>

                        <div>
                            <label>Action Plan Deadline</label>
                            <input id="f-action_plan_deadline" type="date" value={form.action_plan_deadline} onChange={e => { updateForm('action_plan_deadline', e.target.value); setErrorField(null); }} className={errorField === 'f-action_plan_deadline' ? 'border-red-500 ring-2 ring-red-100' : ''} />
                        </div>
                        <div className="md:col-span-2">
                            <label>Status</label>
                            <select id="f-status" value={form.status} onChange={e => updateForm('status', e.target.value)} className="select-custom">
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-slate-100 pt-8">
                    <button className="flex items-center gap-2 rounded-md bg-slate-800 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-700 disabled:opacity-50 transition-all active:scale-95" onClick={handleSaveRisk} disabled={saving}><ICONS.save size={16} /> {saving ? ' Saving...' : (editingId ? ' Update Entry' : ' Save Entry')}</button>
                </div>
            </div>

            {/* Table Section */}
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
                                                    <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" onClick={() => handleEditRisk(r)}><ICONS.edit size={16} /></button>
                                                    <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" onClick={() => handleDeleteRisk(r.id)}><ICONS.trash size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {risks.length > PAGE_SIZE && (
                    <div className="mt-6 flex items-center justify-between">
                        <button className="rounded-lg bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-30" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                        <span className="text-xs text-slate-400">Page {page + 1} of {Math.ceil(risks.length / PAGE_SIZE)}</span>
                        <button className="rounded-lg bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-30" disabled={(page + 1) * PAGE_SIZE >= risks.length} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h2 className="mb-1 text-xl font-bold text-slate-800">Select Department</h2>
                        <p className="mb-6 text-sm text-slate-500">Please select your department to continue.</p>
                        <select value={department} onChange={e => {
                            setDepartment(e.target.value);
                            setShowModal(false);
                        }} className="select-custom">
                            <option value="" disabled>Select department...</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {showProcessModal && (
                <div className="modal-overlay">
                    <div className="flex max-h-[90vh] w-[90%] max-w-[600px] flex-col rounded-2xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="m-0 text-xl font-bold text-slate-800">Manage Processes</h2>
                            <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100" onClick={() => setShowProcessModal(false)}><ICONS.x size={16} /></button>
                        </div>
                        <div className="mb-6 flex gap-2">
                            <input type="text" id="new-process-name" placeholder="New process name..." />
                            <button className="btn btn-primary whitespace-nowrap px-6" onClick={() => {
                                const el = document.getElementById('new-process-name') as HTMLInputElement;
                                if (el.value) { handleAddProcess(el.value); el.value = ''; }
                            }}>Add Process</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <tbody className="divide-y divide-slate-100">
                                    {processes.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="font-medium text-slate-700">{p.process_name}</td>
                                            <td className="w-10 text-right">
                                                <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" onClick={() => handleDeleteProcess(p.id)}><ICONS.trash size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {processes.length === 0 && <tr><td colSpan={2} className="p-8 text-center text-sm italic text-slate-400">No processes.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showRef && <ReferenceGuide onClose={() => setShowRef(false)} />}
            {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} onOpenRef={() => { setShowTutorial(false); setShowRef(true); }} />}
        </div>
    );
}
