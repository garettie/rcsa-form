import { useState, useEffect, useCallback } from 'react';
import type { FormState, Risk, Process } from '../types';
import { fetchProcesses, fetchRisks, saveRiskData, deleteRiskData, saveProcessData, deleteProcessData, supabase } from '../api';
import { EVENT_TYPES } from '../constants';

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
        action_plan: null,
        action_plan_deadline: null,
        status: "Open",
        assessment_period: "",
        process_id: "",
        process_name: "",
    };
}

export function getInherentRiskScore(likelihood: number, impact: number) {
    return likelihood * impact;
}

export function getControlsRating(design: number, implementation: number) {
    return design * implementation;
}

export function getResidualRiskScore(inherentScore: number, controlsRating: number) {
    const inherentLevel = getRiskLevel(inherentScore);
    const controlsLevel = getRiskLevel(controlsRating);
    return inherentLevel * controlsLevel;
}

export { getRiskLevel };

function getErrorMessage(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
    if (typeof e === 'string') return e;
    return 'Unknown error';
}

export function useRCSA() {
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
    const [viewOnly, setViewOnly] = useState(false);
    const [page, setPage] = useState(0);
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [confirmResolve, setConfirmResolve] = useState<((ok: boolean) => void) | null>(null);
    const [form, setForm] = useState<FormState>(getEmptyForm());
    const [authenticated, setAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const loadData = useCallback(async (options: { silent?: boolean } = {}) => {
        if (!options.silent) setLoading(true);
        try {
            const [ps, rs] = await Promise.all([
                fetchProcesses(department),
                fetchRisks(department)
            ]);
            setProcesses(ps);
            setRisks(rs);
        } catch (e: unknown) {
            const message = getErrorMessage(e);
            setError(message);
        }
        setLoading(false);
    }, [department]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthenticated(!!session);
            setCheckingAuth(false);
            if (!session) {
                setDepartment("");
                setShowModal(true);
                localStorage.removeItem("rcsa_department");
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!authenticated || checkingAuth) return;
        if (department) {
            localStorage.setItem("rcsa_department", department);
            loadData({ silent: true });
        } else {
            setLoading(false);
        }
    }, [department, authenticated, checkingAuth, loadData]);

    const confirm = useCallback((message: string): Promise<boolean> => {
        setConfirmMessage(message);
        setShowConfirmModal(true);
        return new Promise(resolve => {
            setConfirmResolve(() => (ok: boolean) => {
                setShowConfirmModal(false);
                setConfirmResolve(null);
                resolve(ok);
            });
        });
    }, []);

    const handleLogin = useCallback(() => {
        setAuthenticated(true);
    }, []);

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    const validateForm = useCallback((): { error: string; field: string } | null => {
        if (!form.assessment_period) {
            return { error: "Please enter an Assessment Period (e.g., Q1 2025)", field: "f-assessment_period" };
        }
        if (!form.process_id) {
            return { error: "Please select a Process", field: "f-process_id" };
        }
        if (!(form.risk_description || "").trim()) {
            return { error: "Please enter a Risk Description", field: "f-risk_description" };
        }
        if (!(form.possible_causes || "").trim()) {
            return { error: "Please enter Possible Causes", field: "f-possible_causes" };
        }
        if (!form.root_cause) {
            return { error: "Please select a Root Cause", field: "f-root_cause" };
        }
        if (!form.event_type) {
            return { error: "Please select an Event Type", field: "f-event_type" };
        }
        if (!(form.control_description || "").trim()) {
            return { error: "Please enter a Control Description", field: "f-control_description" };
        }
        if (!form.control_type) {
            return { error: "Please select a Control Type", field: "f-control_type" };
        }
        if (form.risk_treatment === "Reduce") {
            if (!(form.action_plan || "").trim()) {
                return { error: "Action Plan is required when Risk Treatment is 'Reduce'", field: "f-action_plan" };
            }
            if (!form.action_plan_deadline) {
                return { error: "Action Plan Deadline is required when Risk Treatment is 'Reduce'", field: "f-action_plan_deadline" };
            }
        }
        return null;
    }, [form]);

    const handleSaveRisk = useCallback(async () => {
        const validation = validateForm();
        if (validation) {
            setError(validation.error);
            setErrorField(validation.field);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setSaving(true);
        setError(null);
        setErrorField(null);
        try {
            const p = processes.find(x => x.id === form.process_id);
            const dataToSave = { 
                ...form, 
                department, 
                process_name: p?.process_name || "",
                action_plan: form.action_plan?.trim() || null,
                action_plan_deadline: form.action_plan_deadline || null
            };
            await saveRiskData(dataToSave, editingId);
            await loadData({ silent: true });
            setForm(getEmptyForm());
            setEditingId(null);
        } catch (e: unknown) {
const message = getErrorMessage(e);
                setError("Failed to save: " + message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setSaving(false);
    }, [validateForm, form, department, editingId, processes, loadData]);

    const handleDeleteRisk = useCallback(async (id: string) => {
        if (!await confirm("Are you sure you want to delete this risk?")) return;
        try {
            await deleteRiskData(id);
            await loadData({ silent: true });
        } catch (e: unknown) {
            const message = getErrorMessage(e);
            setError("Failed to delete: " + message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [confirm, loadData]);

    const handleEditRisk = useCallback((risk: Risk) => {
        setViewOnly(false);
        setEditingId(risk.id);
        setForm(risk);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleViewRisk = useCallback((risk: Risk) => {
        setViewOnly(true);
        setEditingId(risk.id);
        setForm(risk);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleAddProcess = useCallback(async (name: string) => {
        if (!name) return;
        try {
            const newProcess = await saveProcessData(department, name);
            setProcesses(prev => [...prev, newProcess]);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Unknown error';
            setError("Failed to add process: " + message);
        }
    }, [department]);

    const handleDeleteProcess = useCallback(async (id: string) => {
        if (!await confirm("Delete process? All associated risks will also be deleted.")) return;
        try {
            await deleteProcessData(id);
            setProcesses(prev => prev.filter(p => p.id !== id));
            setRisks(prev => prev.filter(r => r.process_id !== id));
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Unknown error';
            setError("Failed to delete: " + message);
        }
    }, [confirm]);

    const updateForm = useCallback((field: keyof FormState, value: unknown) => {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'likelihood_score' || field === 'impact_score' ||
                field === 'control_design_score' || field === 'control_implementation_score') {
                const inherent = getInherentRiskScore(Number(next.likelihood_score), Number(next.impact_score));
                const controls = getControlsRating(Number(next.control_design_score), Number(next.control_implementation_score));
                const residual = getResidualRiskScore(inherent, controls);
                next.inherent_risk_score = inherent;
                next.controls_rating = controls;
                next.residual_risk_score = residual;
            }
            return next;
        });
        setErrorField(null);
    }, []);

    const clearForm = useCallback(() => {
        setEditingId(null);
        setViewOnly(false);
        setForm(getEmptyForm());
    }, []);

    const inherentLevel = getRiskLevel(form.inherent_risk_score);
    const controlsLevel = getRiskLevel(form.controls_rating);
    const residualLevel = getRiskLevel(form.residual_risk_score);

    return {
        department,
        setDepartment,
        showModal,
        setShowModal,
        showRef,
        setShowRef,
        showTutorial,
        setShowTutorial,
        risks,
        processes,
        loading,
        saving,
        error,
        setError,
        errorField,
        setErrorField,
        editingId,
        viewOnly,
        page,
        setPage,
        showProcessModal,
        setShowProcessModal,
        showConfirmModal,
        confirmMessage,
        confirmResolve,
        form,
        authenticated,
        checkingAuth,
        handleLogin,
        handleLogout,
        handleSaveRisk,
        handleDeleteRisk,
        handleEditRisk,
        handleViewRisk,
        handleAddProcess,
        handleDeleteProcess,
        updateForm,
        clearForm,
        loadData,
        inherentLevel,
        controlsLevel,
        residualLevel,
    };
}