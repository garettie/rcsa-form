import { useState, useEffect, useRef } from 'react';
import { ICONS } from '../constants';

const TUTORIAL_STEPS = [
  {
    target: "#f-assessment_period",
    title: "Assessment Period",
    body: `<p>Enter the time period this submission covers, e.g. <strong>Q1 2026</strong>.</p>`,
  },
  {
    target: ["#f-process_id", "#edit-processes-btn"],
    title: "Process",
    body: `<p>The process is the regular work activity this risk is connected to. Click <strong>"Edit"</strong> to add and manage your processes.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><strong>Examples:</strong> Teller Operations, Payroll Processing, Loan Origination, Cybersecurity, Liquidity Risk Management</div>`,
  },
  {
    target: "#f-risk_description",
    title: "Risk Description",
    body: `<p>Describe the risk using the formula: <strong>"Risk of [bad thing] due to [cause]"</strong></p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 italic leading-relaxed">"Payroll errors or ghost employees due to manual computations"<br>"Unauthorized fund transfers due to compromised credentials"<br>"Late regulatory reports due to manual consolidation"<br>"Excess cash in branches beyond insured limits due to delayed pickups"</div>`,
  },
  {
    target: "#f-possible_causes",
    title: "Possible Causes",
    body: `<p>Why might this risk happen? List the conditions or behaviors that make it more likely. Short phrases are fine.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><em>"Delayed personnel action notices, manual payroll computations"</em><br><em>"Outdated transaction monitoring rules, insufficient staffing"</em><br><em>"Infrequent penetration testing, outdated libraries"</em></div>`,
  },
  {
    target: "#f-root_cause",
    title: "Root Cause",
    body: `<p>Pick the category that best describes the <strong>deepest reason</strong> this risk exists:</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-1"><div><strong>People</strong> — human error, lack of training, misconduct</div><div><strong>Process</strong> — missing, unclear, or broken procedures</div><div><strong>Systems</strong> — technology or software failures</div><div><strong>External Events</strong> — factors outside the organization's control</div></div></div>`,
  },
  {
    target: "#f-event_type",
    title: "Event Type",
    body: `<p>Basel III Operational Risk Event Types.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-1"><div><strong>Execution, delivery and process management</strong> — work errors (most common)</div><div><strong>Business disruption and system failures</strong> — IT outages</div><div><strong>External fraud</strong> — fraud committed by outsider</div></div></div><p class="mt-3">If unsure, check the Reference Guide for details.</p>`,
  },
  {
    target: ["#f-likelihood_score", "#f-impact_score", "#cf-inherent-score"],
    title: "Inherent Risk: Likelihood & Impact",
    body: `<p>Assess the risk <strong>before</strong> considering any controls you have in place.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-2"><div><strong>Likelihood:</strong> How often could this happen?</div><div><strong>Impact:</strong> How bad would it be if it happened?</div></div></div>`,
  },
  {
    target: "#f-control_description",
    title: "Controls",
    body: `<p>What is currently being done to mitigate this risk? Be specific about the actual activities, reviews, or systems in place.</p>`,
  },
  {
    target: "#f-control_type",
    title: "Control Type",
    body: `<p>Pick the category that best describes how the control works:</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-2"><div><strong>Preventive:</strong> Reduces the likelihood of a risk event happening (e.g. dual authorization).</div><div><strong>Detective:</strong> Identifies the occurrence of a risk event (e.g. CCTV, smoke detector).</div><div><strong>Corrective:</strong> Mitigates the aftermath of a risk event (e.g. data backup).</div></div></div>`,
  },
  {
    target: ["#f-control_design_score", "#f-control_implementation_score", "#cf-controls-rating"],
    title: "Control Ratings",
    body: `<p>Rate how effective the controls are:</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-2"><div><strong>Design:</strong> Is the control logically capable of stopping the risk?</div><div><strong>Implementation:</strong> Are people actually following the control?</div></div></div>`,
  },
  {
    target: "#cf-residual",
    title: "Residual Risk",
    body: `<p>This is your final risk score after controls are applied. It is automatically calculated.</p>`,
  },
  {
    target: ["#f-risk_treatment", "#f-action_plan", "#f-action_plan_deadline", "#f-status"],
    title: "Risk Treatment & Action Plan",
    body: `<p>Decide what to do with the residual risk.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-1"><strong>Accept:</strong> Do nothing more.</div><div><strong>Reduce:</strong> Add an action plan to improve controls.</div><div><strong>Avoid:</strong> Stop the activity.</div><div><strong>Transfer:</strong> Insurance/outsourcing.</div></div>`,
  }
];

interface TutorialProps {
  onClose: () => void;
  onOpenRef: () => void;
}

function clearTutorialHighlights() {
  document.querySelectorAll(".tutorial-highlight").forEach((el) => {
    el.classList.remove("tutorial-highlight");
  });
  document.querySelectorAll(".tutorial-highlight-computed").forEach((el) => {
    el.classList.remove("tutorial-highlight-computed");
  });
  document.querySelectorAll(".tutorial-btn-accent").forEach((el) => {
    el.classList.remove("tutorial-btn-accent");
  });
}

function positionTooltip(tooltipEl: HTMLElement, targets: string[]) {
  const tooltipHeight = tooltipEl.offsetHeight;
  const viewH = window.innerHeight;

  let minTop = Infinity;
  let maxBottom = 0;

  targets.forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < minTop) minTop = r.top;
      if (r.bottom > maxBottom) maxBottom = r.bottom;
    }
  });

  if (minTop === Infinity) {
    tooltipEl.style.top = (viewH - tooltipHeight) / 2 + "px";
    return;
  }

  const gap = 12;
  const spaceBelow = viewH - maxBottom;
  const spaceAbove = minTop;

  if (spaceBelow >= tooltipHeight + gap) {
    tooltipEl.style.top = maxBottom + gap + "px";
  } else if (spaceAbove >= tooltipHeight + gap) {
    tooltipEl.style.top = minTop - tooltipHeight - gap + "px";
  } else {
    tooltipEl.style.top = (viewH - tooltipHeight) / 2 + "px";
  }
}

export default function Tutorial({ onClose, onOpenRef }: TutorialProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const totalSteps = TUTORIAL_STEPS.length;
  const stepNum = step + 1;
  const progress = (stepNum / totalSteps) * 100;
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;
  const current = TUTORIAL_STEPS[step];
  const currentTargets = Array.isArray(current.target) ? current.target : [current.target];

  useEffect(() => {
    clearTutorialHighlights();

    let firstEl: HTMLElement | null = null;

    for (const sel of currentTargets) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) {
        if (sel === "#edit-processes-btn") {
          el.classList.add("tutorial-btn-accent");
        } else if (sel.startsWith("#cf-")) {
          el.classList.add("tutorial-highlight-computed");
        } else {
          el.classList.add("tutorial-highlight");
        }
        if (!firstEl) firstEl = el;
      }
    }

    if (firstEl) {
      const rect = firstEl.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - window.innerHeight * 0.25;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
    }

    setTimeout(() => {
      if (tooltipRef.current) {
        positionTooltip(tooltipRef.current, currentTargets);
        setVisible(true);
      }
    }, 150);

    return () => clearTutorialHighlights();
  }, [step, current]);

  return (
    <>
      <div className="fixed inset-0 z-[1200] bg-slate-900/60" onClick={onClose}></div>
      <div
        ref={tooltipRef}
        className={`fixed left-1/2 z-[1300] w-[90%] max-w-md -translate-x-1/2 rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 ${visible ? 'opacity-100' : 'translate-y-4 opacity-0'}`}
      >
        <button 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors" 
          onClick={onClose} 
          dangerouslySetInnerHTML={{__html: ICONS.x}}
        ></button>
        
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-blue-500">Step {stepNum} of {totalSteps}</div>
        <h3 className="mb-3 text-lg font-bold text-slate-800">{current.title}</h3>
        <div className="mb-6 text-sm leading-relaxed text-slate-600" dangerouslySetInnerHTML={{__html: current.body}}></div>
        
        <div className="flex items-center justify-between gap-6">
          {!isLast && (
            <div className="h-1 flex-1 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          )}
          <div className="flex gap-2">
            {!isFirst && (
              <button className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors" onClick={() => setStep(s => s - 1)}>Back</button>
            )}
            {!isLast ? (
              <button className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition-colors" onClick={() => setStep(s => s + 1)}>Next</button>
            ) : (
              <button className="rounded-lg bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-colors" onClick={onOpenRef}>
                Reference Guide
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
