import { useState, useEffect, useCallback } from 'react';
import type { FormState, Risk, Process } from '../types';
import { fetchProcesses, fetchRisks, saveRiskData, deleteRiskData, saveProcessData, deleteProcessData, supabase } from '../api';

function getRiskLevel(score: number) {
    if (score <= 0) return 0;
    if (score <= 3) return 1;
    if (score <= 6) return 2;
    if (score <= 9) return 3;
    return 4;
}

function getCurrentQuarterYear(): string {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    return `Q${q} ${now.getFullYear()}`;
}

function getEmptyForm(): FormState {
    return {
        department: "",
        risk_description: "",
        possible_causes: "",
        root_cause: "",
        event_type: "",
        likelihood_score: 0,
        impact_score: 0,
        inherent_risk_score: 0,
        control_description: "",
        control_type: "",
        control_design_score: 0,
        control_implementation_score: 0,
        controls_rating: 0,
        residual_risk_score: 0,
        risk_treatment: "",
        action_plan: null,
        action_plan_deadline: null,
        status: "",
        assessment_period: getCurrentQuarterYear(),
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
    const [activeDrawer, setActiveDrawer] = useState<'tutorial' | 'reference' | 'examples' | null>(null);
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
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [cleanFormSnapshot, setCleanFormSnapshot] = useState<string>(JSON.stringify(getEmptyForm()));
    const isDirty = JSON.stringify(form) !== cleanFormSnapshot;

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
            const id = setTimeout(() => loadData({ silent: true }), 0);
            return () => clearTimeout(id);
        } else {
            const id = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(id);
        }
    }, [department, authenticated, checkingAuth, loadData]);

    useEffect(() => {
        if (!saveSuccess) return;
        const id = setTimeout(() => setSaveSuccess(false), 3000);
        return () => clearTimeout(id);
    }, [saveSuccess]);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

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
        if (form.likelihood_score < 1) {
            return { error: "Please select a Likelihood Score", field: "f-likelihood_score" };
        }
        if (form.impact_score < 1) {
            return { error: "Please select an Impact Score", field: "f-impact_score" };
        }
        if (form.control_design_score < 1) {
            return { error: "Please select a Control Design score", field: "f-control_design_score" };
        }
        if (form.control_implementation_score < 1) {
            return { error: "Please select a Control Implementation score", field: "f-control_implementation_score" };
        }
        if (!form.risk_treatment) {
            return { error: "Please select a Risk Treatment", field: "f-risk_treatment" };
        }
        if (!form.status) {
            return { error: "Please select a Status", field: "f-status" };
        }
        return null;
    }, [form]);

    const handleSaveRisk = useCallback(async (): Promise<boolean> => {
        const validation = validateForm();
        if (validation) {
            setError(validation.error);
            setErrorField(validation.field);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
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
            setCleanFormSnapshot(JSON.stringify(getEmptyForm()));
            setSaveSuccess(true);
            await loadData({ silent: true });
            setForm(getEmptyForm());
            setEditingId(null);
            return true;
        } catch (e: unknown) {
const message = getErrorMessage(e);
                setError("Failed to save: " + message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
        } finally {
            setSaving(false);
        }
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

    const handleEditRisk = useCallback(async (risk: Risk) => {
        if (isDirty && editingId) {
            const ok = await confirm('You have unsaved changes. Discard them?');
            if (!ok) return;
        }
        setViewOnly(false);
        setEditingId(risk.id);
        setForm(risk);
        setCleanFormSnapshot(JSON.stringify(risk));
        setError(null);
        setErrorField(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [editingId, confirm, isDirty]);

    const handleViewRisk = useCallback(async (risk: Risk) => {
        if (isDirty && editingId) {
            const ok = await confirm('You have unsaved changes. Discard them?');
            if (!ok) return;
        }
        setViewOnly(true);
        setEditingId(risk.id);
        setForm(risk);
        setCleanFormSnapshot(JSON.stringify(risk));
        setError(null);
        setErrorField(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [editingId, confirm, isDirty]);

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

    const clearForm = useCallback(async () => {
        if (isDirty && editingId) {
            const ok = await confirm('You have unsaved changes. Discard them?');
            if (!ok) return false;
        }
        setEditingId(null);
        setViewOnly(false);
        setForm(getEmptyForm());
        setCleanFormSnapshot(JSON.stringify(getEmptyForm()));
        setError(null);
        setErrorField(null);
        return true;
    }, [editingId, confirm, isDirty]);

    const inherentLevel = getRiskLevel(form.inherent_risk_score);
    const controlsLevel = getRiskLevel(form.controls_rating);
    const residualLevel = getRiskLevel(form.residual_risk_score);

    return {
        department,
        setDepartment,
        showModal,
        setShowModal,
        activeDrawer,
        setActiveDrawer,
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
        saveSuccess,
        setSaveSuccess,
        isDirty,
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