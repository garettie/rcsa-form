import { useState } from 'react';
import { ICONS } from '../constants';

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
    <>
      <h3>Root Cause Categories</h3>
      <table className="ref-table">
        <thead><tr><th>Category</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><strong>People</strong></td><td>Losses caused by human error, behavior, or culture.</td></tr>
          <tr><td><strong>Process</strong></td><td>Risks arising from flaws in the established procedures, policies, or workflows.</td></tr>
          <tr><td><strong>Systems</strong></td><td>Failures related to technology including software, hardware, and in-house systems.</td></tr>
          <tr><td><strong>External Events</strong></td><td>Risks resulting from factors outside the organization's direct control but which impact its operations.</td></tr>
        </tbody>
      </table>

      <h3>Event Type Classification</h3>
      <table className="ref-table">
        <thead><tr><th>Event Type</th><th>Definition</th></tr></thead>
        <tbody>
          <tr><td><strong>Internal fraud</strong></td><td>Losses due to acts of a type intended to defraud, misappropriate property or circumvent regulations, the law or company policy, excluding diversity/discrimination events, which involves at least one internal party.</td></tr>
          <tr><td><strong>External fraud</strong></td><td>Losses due to acts of a type intended to defraud, misappropriate property or circumvent the law, by a third party.</td></tr>
          <tr><td><strong>Employment practices and workplace safety</strong></td><td>Losses arising from acts inconsistent with employment, health or safety laws or agreements, from payments of personal injury claims, or from diversity/discrimination events.</td></tr>
          <tr><td><strong>Clients, products and business practices</strong></td><td>Losses arising from an unintentional or negligent failure to meet a professional obligation to specific clients (including fiduciary and suitability requirements), or from the nature or design of a product.</td></tr>
          <tr><td><strong>Damage to physical assets</strong></td><td>Losses arising from loss or damage to physical assets from natural disaster or other events.</td></tr>
          <tr><td><strong>Business disruption and system failures</strong></td><td>Losses arising from disruption of business or system failures.</td></tr>
          <tr><td><strong>Execution, delivery and process management</strong></td><td>Losses from failed transaction processing or process management, from relations with trade counterparties and vendors.</td></tr>
        </tbody>
      </table>
    </>
  );
}

function renderRefLikelihoodImpact() {
  return (
    <>
      <h3>Likelihood</h3>
      <table className="ref-table">
        <thead><tr><th>Level</th><th>Descriptor</th><th>Probability</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>4</td><td><strong>Frequent</strong></td><td>&gt;50%</td><td>More likely than not of happening within a year; historical evidence indicates that such event occurs once or more per year</td></tr>
          <tr><td>3</td><td><strong>Probable</strong></td><td>10-50%</td><td>The event is likely to occur at some point. It has happened before in the industry or organization and is expected to happen in the next 2-5 years</td></tr>
          <tr><td>2</td><td><strong>Possible</strong></td><td>2.5-10%</td><td>A small possibility exists for such an event to occur, less than 10% chance of occurrence within a year</td></tr>
          <tr><td>1</td><td><strong>Rare</strong></td><td>&lt;2.5%</td><td>Very unlikely, may occur in exceptional circumstances</td></tr>
        </tbody>
      </table>

      <h3>Impact</h3>
      <table className="ref-table">
        <thead><tr><th>Level</th><th>Descriptor</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>4</td><td><strong>Critical</strong></td><td>Impact that could threaten the firm's survival. Exceptionally high impact that should never happen, large enough to trigger a crisis management process.</td></tr>
          <tr><td>3</td><td><strong>Major</strong></td><td>Doesn't threaten firm's survival, but large enough to trigger immediate top-level attention and involvement, and with long-term consequences in terms of remediation plans.</td></tr>
          <tr><td>2</td><td><strong>Moderate</strong></td><td>Significant impact within the firm, but mostly circumvented to internal effect and limited external impact. Limited or no reputation damage toward the direct stakeholders and regulators.</td></tr>
          <tr><td>1</td><td><strong>Minor</strong></td><td>Big enough to qualify as an incident, but generally accepted as the cost of doing business. To be treated, but without putting current risk management practice into question.</td></tr>
        </tbody>
      </table>

      <h3>Inherent Risk Matrix (Likelihood × Impact)</h3>
      <div className="heatmap-wrap">
        <div className="heatmap-y-label">LIKELIHOOD →</div>
        <div>
          <table className="heatmap">
            <thead>
              <tr><th></th><th>1 - Minor</th><th>2 - Moderate</th><th>3 - Major</th><th>4 - Critical</th></tr>
            </thead>
            <tbody>
              <tr><th>4 - Frequent</th><td className="hm-mod">4</td><td className="hm-maj">8</td><td className="hm-crit">12</td><td className="hm-crit">16</td></tr>
              <tr><th>3 - Probable</th><td className="hm-low">3</td><td className="hm-mod">6</td><td className="hm-maj">9</td><td className="hm-crit">12</td></tr>
              <tr><th>2 - Possible</th><td className="hm-low">2</td><td className="hm-mod">4</td><td className="hm-mod">6</td><td className="hm-maj">8</td></tr>
              <tr><th>1 - Rare</th><td className="hm-low">1</td><td className="hm-low">2</td><td className="hm-low">3</td><td className="hm-mod">4</td></tr>
            </tbody>
          </table>
          <div className="heatmap-label">IMPACT →</div>
        </div>
      </div>
    </>
  );
}

function renderRefControls() {
  return (
    <>
      <h3>Controls Rating (Design)</h3>
      <table className="ref-table">
        <thead><tr><th>Rating</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><strong>Strong</strong></td><td>The processes completely mitigate risks including rare edge cases.</td></tr>
          <tr><td><strong>Satisfactory</strong></td><td>The processes mostly mitigate risks with some exceptions.</td></tr>
          <tr><td><strong>Needs Improvement</strong></td><td>The processes have gaps in design and only partially mitigate risks.</td></tr>
          <tr><td><strong>Unsatisfactory</strong></td><td>The processes cannot mitigate risks and are seriously flawed in design or operation.</td></tr>
        </tbody>
      </table>

      <h3>Controls Rating (Implementation)</h3>
      <table className="ref-table">
        <thead><tr><th>Level</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><strong>Fully Implemented</strong></td><td>Guidelines, policies and procedures are effectively and adequately implemented and/or applied in all relevant sectors of activity.</td></tr>
          <tr><td><strong>Mostly Implemented</strong></td><td>Guidelines, policies and procedures are mostly and adequately implemented and/or applied in all relevant sectors of activity. The deficiencies in implementation and/or application may <em>slightly</em> increase the vulnerability to risk.</td></tr>
          <tr><td><strong>Partially Implemented</strong></td><td>Guidelines, policies and procedures are not effectively and adequately implemented and/or applied in all relevant sectors of activity. The deficiencies in implementation and/or application may <em>materially increase</em> the vulnerability to risk.</td></tr>
          <tr><td><strong>Not Implemented</strong></td><td>Guidelines, policies and procedures are not effectively and adequately implemented and/or applied in all relevant sectors of activity. The deficiencies in implementation and/or application are <em>significant</em> and <em>materially increase</em> the vulnerability to risk.</td></tr>
        </tbody>
      </table>

      <h3>Types of Controls</h3>
      <table className="ref-table">
        <thead><tr><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><strong>Preventive</strong></td><td>Reduces the likelihood of a risk event happening (dual authorization, segregation of duties)</td></tr>
          <tr><td><strong>Detective</strong></td><td>Identifies the occurrence of a risk event to minimize the impact (CCTV, smoke detector)</td></tr>
          <tr><td><strong>Corrective</strong></td><td>Mitigates the aftermath of a risk event (data backup, crisis management plans)</td></tr>
          <tr><td><strong>None</strong></td><td>No controls in place</td></tr>
        </tbody>
      </table>

      <h3>Residual Risk Matrix (Controls Rating × Inherent Risk Level)</h3>
      <div className="heatmap-wrap">
        <div className="heatmap-y-label">CONTROLS RATING →</div>
        <div>
          <table className="heatmap">
            <thead>
              <tr><th></th><th>Minor</th><th>Moderate</th><th>Major</th><th>Critical</th></tr>
            </thead>
            <tbody>
              <tr><th>Unsatisfactory</th><td className="hm-mod">4</td><td className="hm-maj">8</td><td className="hm-crit">12</td><td className="hm-crit">16</td></tr>
              <tr><th>Needs Improvement</th><td className="hm-low">3</td><td className="hm-mod">6</td><td className="hm-maj">9</td><td className="hm-crit">12</td></tr>
              <tr><th>Satisfactory</th><td className="hm-low">2</td><td className="hm-mod">4</td><td className="hm-mod">6</td><td className="hm-maj">8</td></tr>
              <tr><th>Strong</th><td className="hm-low">1</td><td className="hm-low">2</td><td className="hm-low">3</td><td className="hm-mod">4</td></tr>
            </tbody>
          </table>
          <div className="heatmap-label">INHERENT RISK LEVEL →</div>
        </div>
      </div>
    </>
  );
}

function renderRefTreatment() {
  return (
    <>
      <h3>Risk Treatment Options</h3>
      <table className="ref-table">
        <thead><tr><th>Option</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><strong>Accept</strong></td><td>Retaining the risk by informed decision. Taking or increasing the risk in order to pursue an opportunity.</td></tr>
          <tr><td><strong>Reduce</strong></td><td>Changing the likelihood and/or the impact.</td></tr>
          <tr><td><strong>Avoid</strong></td><td>Avoiding the risk by deciding not to start or continue with the activity that gives rise to the risk. Removing the risk source.</td></tr>
          <tr><td><strong>Transfer</strong></td><td>Sharing the risk with another party or parties (including contracts and risk financing).</td></tr>
        </tbody>
      </table>
    </>
  );
}

export default function ReferenceGuide({ onClose }: ReferenceGuideProps) {
  const [tab, setTab] = useState(0);

  return (
    <div className="ref-overlay" id="ref-overlay" onClick={(e) => { if ((e.target as any).id === 'ref-overlay') onClose(); }}>
      <div className="ref-content">
        <div className="ref-header">
          <h2>Reference Guide</h2>
          <button className="ref-close" onClick={onClose} dangerouslySetInnerHTML={{__html: ICONS.x + ' Close'}}></button>
        </div>
        <div className="ref-tabs">
          {REF_TABS.map((name, i) => (
            <button key={i} className={`ref-tab ${i === tab ? "active" : ""}`} onClick={() => setTab(i)}>
              {name}
            </button>
          ))}
        </div>

        <div className={`ref-tab-content ${tab === 0 ? "active" : ""}`}>
          {renderRefCategories()}
        </div>

        <div className={`ref-tab-content ${tab === 1 ? "active" : ""}`}>
          {renderRefLikelihoodImpact()}
        </div>

        <div className={`ref-tab-content ${tab === 2 ? "active" : ""}`}>
          {renderRefControls()}
        </div>

        <div className={`ref-tab-content ${tab === 3 ? "active" : ""}`}>
          {renderRefTreatment()}
        </div>
      </div>
    </div>
  );
}
