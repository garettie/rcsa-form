import { useState } from 'react';
import { X } from 'lucide-react';

const REF_TABS = [
  "Risk Categories",
  "Likelihood & Impact",
  "Controls",
  "Risk Treatment",
];

interface ReferenceGuideProps {
  onClose: () => void;
}

function renderRefCategories() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 border-b-2 border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800">Root Cause Categories</h3>
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
        <h3 className="mb-4 border-b-2 border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800">Event Type Classification</h3>
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
        <h3 className="mb-4 border-b-2 border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800">Likelihood</h3>
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
        <h3 className="mb-4 border-b-2 border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800">Impact</h3>
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
        <h3 className="mb-4 border-b-2 border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800">Inherent Risk Matrix (Likelihood × Impact)</h3>
        <div className="flex flex-col items-center gap-4 py-4">
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
        <h3 className="mb-4 border-b-2 border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800">Controls Rating (Design)</h3>
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
        <h3 className="mb-4 border-b-2 border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800">Controls Rating (Implementation)</h3>
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
        <h3 className="mb-4 border-b-2 border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800">Types of Controls</h3>
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
        <h3 className="mb-4 border-b-2 border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800">Residual Risk Matrix (Controls Rating × Inherent Risk Level)</h3>
        <div className="flex flex-col items-center gap-4 py-4">
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
        <h3 className="mb-4 border-b-2 border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800">Risk Treatment Options</h3>
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

export default function ReferenceGuide({ onClose }: ReferenceGuideProps) {
  const [tab, setTab] = useState(0);

  return (
    <div 
      className="fixed inset-0 z-[1100] flex justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm md:p-8" 
      id="ref-overlay" 
      onClick={(e) => { if ((e.target as any).id === 'ref-overlay') onClose(); }}
    >
      <div className="self-start w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl md:p-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="m-0 text-xl font-bold text-slate-800">Reference Guide</h2>
          <button
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            onClick={onClose}
          >
            <X size={16} /> Close
          </button>
        </div>
        
        <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-100">
          {REF_TABS.map((name, i) => (
            <button 
              key={i} 
              className={`-mb-px rounded-t-lg border-b-2 px-6 py-3 text-sm font-bold transition-all ${i === tab ? "border-slate-800 bg-slate-50 text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"}`} 
              onClick={() => setTab(i)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {tab === 0 && renderRefCategories()}
          {tab === 1 && renderRefLikelihoodImpact()}
          {tab === 2 && renderRefControls()}
          {tab === 3 && renderRefTreatment()}
        </div>
      </div>
    </div>
  );
}
