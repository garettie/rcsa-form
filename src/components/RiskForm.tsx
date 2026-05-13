import { useState, useId, useEffect } from 'react';
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
    tutorialTargetSection?: number | null;
    onOpenSectionChange?: (section: number) => void;
}

const SECTIONS = [
    { id: 0, label: 'Risk Identification' },
    { id: 1, label: 'Risk Assessment' },
    { id: 2, label: 'Controls Assessment' },
    { id: 3, label: 'Treatment & Action Plan' },
] as const;

const FIELD_SECTION_MAP: Record<string, number> = {
    'f-assessment_period': 0, 'f-process_id': 0,
    'f-risk_description': 0, 'f-possible_causes': 0,
    'f-root_cause': 0, 'f-event_type': 0,
    'f-likelihood_score': 1, 'f-impact_score': 1,
    'f-control_description': 2, 'f-control_type': 2,
    'f-control_design_score': 2, 'f-control_implementation_score': 2,
    'f-risk_treatment': 3, 'f-action_plan': 3,
    'f-action_plan_deadline': 3, 'f-status': 3,
};

function SectionLabel({ label, isOpen, hasError }: { label: string; isOpen: boolean; hasError?: boolean }) {
    return (
        <div className="flex w-full items-center justify-between border-l-2 border-teal-500 pl-3 text-left">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-2">
                {label}
                {hasError && <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)] animate-pulse" title="Contains error" />}
            </span>
            <ICONS.chevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`}
            />
        </div>
    );
}

function InherentScoreDisplay({
    value,
    level,
    label,
    id,
}: {
    value: number;
    level: number;
    label: string;
    id?: string;
}) {
    const color = RISK_COLORS[level as keyof typeof RISK_COLORS];
    return (
        <div id={id} className="flex min-h-[46px] items-center gap-3 rounded-md bg-slate-100/80 px-4 py-2.5">
            <span className="text-2xl font-bold" style={{ color }}>{value}</span>
            <span
                className="rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                style={{ background: `${color}18`, color }}
            >
                {label}
            </span>
        </div>
    );
}

function parseQuarterYear(val: string): { quarter: string; year: number } {
    const match = val.match(/^Q([1-4])\s+(\d{4})$/);
    if (match) return { quarter: `Q${match[1]}`, year: parseInt(match[2]) };
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    return { quarter: `Q${q}`, year: now.getFullYear() };
}

interface QuarterYearSelectorProps {
    value: string;
    onChange: (val: string) => void;
    onBlur: () => void;
    disabled?: boolean;
    hasError?: boolean;
}

function QuarterYearSelector({ value, onChange, onBlur, disabled, hasError }: QuarterYearSelectorProps) {
    const { quarter, year } = parseQuarterYear(value);
    const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

    return (
        <div
            id="f-assessment_period"
            className={`inline-flex items-center gap-2 rounded-md border bg-slate-50 px-3 py-2 transition-all ${
                hasError ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'
            }`}
            onBlur={onBlur}
            tabIndex={-1}
        >
            <div className="flex gap-1">
                {QUARTERS.map(q => (
                    <button
                        key={q}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(`${q} ${year}`)}
                        className={`min-w-[36px] rounded-md px-2 py-1 text-xs font-bold transition-all ${
                            quarter === q
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        {q}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(`${quarter} ${year - 1}`)}
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-30"
                    aria-label="Previous year"
                >
                    <ICONS.chevronLeft size={12} />
                </button>
                <span className="min-w-[40px] text-center text-sm font-semibold text-slate-700">{year}</span>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(`${quarter} ${year + 1}`)}
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-30"
                    aria-label="Next year"
                >
                    <ICONS.chevronRight size={12} />
                </button>
            </div>
        </div>
    );
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
    tutorialTargetSection,
    onOpenSectionChange,
}: RiskFormProps) {
    const [openSection, setOpenSection] = useState(-1);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const uid = useId();

    function validateField(field: string): string | null {
        switch (field) {
            case 'f-assessment_period':
                return form.assessment_period ? null : 'Assessment period is required.';
            case 'f-process_id':
                return form.process_id ? null : 'Please select a process.';
            case 'f-risk_description':
                return (form.risk_description || '').trim() ? null : 'Risk description is required.';
            case 'f-control_description':
                return (form.control_description || '').trim() ? null : 'Control description is required.';
            case 'f-control_type':
                return form.control_type ? null : 'Please select a control type.';
            case 'f-action_plan':
                return form.risk_treatment === 'Reduce' && !(form.action_plan || '').trim()
                    ? 'Action plan is required when treatment is Reduce.'
                    : null;
            case 'f-action_plan_deadline':
                return form.risk_treatment === 'Reduce' && !form.action_plan_deadline
                    ? 'Deadline is required when treatment is Reduce.'
                    : null;
            default:
                return null;
        }
    }

    function handleBlur(field: string) {
        const err = validateField(field);
        setFieldErrors(prev => {
            if (err) return { ...prev, [field]: err };
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });
    }

    function handleFieldChange(field: keyof FormState, value: unknown) {
        updateForm(field, value);
        // Clear error for this field and related computed fields
        const fieldId = `f-${field}`;
        setFieldErrors(prev => {
            const copy = { ...prev };
            delete copy[fieldId];
            return copy;
        });
    }

    useEffect(() => {
        if (!errorField) return;
        const targetSection = FIELD_SECTION_MAP[errorField];
        if (targetSection !== undefined) {
            const timer1 = setTimeout(() => {
                setOpenSection(targetSection);
                const timer2 = setTimeout(() => {
                    document.getElementById(errorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 250);
                return () => clearTimeout(timer2);
            }, 0);
            return () => clearTimeout(timer1);
        }
    }, [errorField]);

    useEffect(() => {
        setFieldErrors({});
    }, [editingId]);

    useEffect(() => {
        if (tutorialTargetSection !== undefined && tutorialTargetSection !== null) {
            const timer = setTimeout(() => {
                setOpenSection(tutorialTargetSection);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [tutorialTargetSection]);

    useEffect(() => {
        onOpenSectionChange?.(openSection);
    }, [openSection, onOpenSectionChange]);

    function getSectionState(idx: number): 'empty' | 'partial' | 'complete' {
        if (idx === 0) {
            const hasAny = !!(form.assessment_period || form.process_id || form.risk_description || form.possible_causes);
            const isComplete = !!(form.process_id && form.risk_description);
            return isComplete ? 'complete' : hasAny ? 'partial' : 'empty';
        }
        if (idx === 1) {
            return (form.likelihood_score > 1 || form.impact_score > 1) ? 'complete' : 'empty';
        }
        if (idx === 2) {
            const hasAny = !!(form.control_description || form.control_type);
            const isComplete = !!(form.control_description && form.control_type);
            return isComplete ? 'complete' : hasAny ? 'partial' : 'empty';
        }
        if (idx === 3) {
            const hasAny = form.risk_treatment !== 'Accept' || !!form.action_plan || form.status !== 'Open';
            const isComplete = form.risk_treatment !== 'Accept' || !!form.action_plan;
            return isComplete ? 'complete' : hasAny ? 'partial' : 'empty';
        }
        return 'empty';
    }

    function stepCircle(sectionIndex: number) {
        const isCurrent = openSection === sectionIndex;
        const state = getSectionState(sectionIndex);
        const isCompleted = state === 'complete';
        
        let circleClass = 'bg-slate-100 text-slate-500 border border-slate-200';
        let content: React.ReactNode = sectionIndex + 1;

        if (isCompleted) {
            circleClass = 'bg-emerald-500 text-white';
            content = <ICONS.check size={13} />;
        } else if (isCurrent) {
            circleClass = 'bg-slate-800 text-white';
        } else if (state === 'partial') {
            circleClass = 'bg-slate-50 text-slate-500 border border-dashed border-slate-300';
        }

        return (
            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 ease-out box-border ${circleClass}`}>
                {content}
            </div>
        );
    }

    return (
        <div className={`mb-10 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm transition-all duration-300 ${editingId ? 'editing-active' : ''}`}>
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <h2 className="m-0 text-xl font-bold text-slate-800">{viewOnly ? "View Risk Entry" : (editingId ? "Edit Risk Entry" : "New Risk Entry")}</h2>
                    {!viewOnly && openSection >= 0 && (
                        <span className="text-[11px] font-semibold text-slate-400">
                            Section {openSection + 1} of {SECTIONS.length}
                        </span>
                    )}
                </div>
                {editingId && <button className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-all" onClick={onClearForm}><ICONS.x size={16} /> Close</button>}
            </div>

            {error && <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">{error}</div>}

            {/* Persistent context strip — shows risk description when section 1 is collapsed */}
            {openSection !== 0 && form.risk_description && (
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">Risk</span>
                    <p className="flex-1 truncate text-sm text-slate-600" title={form.risk_description}>
                        {form.risk_description}
                    </p>
                    {form.likelihood_score > 0 && (
                        <button
                            onClick={() => {
                                setOpenSection(1);
                                setTimeout(() => document.getElementById('cf-inherent-score')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                            }}
                            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-all hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 flex-shrink-0 cursor-pointer"
                            style={{ background: `${RISK_COLORS[inherentLevel as keyof typeof RISK_COLORS]}18`, color: RISK_COLORS[inherentLevel as keyof typeof RISK_COLORS] }}
                            title="Click to view risk assessment"
                            aria-label="View inherent risk score"
                        >
                            {form.inherent_risk_score} - {RESIDUAL_RISK_LABELS[inherentLevel as keyof typeof RESIDUAL_RISK_LABELS]}
                        </button>
                    )}
                </div>
            )}

            <div className="space-y-3">
                {SECTIONS.map((section, idx) => (
                    <div key={section.id} className="rounded-lg border border-slate-200 overflow-hidden transition-colors duration-300">
                        <div
                            className={`flex cursor-pointer items-center px-6 py-4 transition-colors duration-200 ${openSection === idx ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100'}`}
                            onClick={() => setOpenSection(openSection === idx ? -1 : idx)}
                            role="button"
                            tabIndex={0}
                            aria-expanded={openSection === idx}
                            aria-controls={`${uid}-section-${idx}`}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenSection(openSection === idx ? -1 : idx); } }}
                        >
                            <div className="mr-4">
                                {stepCircle(idx)}
                            </div>
                            <SectionLabel 
                                label={section.label} 
                                isOpen={openSection === idx} 
                                hasError={errorField ? FIELD_SECTION_MAP[errorField] === idx : false} 
                            />
                        </div>

                        <div
                            id={`${uid}-section-${idx}`}
                            className="overflow-hidden transition-all duration-300 ease-in-out"
                            style={{ maxHeight: openSection === idx ? '1200px' : '0' }}
                        >
                                {idx === 0 && (
                                    <div className="grid grid-cols-1 gap-x-10 gap-y-6 px-6 pb-6 md:grid-cols-3">
                                        <div>
                                            <label>Assessment Period</label>
                                            <QuarterYearSelector
                                                value={form.assessment_period}
                                                onChange={v => handleFieldChange('assessment_period', v)}
                                                onBlur={() => handleBlur('f-assessment_period')}
                                                disabled={viewOnly}
                                                hasError={!!(errorField === 'f-assessment_period' || fieldErrors['f-assessment_period'])}
                                            />
                                            {fieldErrors['f-assessment_period'] && (
                                                <p className="mt-1 text-xs text-red-500">{fieldErrors['f-assessment_period']}</p>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label>Process *</label>
                                            <div className="flex gap-3">
                                                {processes.length === 0 ? (
                                                    <div id="f-process_id-empty" className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm italic text-slate-400">No processes yet. Add one using Edit Processes</div>
                                                ) : (
                                                    <select id="f-process_id" value={form.process_id} onChange={e => { handleFieldChange('process_id', e.target.value); }} onBlur={() => handleBlur('f-process_id')} className={`select-custom ${!form.process_id ? 'text-slate-400' : ''} ${(errorField === 'f-process_id' || fieldErrors['f-process_id']) ? 'border-red-500 ring-2 ring-red-100' : ''}`} disabled={viewOnly}>
                                                        <option value="" disabled>Select process...</option>
                                                        {processes.map(p => <option key={p.id} value={p.id} className="text-slate-700">{p.process_name}</option>)}
                                                    </select>
                                                )}
                                                {!viewOnly && <button id="edit-processes-btn" className="flex items-center gap-2 whitespace-nowrap rounded-md bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors" onClick={onOpenProcessModal}><ICONS.edit size={12} /> Edit</button>}
                                            </div>
                                            {fieldErrors['f-process_id'] && (
                                                <p className="mt-1 text-xs text-red-500">{fieldErrors['f-process_id']}</p>
                                            )}
                                        </div>
                                        <div className="md:col-span-3">
                                            <label>Risk Description *</label>
                                            <textarea id="f-risk_description" rows={3} value={form.risk_description} onChange={e => { handleFieldChange('risk_description', e.target.value); }} onBlur={() => handleBlur('f-risk_description')} placeholder="Describe the risk..." required className={(errorField === 'f-risk_description' || fieldErrors['f-risk_description']) ? 'border-red-500 ring-2 ring-red-100' : ''} disabled={viewOnly}></textarea>
                                            {fieldErrors['f-risk_description'] && (
                                                <p className="mt-1 text-xs text-red-500">{fieldErrors['f-risk_description']}</p>
                                            )}
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
                                )}

                                {idx === 1 && (
                                    <div className="grid grid-cols-1 gap-x-10 gap-y-6 px-6 pb-6 md:grid-cols-3">
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
                                            <InherentScoreDisplay id="cf-inherent-score"
                                                value={form.inherent_risk_score}
                                                level={inherentLevel}
                                                label={RESIDUAL_RISK_LABELS[inherentLevel as keyof typeof RESIDUAL_RISK_LABELS]}
                                            />
                                        </div>
                                    </div>
                                )}

                                {idx === 2 && (
                                    <div className="grid grid-cols-1 gap-x-10 gap-y-6 px-6 pb-6 md:grid-cols-3">
                                        <div className="md:col-span-3">
                                            <label>Control Description</label>
                                            <textarea id="f-control_description" rows={3} value={form.control_description} onChange={e => { handleFieldChange('control_description', e.target.value); }} onBlur={() => handleBlur('f-control_description')} placeholder="Describe the controls in place..." className={(errorField === 'f-control_description' || fieldErrors['f-control_description']) ? 'border-red-500 ring-2 ring-red-100' : ''} disabled={viewOnly}></textarea>
                                            {fieldErrors['f-control_description'] && (
                                                <p className="mt-1 text-xs text-red-500">{fieldErrors['f-control_description']}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label>Control Type</label>
                                            <select id="f-control_type" value={form.control_type} onChange={e => { handleFieldChange('control_type', e.target.value); }} onBlur={() => handleBlur('f-control_type')} className={`select-custom ${!form.control_type ? 'text-slate-400' : ''} ${(errorField === 'f-control_type' || fieldErrors['f-control_type']) ? 'border-red-500 ring-2 ring-red-100' : ''}`} disabled={viewOnly}>
                                                <option value="" disabled>Select Control Type...</option>
                                                {CONTROL_TYPES.map(ct => <option key={ct} value={ct} className="text-slate-700">{ct}</option>)}
                                            </select>
                                            {fieldErrors['f-control_type'] && (
                                                <p className="mt-1 text-xs text-red-500">{fieldErrors['f-control_type']}</p>
                                            )}
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
                                            <InherentScoreDisplay id="cf-controls-rating"
                                                value={form.controls_rating}
                                                level={controlsLevel}
                                                label={CONTROLS_RATING_LABELS[controlsLevel as keyof typeof CONTROLS_RATING_LABELS]}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label>Residual Risk Score</label>
                                            <div className="flex min-h-[46px] items-center gap-3 rounded-md bg-slate-100/80 px-4 py-2.5" id="cf-residual">
                                                <span className="text-2xl font-bold" style={{ color: RISK_COLORS[residualLevel as keyof typeof RISK_COLORS] }}>{form.residual_risk_score}</span>
                                                <span className="rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider" style={{ background: `${RISK_COLORS[residualLevel as keyof typeof RISK_COLORS]}18`, color: RISK_COLORS[residualLevel as keyof typeof RISK_COLORS] }}>{RESIDUAL_RISK_LABELS[residualLevel as keyof typeof RESIDUAL_RISK_LABELS]}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {idx === 3 && (
                                    <div className="grid grid-cols-1 gap-x-10 gap-y-6 px-6 pb-6 md:grid-cols-3">
                                        <div>
                                            <label>Risk Treatment</label>
                                            <select id="f-risk_treatment" value={form.risk_treatment} onChange={e => {
                                                handleFieldChange('risk_treatment', e.target.value);
                                                setFieldErrors(prev => {
                                                    const copy = { ...prev };
                                                    delete copy['f-action_plan'];
                                                    delete copy['f-action_plan_deadline'];
                                                    return copy;
                                                });
                                            }} className="select-custom" disabled={viewOnly}>
                                                {RISK_TREATMENTS.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label>Action Plan</label>
                                            <input id="f-action_plan" type="text" value={form.action_plan ?? ""} onChange={e => { handleFieldChange('action_plan', e.target.value); }} onBlur={() => handleBlur('f-action_plan')} placeholder="What actions will be taken?" className={(errorField === 'f-action_plan' || fieldErrors['f-action_plan']) ? 'border-red-500 ring-2 ring-red-100' : ''} disabled={viewOnly} />
                                            {fieldErrors['f-action_plan'] && (
                                                <p className="mt-1 text-xs text-red-500">{fieldErrors['f-action_plan']}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label>Action Plan Deadline</label>
                                            <input id="f-action_plan_deadline" type="date" value={form.action_plan_deadline ?? ""} onChange={e => { handleFieldChange('action_plan_deadline', e.target.value); }} onBlur={() => handleBlur('f-action_plan_deadline')} className={(errorField === 'f-action_plan_deadline' || fieldErrors['f-action_plan_deadline']) ? 'border-red-500 ring-2 ring-red-100' : ''} disabled={viewOnly} />
                                            {fieldErrors['f-action_plan_deadline'] && (
                                                <p className="mt-1 text-xs text-red-500">{fieldErrors['f-action_plan_deadline']}</p>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label>Status</label>
                                            <select id="f-status" value={form.status} onChange={e => updateForm('status', e.target.value)} className="select-custom" disabled={viewOnly}>
                                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                    </div>
                ))}
            </div>

            {!viewOnly && (
                <div className="mt-8 flex justify-end border-t border-slate-100 pt-8">
                    <button
                        className="flex items-center gap-2 rounded-lg bg-slate-800 px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-slate-200 hover:bg-slate-700 disabled:opacity-50 transition-all active:scale-95"
                        onClick={handleSaveRisk}
                        disabled={saving}
                    >
                        <ICONS.save size={16} /> {saving ? ' Saving...' : (editingId ? ' Update Entry' : ' Save Entry')}
                    </button>
                </div>
            )}
        </div>
    );
}
