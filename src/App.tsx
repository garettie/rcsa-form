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
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1 className="header-title">
            Agribank RCSA
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="tutorial-btn" onClick={() => setShowTutorial(true)}><HelpCircle size={16} /> How to Use</button>
          <button className="ref-btn" onClick={() => setShowRef(true)}><Book size={16} /> Reference Guide</button>
          <div className="dept-badge">
            {department}
            <button onClick={() => setShowModal(true)} title="Change department" aria-label="Change department" dangerouslySetInnerHTML={{__html: ICONS.x}}></button>
          </div>
          <button className="btn btn-secondary logout-btn" onClick={handleLogout} dangerouslySetInnerHTML={{__html: ICONS.logout}}></button>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="card-title" style={{ marginBottom: 0 }}>{editingId ? "Edit Risk Entry" : "New Risk Entry"}</h2>
          {editingId && <button className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(getEmptyForm()); }} style={{ padding: '6px 12px', fontSize: '13px' }} dangerouslySetInnerHTML={{__html: ICONS.x + ' Cancel'}}></button>}
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-grid">
          <div>
            <label>Assessment Period</label>
            <input id="f-assessment_period" type="text" value={form.assessment_period} onChange={e => { updateForm('assessment_period', e.target.value); setErrorField(null); }} placeholder="e.g. Q1 2025" style={errorField === 'f-assessment_period' ? { borderColor: '#ef4444', borderWidth: '2px' } : {}} />
          </div>
          <div className="span-2">
            <label>Process *</label>
            <div className="process-field-wrap">
              {processes.length === 0 ? (
                <span className="process-empty-msg">No processes yet. Add one using Edit Processes</span>
              ) : (
                <select id="f-process_id" value={form.process_id} onChange={e => { updateForm('process_id', e.target.value); setErrorField(null); }} className={!form.process_id ? "select-empty" : ""} style={errorField === 'f-process_id' ? { borderColor: '#ef4444', borderWidth: '2px' } : {}}>
                  <option value="" disabled>Select process...</option>
                  {processes.map(p => <option key={p.id} value={p.id}>{p.process_name}</option>)}
                </select>
              )}
              <button className="btn btn-secondary" onClick={() => setShowProcessModal(true)} style={{ padding: '6px 14px', fontSize: '13px', whiteSpace: 'nowrap' }} dangerouslySetInnerHTML={{__html: ICONS.edit + ' Edit Processes'}}></button>
            </div>
          </div>

          <div className="span-3">
            <label>Risk Description *</label>
            <textarea id="f-risk_description" rows={2} value={form.risk_description} onChange={e => { updateForm('risk_description', e.target.value); setErrorField(null); }} placeholder="Describe the risk..." required style={errorField === 'f-risk_description' ? { borderColor: '#ef4444', borderWidth: '2px' } : {}}></textarea>
          </div>

          <div className="span-3">
            <label>Possible Causes</label>
            <textarea id="f-possible_causes" rows={2} value={form.possible_causes} onChange={e => { updateForm('possible_causes', e.target.value); setErrorField(null); }} placeholder="Describe possible causes..." style={errorField === 'f-possible_causes' ? { borderColor: '#ef4444', borderWidth: '2px' } : {}}></textarea>
          </div>

          <div>
            <label>Root Cause</label>
            <select id="f-root_cause" value={form.root_cause} onChange={e => { updateForm('root_cause', e.target.value); setErrorField(null); }} style={errorField === 'f-root_cause' ? { borderColor: '#ef4444', borderWidth: '2px' } : {}}>
              {ROOT_CAUSES.map(rc => <option key={rc} value={rc}>{rc}</option>)}
            </select>
          </div>
          <div className="span-2">
            <label>Event Type</label>
            <select id="f-event_type" value={form.event_type} onChange={e => { updateForm('event_type', e.target.value); setErrorField(null); }} style={errorField === 'f-event_type' ? { borderColor: '#ef4444', borderWidth: '2px' } : {}}>
              {EVENT_TYPES.map(et => <option key={et} value={et}>{et}</option>)}
            </select>
          </div>

          <div>
            <label>Likelihood Score</label>
            <select id="f-likelihood_score" value={form.likelihood_score} onChange={e => updateForm('likelihood_score', Number(e.target.value))}>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} - {LIKELIHOOD_LABELS[n as keyof typeof LIKELIHOOD_LABELS]}</option>)}
            </select>
          </div>
          <div>
            <label>Impact Score</label>
            <select id="f-impact_score" value={form.impact_score} onChange={e => updateForm('impact_score', Number(e.target.value))}>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} - {IMPACT_LABELS[n as keyof typeof IMPACT_LABELS]}</option>)}
            </select>
          </div>
          <div>
            <label>Inherent Risk Score</label>
            <div className="computed-field">
              <span className="computed-score" style={{ color: RISK_COLORS[inherentLevel as keyof typeof RISK_COLORS] }}>{form.inherent_risk_score}</span>
              <span className="risk-badge" style={{ background: `${RISK_COLORS[inherentLevel as keyof typeof RISK_COLORS]}18`, color: RISK_COLORS[inherentLevel as keyof typeof RISK_COLORS] }}>{RESIDUAL_RISK_LABELS[inherentLevel as keyof typeof RESIDUAL_RISK_LABELS]}</span>
            </div>
          </div>

          <div className="span-3">
            <label>Control Description</label>
            <textarea id="f-control_description" rows={2} value={form.control_description} onChange={e => { updateForm('control_description', e.target.value); setErrorField(null); }} placeholder="Describe the controls in place..." style={errorField === 'f-control_description' ? { borderColor: '#ef4444', borderWidth: '2px' } : {}}></textarea>
          </div>

          <div>
            <label>Control Type</label>
            <select id="f-control_type" value={form.control_type} onChange={e => { updateForm('control_type', e.target.value); setErrorField(null); }} className={!form.control_type ? "select-empty" : ""} style={errorField === 'f-control_type' ? { borderColor: '#ef4444', borderWidth: '2px' } : {}}>
              <option value="" disabled>Select Control Type...</option>
              {CONTROL_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
            </select>
          </div>
          <div>
            <label>Control Design</label>
            <select id="f-control_design_score" value={form.control_design_score} onChange={e => updateForm('control_design_score', Number(e.target.value))}>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} - {CONTROL_DESIGN_LABELS[n as keyof typeof CONTROL_DESIGN_LABELS]}</option>)}
            </select>
          </div>
          <div>
            <label>Control Implementation</label>
            <select id="f-control_implementation_score" value={form.control_implementation_score} onChange={e => updateForm('control_implementation_score', Number(e.target.value))}>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} - {CONTROL_IMPL_LABELS[n as keyof typeof CONTROL_IMPL_LABELS]}</option>)}
            </select>
          </div>

          <div>
            <label>Controls Rating</label>
            <div className="computed-field">
              <span className="computed-score" style={{ color: RISK_COLORS[controlsLevel as keyof typeof RISK_COLORS] }}>{form.controls_rating}</span>
              <span className="risk-badge" style={{ background: `${RISK_COLORS[controlsLevel as keyof typeof RISK_COLORS]}18`, color: RISK_COLORS[controlsLevel as keyof typeof RISK_COLORS] }}>{CONTROLS_RATING_LABELS[controlsLevel as keyof typeof CONTROLS_RATING_LABELS]}</span>
            </div>
          </div>
          <div className="span-2">
            <label>Residual Risk Score</label>
            <div className="computed-field" id="cf-residual">
              <span className="computed-score" style={{ color: RISK_COLORS[residualLevel as keyof typeof RISK_COLORS] }}>{form.residual_risk_score}</span>
              <span className="risk-badge" style={{ background: `${RISK_COLORS[residualLevel as keyof typeof RISK_COLORS]}18`, color: RISK_COLORS[residualLevel as keyof typeof RISK_COLORS] }}>{RESIDUAL_RISK_LABELS[residualLevel as keyof typeof RESIDUAL_RISK_LABELS]}</span>
            </div>
          </div>

          <div>
            <label>Risk Treatment</label>
            <select id="f-risk_treatment" value={form.risk_treatment} onChange={e => updateForm('risk_treatment', e.target.value)}>
              {RISK_TREATMENTS.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
          </div>
          <div className="span-2">
            <label>Action Plan</label>
            <input id="f-action_plan" type="text" value={form.action_plan} onChange={e => { updateForm('action_plan', e.target.value); setErrorField(null); }} placeholder="What actions will be taken?" style={errorField === 'f-action_plan' ? { borderColor: '#ef4444', borderWidth: '2px' } : {}} />
          </div>

          <div>
            <label>Action Plan Deadline</label>
            <input id="f-action_plan_deadline" type="date" value={form.action_plan_deadline} onChange={e => { updateForm('action_plan_deadline', e.target.value); setErrorField(null); }} style={errorField === 'f-action_plan_deadline' ? { borderColor: '#ef4444', borderWidth: '2px' } : {}} />
          </div>
          <div className="span-2">
            <label>Status</label>
            <select value={form.status} onChange={e => updateForm('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '24px' }}>
          <button className="btn btn-primary" onClick={handleSaveRisk} disabled={saving} dangerouslySetInnerHTML={{__html: ICONS.save + (saving ? ' Saving...' : (editingId ? ' Update Entry' : ' Save Entry'))}}></button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="card-title" style={{ marginBottom: 0 }}>Logged Risks ({risks.length})</h2>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Process</th>
                <th>Risk Description</th>
                <th>Residual</th>
                <th>Status</th>
                <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {risks.length === 0 ? (
                <tr><td colSpan={5} className="empty-state">No risks logged yet.</td></tr>
              ) : (
                risks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(r => {
                  const rl = getRiskLevel(r.residual_risk_score);
                  return (
                    <tr key={r.id}>
                      <td>{r.process_name}</td>
                      <td>{r.risk_description}</td>
                      <td>
                        <span className="risk-badge" style={{ background: `${RISK_COLORS[rl as keyof typeof RISK_COLORS]}18`, color: RISK_COLORS[rl as keyof typeof RISK_COLORS] }}>
                          {r.residual_risk_score} - {RESIDUAL_RISK_LABELS[rl as keyof typeof RESIDUAL_RISK_LABELS]}
                        </span>
                      </td>
                      <td>{r.status}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="icon-btn" onClick={() => handleEditRisk(r)} dangerouslySetInnerHTML={{__html: ICONS.edit}}></button>
                        <button className="icon-btn delete-btn" onClick={() => handleDeleteRisk(r.id)} dangerouslySetInnerHTML={{__html: ICONS.trash}}></button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {risks.length > PAGE_SIZE && (
          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span>Page {page + 1} of {Math.ceil(risks.length / PAGE_SIZE)}</span>
            <button disabled={(page + 1) * PAGE_SIZE >= risks.length} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Select Department</h2>
            <p>Please select your department to continue.</p>
            <select value={department} onChange={e => {
              setDepartment(e.target.value);
              setShowModal(false);
            }}>
              <option value="" disabled>Select...</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      )}

      {showProcessModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Manage Processes</h2>
              <button className="icon-btn" onClick={() => setShowProcessModal(false)} dangerouslySetInnerHTML={{__html: ICONS.x}}></button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input type="text" id="new-process-name" placeholder="New process name..." style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={() => {
                const el = document.getElementById('new-process-name') as HTMLInputElement;
                if (el.value) { handleAddProcess(el.value); el.value = ''; }
              }}>Add</button>
            </div>
            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="table">
                <tbody>
                  {processes.map(p => (
                    <tr key={p.id}>
                      <td>{p.process_name}</td>
                      <td style={{ textAlign: 'right', width: '40px' }}>
                        <button className="icon-btn delete-btn" onClick={() => handleDeleteProcess(p.id)} dangerouslySetInnerHTML={{__html: ICONS.trash}}></button>
                      </td>
                    </tr>
                  ))}
                  {processes.length === 0 && <tr><td colSpan={2} className="empty-state">No processes.</td></tr>}
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
