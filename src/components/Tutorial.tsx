import { useState, useEffect, useRef } from 'react';
import { ICONS } from '../constants';

const TUTORIAL_STEPS = [
  {
    target: "#f-assessment_period",
    title: "Assessment Period",
    body: `<p>Enter the time period this submission covers, e.g. <strong>Q1 2026</strong>.</p>`,
  },
  {
    target: "#f-process_id",
    title: "Process",
    body: `<p>The process is the regular work activity this risk is connected to. Click "Edit Processes" to add and manage your processes.</p><div class="example-box"><strong>Examples:</strong> Teller Operations, Payroll Processing, Loan Origination, Cybersecurity, Liquidity Risk Management</div>`,
    softTarget: "#edit-processes-btn"
  },
  {
    target: "#f-risk_description",
    title: "Risk Description",
    body: `<p>Describe the risk using the formula: <strong>"Risk of [bad thing] due to [cause]"</strong></p><div class="example-box"><em>"Payroll errors or ghost employees due to manual computations"</em><br><em>"Unauthorized fund transfers due to compromised credentials"</em><br><em>"Late regulatory reports due to manual consolidation"</em><br><em>"Excess cash in branches beyond insured limits due to delayed pickups"</em></div>`,
  },
  {
    target: "#f-possible_causes",
    title: "Possible Causes",
    body: `<p>Why might this risk happen? List the conditions or behaviors that make it more likely. Short phrases are fine.</p><div class="example-box"><em>"Delayed personnel action notices, manual payroll computations"</em><br><em>"Outdated transaction monitoring rules, insufficient staffing"</em><br><em>"Infrequent penetration testing, outdated libraries"</em></div>`,
  },
  {
    target: "#f-root_cause",
    title: "Root Cause",
    body: `<p>Pick the category that best describes the <strong>deepest reason</strong> this risk exists:</p><div class="example-box"><strong>People</strong> — human error, lack of training, misconduct<br><strong>Process</strong> — missing, unclear, or broken procedures<br><strong>Systems</strong> — technology or software failures<br><strong>External Events</strong> — things outside the bank (weather, fraud by outsiders, new regulations)</div>`,
  },
  {
    target: "#f-event_type",
    title: "Event Type",
    body: `<p>Basel III Operational Risk Event Types.</p><div class="example-box"><strong>Execution, delivery and process management</strong> — work errors (most common)<br><strong>Business disruption and system failures</strong> — IT outages<br><strong>External fraud</strong> — fraud committed by outsider<br><strong>Employment practices and workplace safety</strong> — HR/safety issues<br><strong>Internal fraud</strong> — fraud committed by employees<br><strong>Damage to physical assets</strong> — fire, natural disasters etc.<br><strong>Clients, products and business practices</strong> — customer service problems, data protection, disclosure</div><p>If unsure, check the Reference Guide for details.</p>`,
  },
  {
    target: "#f-likelihood_score",
    title: "Inherent Risk: Likelihood & Impact",
    body: `<p>Assess the risk <strong>before</strong> considering any controls you have in place.</p><div class="example-box"><strong>Likelihood:</strong> How often could this happen?<br><strong>Impact:</strong> How bad would it be if it happened?</div>`,
  },
  {
    target: "#f-control_description",
    title: "Controls",
    body: `<p>What is currently being done to mitigate this risk? Be specific about the actual activities, systems, or reviews in place.</p>`,
  },
  {
    target: "#f-control_design_score",
    title: "Control Ratings",
    body: `<p>Rate how good the controls are.</p><div class="example-box"><strong>Design:</strong> Is the control logically capable of stopping the risk?<br><strong>Implementation:</strong> Are people actually following the control?</div>`,
  },
  {
    target: "#cf-residual",
    title: "Residual Risk",
    body: `<p>This is your final risk score after controls are applied. It is automatically calculated.</p>`,
  },
  {
    target: "#f-risk_treatment",
    title: "Risk Treatment & Action Plan",
    body: `<p>Decide what to do with the residual risk.</p><div class="example-box"><strong>Accept:</strong> Do nothing more.<br><strong>Reduce:</strong> Add an action plan to improve controls.<br><strong>Avoid:</strong> Stop the activity.<br><strong>Transfer:</strong> Insurance/outsourcing.</div><p>If you choose to Reduce, enter an Action Plan and Deadline.</p>`,
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

function positionTooltip(tooltipEl: HTMLElement, step: typeof TUTORIAL_STEPS[0]) {
  const tooltipHeight = tooltipEl.offsetHeight;
  const viewH = window.innerHeight;

  if (!step.target) {
    tooltipEl.style.top = (viewH - tooltipHeight) / 2 + "px";
    return;
  }

  const targets = Array.isArray(step.target)
    ? step.target
    : [step.target];

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

  const gap = 8;
  const spaceBelow = viewH - maxBottom;
  const spaceAbove = minTop;

  if (spaceBelow >= tooltipHeight + gap) {
    tooltipEl.style.top = maxBottom + gap + "px";
  } else if (spaceAbove >= tooltipHeight + gap) {
    tooltipEl.style.top = minTop - tooltipHeight - gap + "px";
  } else {
    tooltipEl.style.top = viewH - tooltipHeight - 8 + "px";
  }
}

export default function Tutorial({ onClose, onOpenRef }: TutorialProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const totalSteps = TUTORIAL_STEPS.length;
  const stepNum = step + 1;
  const progress = (stepNum / totalSteps) * 100;
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;
  const current = TUTORIAL_STEPS[step];

  useEffect(() => {
    clearTutorialHighlights();

    if (!current.target) {
      if (tooltipRef.current) {
        positionTooltip(tooltipRef.current, current);
      }
      if (isFirstRender) {
        setVisible(true);
        setIsFirstRender(false);
      }
      return;
    }

    const targets = Array.isArray(current.target)
      ? current.target
      : [current.target];

    let firstEl: HTMLElement | null = null;

    for (const sel of targets) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) {
        if (sel.startsWith("#cf-")) {
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

    if (current.softTarget) {
      const softEl = document.querySelector(current.softTarget);
      if (softEl) softEl.classList.add("tutorial-btn-accent");
    }

    setTimeout(() => {
      if (tooltipRef.current) {
        positionTooltip(tooltipRef.current, current);
      }
      if (isFirstRender) {
        setVisible(true);
        setIsFirstRender(false);
      }
    }, 150);

    return () => {
      clearTutorialHighlights();
    };
  }, [step, current, isFirstRender]);

  const handleNext = () => {
    setStep(s => Math.min(s + 1, totalSteps - 1));
  };

  const handlePrev = () => {
    setStep(s => Math.max(s - 1, 0));
  };

  return (
    <>
      <div className="tutorial-overlay" onClick={onClose}></div>
      <div
        ref={tooltipRef}
        className={`tutorial-tooltip ${visible ? 'visible' : ''}`}
        style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 960,
          transition: 'opacity 0.25s ease, top 0.35s ease'
        }}
      >
        <button className="tutorial-close-x" onClick={onClose} title="Close tutorial" dangerouslySetInnerHTML={{__html: ICONS.x}}></button>
        <div id="tut-content">
          <div className="tutorial-step-counter">Step {stepNum} of {totalSteps}</div>
          <h3>{current.title}</h3>
          <div dangerouslySetInnerHTML={{__html: current.body}}></div>
          <div className="tutorial-actions">
            {!isLast && (
              <div className="tutorial-progress">
                <div className="tutorial-progress-bar">
                  <div className="tutorial-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              {!isFirst && (
                <button className="btn btn-secondary" onClick={handlePrev}>Prev</button>
              )}
              {!isLast ? (
                <button className="btn btn-primary" onClick={handleNext} style={{ background: '#3b82f6' }}>Next</button>
              ) : (
                <button className="btn btn-primary" onClick={onOpenRef} style={{ background: '#059669' }}>
                  Open Reference Guide
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
