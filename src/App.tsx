import { useEffect } from 'react';
import { Book, HelpCircle } from 'lucide-react';
import { useRCSA } from './hooks/useRCSA';
import { DEPARTMENTS, ICONS } from './constants';
import Login from './components/Login';
import RiskForm from './components/RiskForm';
import RiskTable from './components/RiskTable';
import ProcessModal from './components/ProcessModal';
import ReferenceGuide from './components/ReferenceGuide';
import Tutorial from './components/Tutorial';
import ExamplesDrawer from './components/ExamplesDrawer';

export default function App() {
    const {
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

    useEffect(() => {
        if (!showModal || !department) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [showModal, department, setShowModal]);

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
                    <button className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100" onClick={() => setShowTutorial(true)}><HelpCircle size={16} /> How to Use</button>
                    <button className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100" onClick={() => setShowRef(true)}><Book size={16} /> Reference Guide</button>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                        {department}
                        <button className="ml-1 flex items-center text-slate-400 hover:text-slate-600" onClick={() => setShowModal(true)} title="Change department" aria-label="Change department"><ICONS.x size={16} /></button>
                    </div>
                    <button className="flex items-center rounded-lg border border-slate-200 bg-white p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all" onClick={handleLogout} title="Logout"><ICONS.logout size={16} /></button>
                </div>
            </div>

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

            {showRef && <ReferenceGuide onClose={() => setShowRef(false)} />}
            {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} onOpenRef={() => { setShowTutorial(false); setShowRef(true); }} department={department} />}
            <ExamplesDrawer department={department} isVisible={!showModal} />
        </div>
    );
}