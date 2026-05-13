import { useEffect, useState } from 'react';
import { useRCSA } from './hooks/useRCSA';
import { DEPARTMENTS, ICONS } from './constants';
import Login from './components/Login';
import RiskForm from './components/RiskForm';
import RiskTable from './components/RiskTable';
import ProcessModal from './components/ProcessModal';
import ContentDrawer from './components/ContentDrawer';

export default function App() {
    const {
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
        errorField,
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
        saveSuccess,
        setSaveSuccess,
        handleDeleteRisk,
        handleEditRisk,
        handleViewRisk,
        handleAddProcess,
        handleDeleteProcess,
        updateForm,
        clearForm,
        inherentLevel,
        controlsLevel,
        residualLevel,
    } = useRCSA();

    const [tutorialTargetSection, setTutorialTargetSection] = useState<number | null>(null);
    const [currentOpenSection, setCurrentOpenSection] = useState(-1);

    // Clear tutorial section highlight when leaving tutorial mode
    const handleDrawerChange = (drawer: 'tutorial' | 'reference' | 'examples' | null) => {
        if (drawer !== 'tutorial') setTutorialTargetSection(null);
        setActiveDrawer(drawer);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (editingId && !viewOnly) {
                    handleSaveRisk();
                }
                return;
            }
            if (e.key === 'Escape') {
                if (showModal && department) {
                    setShowModal(false);
                } else if (editingId) {
                    clearForm();
                } else if (activeDrawer) {
                    setActiveDrawer(null);
                }
                return;
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [showModal, department, editingId, viewOnly, handleSaveRisk, clearForm, activeDrawer, setActiveDrawer, setShowModal]);

    if (checkingAuth) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
    }

    if (!authenticated) {
        return <Login onLogin={handleLogin} />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                <div className="text-sm font-medium text-slate-500">Loading your workspace...</div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl p-6">
            <div className={`edit-overlay-bg ${editingId ? 'active' : ''}`} onClick={clearForm} />

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Risk and Control Self-Assessment
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                        {department}
                        <button className="ml-1 flex items-center text-slate-400 hover:text-slate-600" onClick={() => { setShowModal(true); setActiveDrawer(null); }} title="Change department" aria-label="Change department"><ICONS.x size={16} /></button>
                    </div>
                    <button className="flex items-center rounded-lg border border-slate-200 bg-white p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all" onClick={handleLogout} title="Logout"><ICONS.logout size={16} /></button>
                </div>
            </div>

            {saveSuccess && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.36 5.65l-4 4a.5.5 0 0 1-.7 0l-2-2a.5.5 0 1 1 .7-.7L7 9.29l3.65-3.64a.5.5 0 0 1 .7.7z"/></svg>
                    <span>Risk saved successfully.</span>
                    <button className="ml-auto flex items-center text-emerald-500 hover:text-emerald-700 transition-colors" onClick={() => setSaveSuccess(false)} aria-label="Dismiss">
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
                    </button>
                </div>
            )}

            <RiskForm
                form={form}
                viewOnly={viewOnly}
                editingId={editingId}
                error={error}
                errorField={errorField}
                processes={processes}
                saving={saving}
                inherentLevel={inherentLevel}
                controlsLevel={controlsLevel}
                residualLevel={residualLevel}
                updateForm={updateForm}
                handleSaveRisk={handleSaveRisk}
                onClearForm={clearForm}
                onOpenProcessModal={() => setShowProcessModal(true)}
                tutorialTargetSection={tutorialTargetSection}
                onOpenSectionChange={setCurrentOpenSection}
            />

            <RiskTable
                risks={risks}
                page={page}
                onView={handleViewRisk}
                onEdit={handleEditRisk}
                onDelete={handleDeleteRisk}
                onPageChange={setPage}
            />

            {/* Modals */}
            {showModal && (
                <div className="modal-overlay" onClick={() => { if (department) setShowModal(false); }}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="mb-1 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">Select Department</h2>
                            {department && (
                                <button className="flex items-center text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowModal(false)} aria-label="Close"><ICONS.x size={18} /></button>
                            )}
                        </div>
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

            <ProcessModal
                show={showProcessModal}
                processes={processes}
                onClose={() => setShowProcessModal(false)}
                onAdd={handleAddProcess}
                onDelete={handleDeleteProcess}
            />

            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h2 className="mb-1 text-xl font-bold text-slate-800">Confirm</h2>
                        <p className="mb-6 text-sm text-slate-500">{confirmMessage}</p>
                        <div className="flex justify-end gap-3">
                            <button className="btn btn-secondary" onClick={() => confirmResolve?.(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => confirmResolve?.(true)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <ContentDrawer
                department={department}
                isVisible={!showModal}
                activeDrawer={activeDrawer}
                onDrawerChange={handleDrawerChange}
                onSectionChange={setTutorialTargetSection}
                currentOpenSection={currentOpenSection}
            />
        </div>
    );
}
