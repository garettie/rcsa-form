import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Lightbulb, ChevronRight, Search, Book, HelpCircle } from 'lucide-react';
import { MOCK_RISKS } from '../mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

type DrawerMode = 'tutorial' | 'reference' | 'examples' | null;

interface ContentDrawerProps {
  department: string;
  isVisible: boolean;
  activeDrawer: DrawerMode;
  onDrawerChange: (drawer: DrawerMode) => void;
  onSectionChange?: (sectionIdx: number) => void;
  currentOpenSection: number;
}

// ─── Reference Guide data ─────────────────────────────────────────────────────

const REF_TABS = ['Risk Categories', 'Likelihood & Impact', 'Controls', 'Risk Treatment'];

function renderRefCategories() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-800">Root Cause Categories</h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="border-b p-3 text-left">Category</th>
              <th className="border-b p-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr><td className="p-3 text-slate-600"><strong>People</strong></td><td className="p-3 text-slate-600">Losses caused by human error, behavior, or culture.</td></tr>
            <tr><td className="p-3 text-slate-600"><strong>Process</strong></td><td className="p-3 text-slate-600">Risks arising from flaws in the established procedures, policies, or workflows.</td></tr>
            <tr><td className="p-3 text-slate-600"><strong>Systems</strong></td><td className="p-3 text-slate-600">Failures related to technology including software, hardware, and in-house systems.</td></tr>
            <tr><td className="p-3 text-slate-600"><strong>External Events</strong></td><td className="p-3 text-slate-600">Risks resulting from factors outside the organization's direct control but which impact its operations.</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-800">Event Type Classification</h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="border-b p-3 text-left">Event Type</th>
              <th className="border-b p-3 text-left">Definition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            <tr><td className="p-3 font-bold text-slate-700">Internal fraud</td><td className="p-3 text-slate-600">Losses due to acts of a type intended to defraud, misappropriate property or circumvent regulations, the law or company policy, excluding diversity/discrimination events, which involves at least one internal party.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">External fraud</td><td className="p-3 text-slate-600">Losses due to acts of a type intended to defraud, misappropriate property or circumvent the law, by a third party.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Employment practices and workplace safety</td><td className="p-3 text-slate-600">Losses arising from acts inconsistent with employment, health or safety laws or agreements, from payments of personal injury claims, or from diversity/discrimination events.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Clients, products and business practices</td><td className="p-3 text-slate-600">Losses arising from an unintentional or negligent failure to meet a professional obligation to specific clients (including fiduciary and suitability requirements), or from the nature or design of a product.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Damage to physical assets</td><td className="p-3 text-slate-600">Losses arising from loss or damage to physical assets from natural disaster or other events.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Business disruption and system failures</td><td className="p-3 text-slate-600">Losses arising from disruption of business or system failures.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Execution, delivery and process management</td><td className="p-3 text-slate-600">Losses from failed transaction processing or process management, from relations with trade counterparties and vendors.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderRefLikelihoodImpact() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-800">Likelihood</h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="border-b p-3 text-left">Level</th>
              <th className="border-b p-3 text-left">Descriptor</th>
              <th className="border-b p-3 text-left">Probability</th>
              <th className="border-b p-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            <tr><td className="p-3 text-slate-600">4</td><td className="p-3 font-bold text-slate-700">Frequent</td><td className="p-3 text-slate-600">&gt;50%</td><td className="p-3 text-slate-600">More likely than not of happening within a year; historical evidence indicates that such event occurs once or more per year</td></tr>
            <tr><td className="p-3 text-slate-600">3</td><td className="p-3 font-bold text-slate-700">Probable</td><td className="p-3 text-slate-600">10-50%</td><td className="p-3 text-slate-600">The event is likely to occur at some point. It has happened before in the industry or organization and is expected to happen in the next 2-5 years</td></tr>
            <tr><td className="p-3 text-slate-600">2</td><td className="p-3 font-bold text-slate-700">Possible</td><td className="p-3 text-slate-600">2.5-10%</td><td className="p-3 text-slate-600">A small possibility exists for such an event to occur, less than 10% chance of occurrence within a year</td></tr>
            <tr><td className="p-3 text-slate-600">1</td><td className="p-3 font-bold text-slate-700">Rare</td><td className="p-3 text-slate-600">&lt;2.5%</td><td className="p-3 text-slate-600">Very unlikely, may occur in exceptional circumstances</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-800">Impact</h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="border-b p-3 text-left">Level</th>
              <th className="border-b p-3 text-left">Descriptor</th>
              <th className="border-b p-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            <tr><td className="p-3 text-slate-600">4</td><td className="p-3 font-bold text-slate-700">Critical</td><td className="p-3 text-slate-600">Impact that could threaten the firm's survival. Exceptionally high impact that should never happen, large enough to trigger a crisis management process.</td></tr>
            <tr><td className="p-3 text-slate-600">3</td><td className="p-3 font-bold text-slate-700">Major</td><td className="p-3 text-slate-600">Doesn't threaten firm's survival, but large enough to trigger immediate top-level attention and involvement, and with long-term consequences in terms of remediation plans.</td></tr>
            <tr><td className="p-3 text-slate-600">2</td><td className="p-3 font-bold text-slate-700">Moderate</td><td className="p-3 text-slate-600">Significant impact within the firm, but mostly circumvented to internal effect and limited external impact. Limited or no reputation damage toward the direct stakeholders and regulators.</td></tr>
            <tr><td className="p-3 text-slate-600">1</td><td className="p-3 font-bold text-slate-700">Minor</td><td className="p-3 text-slate-600">Big enough to qualify as an incident, but generally accepted as the cost of doing business. To be treated, but without putting current risk management practice into question.</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-800">Inherent Risk Matrix (Likelihood × Impact)</h3>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="overflow-x-auto">
            <div className="flex items-center gap-6">
            <div className="rotate-180 text-[10px] font-bold uppercase tracking-widest text-slate-400 [writing-mode:vertical-lr]">LIKELIHOOD →</div>
            <table className="border-collapse text-center text-[11px] font-bold">
              <thead>
                <tr className="text-slate-500">
                  <th className="p-2"></th><th className="w-20 py-2">1 - Minor</th><th className="w-20 py-2">2 - Moderate</th><th className="w-20 py-2">3 - Major</th><th className="w-20 py-2">4 - Critical</th>
                </tr>
              </thead>
              <tbody>
                <tr><th className="bg-slate-50 pr-4 text-slate-500">4 - Frequent</th><td className="bg-amber-100 text-amber-900 text-center align-middle p-3">4</td><td className="bg-orange-100 text-orange-900 text-center align-middle p-3">8</td><td className="bg-rose-100 text-rose-900 text-center align-middle p-3">12</td><td className="bg-rose-100 text-rose-900 text-center align-middle p-3">16</td></tr>
                <tr><th className="bg-slate-50 pr-4 text-slate-500">3 - Probable</th><td className="bg-emerald-100 text-emerald-900 text-center align-middle p-3">3</td><td className="bg-amber-100 text-amber-900 text-center align-middle p-3">6</td><td className="bg-orange-100 text-orange-900 text-center align-middle p-3">9</td><td className="bg-rose-100 text-rose-900 text-center align-middle p-3">12</td></tr>
                <tr><th className="bg-slate-50 pr-4 text-slate-500">2 - Possible</th><td className="bg-emerald-100 text-emerald-900 text-center align-middle p-3">2</td><td className="bg-amber-100 text-amber-900 text-center align-middle p-3">4</td><td className="bg-amber-100 text-amber-900 text-center align-middle p-3">6</td><td className="bg-orange-100 text-orange-900 text-center align-middle p-3">8</td></tr>
                <tr><th className="bg-slate-50 pr-4 text-slate-500">1 - Rare</th><td className="bg-emerald-100 text-emerald-900 text-center align-middle p-3">1</td><td className="bg-emerald-100 text-emerald-900 text-center align-middle p-3">2</td><td className="bg-emerald-100 text-emerald-900 text-center align-middle p-3">3</td><td className="bg-amber-100 text-amber-900 text-center align-middle p-3">4</td></tr>
              </tbody>
            </table>
          </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">IMPACT →</div>
        </div>
      </div>
    </div>
  );
}

function renderRefControls() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-800">Controls Rating (Design)</h3>
        <table className="w-full border-collapse text-sm text-slate-600">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="border-b p-3 text-left">Rating</th>
              <th className="border-b p-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            <tr><td className="p-3 font-bold text-slate-700">Strong</td><td className="p-3 text-slate-600">The processes completely mitigate risks including rare edge cases.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Satisfactory</td><td className="p-3 text-slate-600">The processes mostly mitigate risks with some exceptions.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Needs Improvement</td><td className="p-3 text-slate-600">The processes have gaps in design and only partially mitigate risks.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Unsatisfactory</td><td className="p-3 text-slate-600">The processes cannot mitigate risks and are seriously flawed in design or operation.</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-800">Controls Rating (Implementation)</h3>
        <table className="w-full border-collapse text-sm text-slate-600">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="border-b p-3 text-left">Level</th>
              <th className="border-b p-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            <tr><td className="p-3 font-bold text-slate-700 whitespace-nowrap">Fully Implemented</td><td className="p-3 text-slate-600">Guidelines, policies and procedures are effectively and adequately implemented and/or applied in all relevant sectors of activity.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700 whitespace-nowrap">Mostly Implemented</td><td className="p-3 text-slate-600">Guidelines, policies and procedures are mostly and adequately implemented and/or applied in all relevant sectors of activity. The deficiencies in implementation and/or application may <em>slightly</em> increase the vulnerability to risk.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700 whitespace-nowrap">Partially Implemented</td><td className="p-3 text-slate-600">Guidelines, policies and procedures are not effectively and adequately implemented and/or applied in all relevant sectors of activity. The deficiencies in implementation and/or application may <em>materially increase</em> the vulnerability to risk.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700 whitespace-nowrap">Not Implemented</td><td className="p-3 text-slate-600">Guidelines, policies and procedures are not effectively and adequately implemented and/or applied in all relevant sectors of activity. The deficiencies in implementation and/or application are <em>significant</em> and <em>materially increase</em> the vulnerability to risk.</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-800">Types of Controls</h3>
        <table className="w-full border-collapse text-sm text-slate-600">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="border-b p-3 text-left">Type</th>
              <th className="border-b p-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            <tr><td className="p-3 font-bold text-slate-700">Preventive</td><td className="p-3 text-slate-600">Reduces the likelihood of a risk event happening (dual authorization, segregation of duties)</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Detective</td><td className="p-3 text-slate-600">Identifies the occurrence of a risk event to minimize the impact (CCTV, smoke detector)</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Corrective</td><td className="p-3 text-slate-600">Mitigates the aftermath of a risk event (data backup, crisis management plans)</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">None</td><td className="p-3 text-slate-600">No controls in place</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-800">Residual Risk Matrix (Controls Rating × Inherent Risk Level)</h3>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="overflow-x-auto">
            <div className="flex items-center gap-6">
            <div className="rotate-180 text-[10px] font-bold uppercase tracking-widest text-slate-400 [writing-mode:vertical-lr]">CONTROLS RATING →</div>
            <table className="border-collapse text-center text-[11px] font-bold">
              <thead>
                <tr className="text-slate-500">
                  <th className="p-2"></th><th className="w-20 py-2">Minor</th><th className="w-20 py-2">Moderate</th><th className="w-20 py-2">Major</th><th className="w-20 py-2">Critical</th>
                </tr>
              </thead>
              <tbody>
                <tr><th className="bg-slate-50 pr-4 text-slate-500">Unsatisfactory</th><td className="bg-amber-100 text-amber-900 text-center align-middle p-3">4</td><td className="bg-orange-100 text-orange-900 text-center align-middle p-3">8</td><td className="bg-rose-100 text-rose-900 text-center align-middle p-3">12</td><td className="bg-rose-100 text-rose-900 text-center align-middle p-3">16</td></tr>
                <tr><th className="bg-slate-50 pr-4 text-slate-500">Needs Improvement</th><td className="bg-emerald-100 text-emerald-900 text-center align-middle p-3">3</td><td className="bg-amber-100 text-amber-900 text-center align-middle p-3">6</td><td className="bg-orange-100 text-orange-900 text-center align-middle p-3">9</td><td className="bg-rose-100 text-rose-900 text-center align-middle p-3">12</td></tr>
                <tr><th className="bg-slate-50 pr-4 text-slate-500">Satisfactory</th><td className="bg-emerald-100 text-emerald-900 text-center align-middle p-3">2</td><td className="bg-amber-100 text-amber-900 text-center align-middle p-3">4</td><td className="bg-amber-100 text-amber-900 text-center align-middle p-3">6</td><td className="bg-orange-100 text-orange-900 text-center align-middle p-3">8</td></tr>
                <tr><th className="bg-slate-50 pr-4 text-slate-500">Strong</th><td className="bg-emerald-100 text-emerald-900 text-center align-middle p-3">1</td><td className="bg-emerald-100 text-emerald-900 text-center align-middle p-3">2</td><td className="bg-emerald-100 text-emerald-900 text-center align-middle p-3">3</td><td className="bg-amber-100 text-amber-900 text-center align-middle p-3">4</td></tr>
              </tbody>
            </table>
          </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">INHERENT RISK LEVEL →</div>
        </div>
      </div>
    </div>
  );
}

function renderRefTreatment() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-800">Risk Treatment Options</h3>
        <table className="w-full border-collapse text-sm text-slate-600">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="border-b p-3 text-left">Option</th>
              <th className="border-b p-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            <tr><td className="p-3 font-bold text-slate-700">Accept</td><td className="p-3 text-slate-600">Retaining the risk by informed decision. Taking or increasing the risk in order to pursue an opportunity.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Reduce</td><td className="p-3 text-slate-600">Changing the likelihood and/or the impact.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Avoid</td><td className="p-3 text-slate-600">Avoiding the risk by deciding not to start or continue with the activity that gives rise to the risk. Removing the risk source.</td></tr>
            <tr><td className="p-3 font-bold text-slate-700">Transfer</td><td className="p-3 text-slate-600">Sharing the risk with another party or parties (including contracts and risk financing).</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tutorial data ────────────────────────────────────────────────────────────

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
      target: '#f-assessment_period',
      title: 'Assessment Period',
      body: `<p>Enter the time period this submission covers, e.g. <strong>Q1 2026</strong>.</p>`,
    },
    {
      target: ['#f-process_id', '#f-process_id-empty', '#edit-processes-btn'],
      title: 'Process',
      body: `<p>The process is the regular work activity this risk is connected to. Click <strong>"Edit"</strong> to add and manage your processes.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><strong>Examples:</strong> Teller Operations, Payroll Processing, Loan Origination, Cybersecurity, Liquidity Risk Management</div>`,
    },
    {
      target: '#f-risk_description',
      title: 'Risk Description',
      body: `<p>Describe the risk using the formula: <strong>"Risk of [bad outcome] due to [threat or hazard]"</strong></p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 italic leading-relaxed">${riskExamples}</div>`,
    },
    {
      target: '#f-possible_causes',
      title: 'Possible Causes',
      body: `<p>Why might this risk happen? List the conditions or behaviors that make it more likely. Short phrases are fine.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><em>"Delayed personnel action notices, manual payroll computations"</em><br><em>"Outdated transaction monitoring rules, insufficient staffing"</em><br><em>"Infrequent penetration testing, outdated libraries"</em></div>`,
    },
    {
      target: '#f-root_cause',
      title: 'Root Cause',
      body: `<p>Pick the category that best describes the <strong>deepest reason</strong> this risk exists:</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-1"><div><strong>People</strong> — human error, lack of training, misconduct</div><div><strong>Process</strong> — missing, unclear, or broken procedures</div><div><strong>Systems</strong> — technology or software failures</div><div><strong>External Events</strong> — factors outside the organization's control</div></div></div>`,
    },
    {
      target: '#f-event_type',
      title: 'Event Type',
      body: `<p>Operational Risk Event Types.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-1"><div><strong>Execution, delivery and process management</strong> — work errors (most common)</div><div><strong>Business disruption and system failures</strong> — IT outages</div><div><strong>External fraud</strong> — fraud committed by outsider</div><div><strong>Internal fraud</strong> — fraud committed by internal party</div><div><strong>Employment practices and workplace safety</strong> — HR and safety claims</div><div><strong>Damage to physical assets</strong> — property and equipment loss</div><div><strong>Clients, products and business practices</strong> — client-facing losses</div></div></div><p class="mt-3">If unsure, check the Reference Guide for details.</p>`,
    },
    {
      target: ['#f-likelihood_score', '#f-impact_score', '#cf-inherent-score'],
      title: 'Inherent Risk: Likelihood & Impact',
      body: `<p>Assess the risk <strong>before</strong> considering any controls you have in place.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-2"><div><strong>Likelihood:</strong> How often could this happen?</div><div><strong>Impact:</strong> How bad would it be if it happened?</div></div></div>`,
    },
    {
      target: '#f-control_description',
      title: 'Controls',
      body: `<p>What is currently being done to mitigate this risk? Be specific about the actual activities, reviews, or systems in place.</p>`,
    },
    {
      target: '#f-control_type',
      title: 'Control Type',
      body: `<p>Pick the category that best describes how the control works:</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-2"><div><strong>Preventive:</strong> Reduces the likelihood of a risk event happening (e.g. dual authorization).</div><div><strong>Detective:</strong> Identifies the occurrence of a risk event (e.g. CCTV, smoke detector).</div><div><strong>Corrective:</strong> Mitigates the aftermath of a risk event (e.g. data backup).</div></div></div>`,
    },
    {
      target: ['#f-control_design_score', '#f-control_implementation_score', '#cf-controls-rating'],
      title: 'Control Ratings',
      body: `<p>Rate how effective the controls are:</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-2"><div><strong>Design:</strong> Is the control logically capable of stopping the risk?</div><div><strong>Implementation:</strong> Are people actually following the control?</div></div></div>`,
    },
    {
      target: '#cf-residual',
      title: 'Residual Risk',
      body: `<p>This is your final risk score after controls are applied. It is automatically calculated.</p>`,
    },
    {
      target: ['#f-risk_treatment', '#f-action_plan', '#f-action_plan_deadline', '#f-status'],
      title: 'Risk Treatment & Action Plan',
      body: `<p>Decide what to do with the residual risk.</p><div class="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 leading-relaxed"><div class="space-y-1"><strong>Accept:</strong> Do nothing more.</div><div><strong>Reduce:</strong> Add an action plan to improve controls.</div><div><strong>Avoid:</strong> Stop the activity.</div><div><strong>Transfer:</strong> Insurance/outsourcing.</div></div><div class="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800 leading-relaxed"><strong>SMART action plans:</strong> Specific (what exactly will be done), Measurable (how you'll know it's done), Achievable (realistic given resources), Relevant (actually reduces this risk), Time-bound (deadline date).</div>`,
    },
  ];
}

function clearTutorialHighlights() {
  document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
  document.querySelectorAll('.tutorial-highlight-computed').forEach(el => el.classList.remove('tutorial-highlight-computed'));
  document.querySelectorAll('.tutorial-btn-accent').forEach(el => el.classList.remove('tutorial-btn-accent'));
}

const STEP_TO_SECTION = [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 3];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TutorialContentProps {
  department?: string;
  onSectionChange?: (sectionIdx: number) => void;
  onOpenRef: () => void;
  currentOpenSection: number;
}

function TutorialContent({ department, onSectionChange, onOpenRef, currentOpenSection }: TutorialContentProps) {
  const [step, setStep] = useState(() => currentOpenSection >= 0 ? STEP_TO_SECTION.indexOf(currentOpenSection) : 0);
  const prevSectionRef = useRef(STEP_TO_SECTION[0]);

  const TUTORIAL_STEPS = useMemo(() => getTutorialSteps(department), [department]);
  const current = TUTORIAL_STEPS[step];
  const currentTargets = useMemo(
    () => (Array.isArray(current.target) ? current.target : [current.target]),
    [current.target],
  );

  const totalSteps = TUTORIAL_STEPS.length;
  const stepNum = step + 1;
  const progress = (stepNum / totalSteps) * 100;
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  useEffect(() => {
    clearTutorialHighlights();

    const curSection = STEP_TO_SECTION[step];
    const sectionChanged = curSection !== prevSectionRef.current;
    prevSectionRef.current = curSection;

    onSectionChange?.(curSection);

    const timer = setTimeout(() => {
      for (const sel of currentTargets) {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (el) {
          if (sel === '#edit-processes-btn') {
            el.classList.add('tutorial-btn-accent');
          } else if (sel.startsWith('#cf-')) {
            el.classList.add('tutorial-highlight-computed');
          } else {
            el.classList.add('tutorial-highlight');
          }
        }
      }
    }, sectionChanged ? 450 : 0);

    return () => {
      clearTimeout(timer);
      clearTutorialHighlights();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, currentTargets]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-blue-500">
          Step {stepNum} of {totalSteps}
        </div>
        <h3 className="mb-3 text-lg font-bold text-slate-800">{current.title}</h3>
        <div
          className="text-sm leading-relaxed text-slate-600"
          dangerouslySetInnerHTML={{ __html: current.body }}
        />
      </div>

      <div className="border-t border-slate-100 bg-white p-4">
        <div className="mb-3 h-1 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            {!isFirst && (
              <button
                className="rounded-md bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                onClick={() => setStep(s => s - 1)}
              >
                Back
              </button>
            )}
          </div>
          <div>
            {!isLast ? (
              <button
                className="rounded-md bg-blue-600 px-6 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                onClick={() => setStep(s => s + 1)}
              >
                Next
              </button>
            ) : (
              <button
                className="rounded-md bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                onClick={onOpenRef}
              >
                Reference Guide
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReferenceContentProps {
  refTab: number;
  setRefTab: (tab: number) => void;
}

function ReferenceContent({ refTab, setRefTab }: ReferenceContentProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-white px-4 pt-2">
        {REF_TABS.map((name, i) => (
          <button
            key={i}
            className={`-mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              i === refTab
                ? 'border-slate-800 bg-slate-50 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-600'
            }`}
            onClick={() => setRefTab(i)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        <div>
          {refTab === 0 && renderRefCategories()}
          {refTab === 1 && renderRefLikelihoodImpact()}
          {refTab === 2 && renderRefControls()}
          {refTab === 3 && renderRefTreatment()}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContentDrawer({
  department,
  isVisible,
  activeDrawer,
  onDrawerChange,
  onSectionChange,
  currentOpenSection,
}: ContentDrawerProps) {
  const [refTab, setRefTab] = useState(0);

  const isOpen = activeDrawer !== null;

  useEffect(() => {
    if (activeDrawer !== 'tutorial') {
      clearTutorialHighlights();
    }
  }, [activeDrawer]);

  if (!isVisible) return null;

  // trigger offset = drawer + margins
  const triggerRight = isOpen
    ? activeDrawer === 'reference'
      ? 'right-[688px]'   // 640 + 32 + 16
      : 'right-[432px]'   // 400 + 32
    : 'right-8';

  const drawerWidth = activeDrawer === 'reference' ? 'w-[640px]' : 'w-[400px]';

  const headerConfig = {
    tutorial: {
      icon: <HelpCircle size={20} />,
      iconBg: 'bg-blue-100 text-blue-600',
      title: 'How to Use',
      subtitle: 'Step-by-step guide',
    },
    reference: {
      icon: <Book size={20} />,
      iconBg: 'bg-emerald-100 text-emerald-600',
      title: 'Reference Guide',
      subtitle: 'Definitions & scoring matrices',
    },
    examples: {
      icon: <Lightbulb size={20} />,
      iconBg: 'bg-amber-100 text-amber-600',
      title: 'Examples',
      subtitle: department || 'Select Department',
    },
  } as const;

  const header = activeDrawer ? headerConfig[activeDrawer] : null;

  return (
    <>
      <div
        className={`drawer-backdrop fixed inset-0 z-[1400] bg-slate-900/20 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => onDrawerChange(null)}
      />

      <div
        className={`fixed top-1/2 z-[1510] flex items-center gap-3 bouncy-transition ${triggerRight} -translate-y-1/2`}
      >
        <div
          className={`flex flex-col gap-2 transition-all duration-300 ${isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}
        >
          <button
            onClick={() => onDrawerChange('tutorial')}
            className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 shadow-sm transition-all hover:bg-blue-100 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            title="How to Use"
            aria-label="How to Use"
          >
            <HelpCircle size={13} className="text-blue-600 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-blue-700 hidden xl:inline">How to Use</span>
          </button>
          <button
            onClick={() => onDrawerChange('reference')}
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 shadow-sm transition-all hover:bg-emerald-100 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            title="Reference Guide"
            aria-label="Reference Guide"
          >
            <Book size={13} className="text-emerald-600 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-emerald-700 hidden xl:inline">Reference Guide</span>
          </button>
          <button
            onClick={() => onDrawerChange('examples')}
            className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 shadow-sm transition-all hover:bg-orange-100 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
            title="Examples"
            aria-label="Examples"
          >
            <Search size={13} className="text-orange-600 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-orange-700 hidden xl:inline">Examples</span>
          </button>
        </div>

        <div
          className={`transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none absolute'}`}
        >
          <button
            onClick={() => onDrawerChange(null)}
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-xl transition-all hover:bg-slate-50 hover:text-slate-700 active:scale-90"
            title="Close"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>

      <div
        className={`content-drawer fixed right-0 top-0 bottom-0 z-[1500] m-4 flex flex-col bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] pointer-events-auto border border-slate-200 rounded-2xl overflow-hidden ${drawerWidth} ${isOpen ? 'open' : ''}`}
      >
        {header && (
          <div className="flex items-center justify-between border-b border-slate-100 bg-white p-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${header.iconBg}`}>
                {header.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{header.title}</h2>
                <p className="text-xs text-slate-500">{header.subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => onDrawerChange(null)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {activeDrawer === 'examples' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {!department ? (
              <div className="text-center text-sm text-slate-500 py-10">Please select a department to see relevant examples.</div>
            ) : (() => {
              const examples = MOCK_RISKS.filter(r => r.department === department);
              return examples.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-10">No examples found for this department.</div>
              ) : (
                examples.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3">
                      <h3 className="text-sm font-bold text-slate-800">{ex.process_name}</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Risk Description</span>
                        <p className="text-sm text-slate-700 leading-relaxed">{ex.risk_description}</p>
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Possible Causes</span>
                        <p className="text-sm text-slate-600 leading-relaxed">{ex.possible_causes}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          Root: {ex.root_cause}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                          {ex.event_type}
                        </span>
                      </div>
                      <div className="border-t border-slate-100 pt-4">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Controls</span>
                        <p className="text-sm text-slate-700 leading-relaxed mb-2">{ex.control_description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            {ex.control_type}
                          </span>
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                            Treatment: {ex.risk_treatment}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              );
            })()}
          </div>
        )}

        {activeDrawer === 'reference' && (
          <ReferenceContent refTab={refTab} setRefTab={setRefTab} />
        )}

        {activeDrawer === 'tutorial' && (
          <TutorialContent
            department={department}
            onSectionChange={onSectionChange}
            onOpenRef={() => onDrawerChange('reference')}
            currentOpenSection={currentOpenSection}
          />
        )}
      </div>
    </>
  );
}
