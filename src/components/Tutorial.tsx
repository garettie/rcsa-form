import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useFloating, offset, flip, shift } from '@floating-ui/react';
import { MOCK_RISKS } from '../mockData';

interface TutorialProps {
    onClose: () => void;
    onOpenRef: () => void;
    department?: string;
}

function getTutorialSteps(department?: string) {
    const defaultExamples = `"Financial loss due to ghost employees on payroll"<br>"Unauthorized fund transfers due to compromised credentials"<br>"Late regulatory reports due to manual consolidation"<br>"Excess cash in branches beyond insured limits due to delayed pickups"`;
    
    let riskExamples = defaultExamples;
    if (department) {
        const deptRisks = MOCK_RISKS.filter(r => r.department === department).slice(0, 4);
        if (deptRisks.length > 0) {
            riskExamples = deptRisks.map(r => `"${r.risk_description}"`).join('<br>');
        }
    }

    return [
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
            body: `<p>Describe the risk using the formula: <strong>"Risk of [bad outcome] due to [threat or hazard]"</strong></p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 italic leading-relaxed">${riskExamples}</div>`,
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
            body: `<p>Operational Risk Event Types.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-1"><div><strong>Execution, delivery and process management</strong> — work errors (most common)</div><div><strong>Business disruption and system failures</strong> — IT outages</div><div><strong>External fraud</strong> — fraud committed by outsider</div><div><strong>Internal fraud</strong> — fraud committed by internal party</div><div><strong>Employment practices and workplace safety</strong> — HR and safety claims</div><div><strong>Damage to physical assets</strong> — property and equipment loss</div><div><strong>Clients, products and business practices</strong> — client-facing losses</div></div></div><p class="mt-3">If unsure, check the Reference Guide for details.</p>`,
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
            body: `<p>Decide what to do with the residual risk.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-1"><strong>Accept:</strong> Do nothing more.</div><div><strong>Reduce:</strong> Add an action plan to improve controls.</div><div><strong>Avoid:</strong> Stop the activity.</div><div><strong>Transfer:</strong> Insurance/outsourcing.</div></div><div class="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800 leading-relaxed"><strong>SMART action plans:</strong> Specific (what exactly will be done), Measurable (how you'll know it's done), Achievable (realistic given resources), Relevant (actually reduces this risk), Time-bound (deadline date).</div>`,
        }
    ];
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

export default function Tutorial({ onClose, onOpenRef, department }: TutorialProps) {
    const [step, setStep] = useState(0);
    const [isClosing, setIsClosing] = useState(false);
    const [hasLanded, setHasLanded] = useState(false);
    const [tooltipSize, setTooltipSize] = useState<{ width: number | 'auto', height: number | 'auto' }>({ width: 'auto', height: 'auto' });

    const TUTORIAL_STEPS = useMemo(() => getTutorialSteps(department), [department]);
    
    const current = TUTORIAL_STEPS[step];
    const currentTargets = Array.isArray(current.target) ? current.target : [current.target];
    const isMultiTarget = currentTargets.length > 1;

    const { refs, floatingStyles, isPositioned } = useFloating({
        placement: isMultiTarget ? 'bottom' : 'bottom-start',
        middleware: isMultiTarget
            ? [offset(12), shift({ padding: 16 })]
            : [offset(12), flip(), shift({ padding: 16 })],
        open: !isClosing,
    });

    const totalSteps = TUTORIAL_STEPS.length;
    const stepNum = step + 1;
    const progress = (stepNum / totalSteps) * 100;
    const isFirst = step === 0;
    const isLast = step === totalSteps - 1;

    // Morph Logic: Capture size before step changes
    useEffect(() => {
        const el = refs.floating.current;
        if (el && hasLanded && !isClosing) {
            // Record current size
            const rect = el.getBoundingClientRect();
            setTooltipSize({ width: rect.width, height: rect.height });
            
            // Allow content to change, then measure new size in next frame
            requestAnimationFrame(() => {
                // Clear fixed size to let it calculate auto size based on new content
                el.style.width = 'auto';
                el.style.height = 'auto';
                const newRect = el.getBoundingClientRect();
                
                // Set the NEW size to trigger the transition
                setTooltipSize({ width: newRect.width, height: newRect.height });
                
                // After transition, release to auto for responsiveness
                const timer = setTimeout(() => {
                    setTooltipSize({ width: 'auto', height: 'auto' });
                }, 600); // Slightly longer than transition
                return () => clearTimeout(timer);
            });
        }
    }, [step, hasLanded, isClosing, refs.floating]);

    useEffect(() => {
        if (isPositioned && !hasLanded) {
            setHasLanded(true);
        }
    }, [isPositioned, hasLanded]);

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
            const target = firstEl;
            
            const rect = target.getBoundingClientRect();
            const targetY = window.scrollY + rect.top - window.innerHeight * 0.25;
            window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

            refs.setReference(target);
            
            const timeout = setTimeout(() => {
                refs.setReference(null);
                refs.setReference(target);
            }, 600); // Matches slowed down scroll

            return () => {
                clearTimeout(timeout);
                clearTutorialHighlights();
            };
        }

        return () => clearTutorialHighlights();
    }, [step, current, refs]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 600); // Slowed down
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose();
        } else if ((e.key === 'Enter' || e.key === ' ') && !isLast) {
            e.preventDefault();
            setStep(s => s + 1);
        }
    };

    const isVisible = isPositioned && hasLanded && !isClosing;
    const useTransition = hasLanded;

    return (
        <>
            <div
                className={`fixed inset-0 z-[1200] bg-slate-900/60 transition-opacity duration-500 ${isClosing ? 'opacity-0' : (isPositioned && hasLanded) ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />
            <div
                ref={refs.setFloating}
                className={`tutorial-tooltip fixed z-[1300] w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl overflow-hidden ${useTransition ? 'transition-all duration-500' : ''} ${isClosing ? 'translate-y-4 opacity-0' : isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                style={{
                    ...floatingStyles,
                    width: tooltipSize.width !== 'auto' ? `${tooltipSize.width}px` : 'auto',
                    height: tooltipSize.height !== 'auto' ? `${tooltipSize.height}px` : 'auto',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onKeyDown={handleKeyDown}
                tabIndex={0}
            >
                <button
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={handleClose}
                    aria-label="Close tutorial"
                >
                    <X size={18} />
                </button>

                <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-blue-500">Step {stepNum} of {totalSteps}</div>
                <h3 className="mb-3 text-lg font-bold text-slate-800">{current.title}</h3>
                <div className="mb-6 text-sm leading-relaxed text-slate-600" dangerouslySetInnerHTML={{ __html: current.body }} />

                <div className="flex items-center justify-between gap-6">
                    {!isLast && (
                        <div className="h-1 flex-1 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    )}
                    <div className="flex gap-2">
                        {!isFirst && (
                            <button
                                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                                onClick={() => setStep(s => s - 1)}
                            >
                                Back
                            </button>
                        )}
                        {!isLast ? (
                            <button
                                className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition-colors"
                                onClick={() => setStep(s => s + 1)}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                className="rounded-lg bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-colors"
                                onClick={onOpenRef}
                            >
                                Reference Guide
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
