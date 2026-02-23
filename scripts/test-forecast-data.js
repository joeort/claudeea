/**
 * Test Script: Sample forecast data for testing the forecast-review workflow
 *
 * Import this data into a test Google Sheet with tabs:
 * - "Pipeline" (current pipeline)
 * - "Last Week Snapshot" (previous week's data for comparison)
 */

const pipelineData = [
  { "Deal Name": "Acme Widget Expansion", "Account": "Acme Widgets", "Stage": "Negotiation", "Value": 85000, "Days in Stage": 12, "Last Activity": "2025-01-20", "Rep": "Sarah K", "Close Date": "2025-02-15", "Notes": "Contract review in progress" },
  { "Deal Name": "Beta Corp New Business", "Account": "Beta Corp", "Stage": "Proposal", "Value": 120000, "Days in Stage": 8, "Last Activity": "2025-01-22", "Rep": "Tom R", "Close Date": "2025-03-01", "Notes": "Waiting on budget approval" },
  { "Deal Name": "Gamma Inc Renewal", "Account": "Gamma Inc", "Stage": "Negotiation", "Value": 65000, "Days in Stage": 25, "Last Activity": "2025-01-10", "Rep": "Sarah K", "Close Date": "2025-02-28", "Notes": "Stalled - champion on PTO" },
  { "Deal Name": "Delta SaaS Platform", "Account": "Delta SaaS", "Stage": "Discovery", "Value": 200000, "Days in Stage": 5, "Last Activity": "2025-01-23", "Rep": "Tom R", "Close Date": "2025-04-15", "Notes": "Strong initial fit" },
  { "Deal Name": "Epsilon Tech Upgrade", "Account": "Epsilon Tech", "Stage": "Qualification", "Value": 45000, "Days in Stage": 18, "Last Activity": "2025-01-15", "Rep": "Lisa M", "Close Date": "2025-03-15", "Notes": "Low engagement from buyer" },
  { "Deal Name": "Zeta Cloud Migration", "Account": "Zeta Cloud", "Stage": "Proposal", "Value": 175000, "Days in Stage": 3, "Last Activity": "2025-01-24", "Rep": "Sarah K", "Close Date": "2025-03-10", "Notes": "Multiple stakeholders involved" },
  { "Deal Name": "Eta Analytics New", "Account": "Eta Analytics", "Stage": "Discovery", "Value": 90000, "Days in Stage": 10, "Last Activity": "2025-01-18", "Rep": "Lisa M", "Close Date": "2025-04-01", "Notes": "Referred by existing client" },
  { "Deal Name": "Theta Corp Expansion", "Account": "Theta Corp", "Stage": "Closed Won", "Value": 55000, "Days in Stage": 0, "Last Activity": "2025-01-22", "Rep": "Tom R", "Close Date": "2025-01-22", "Notes": "Closed this week!" },
  { "Deal Name": "Iota Labs Trial", "Account": "Iota Labs", "Stage": "Qualification", "Value": 30000, "Days in Stage": 22, "Last Activity": "2025-01-08", "Rep": "Lisa M", "Close Date": "2025-03-30", "Notes": "Gone cold" },
  { "Deal Name": "Kappa Solutions", "Account": "Kappa Solutions", "Stage": "Proposal", "Value": 150000, "Days in Stage": 14, "Last Activity": "2025-01-16", "Rep": "Sarah K", "Close Date": "2025-02-28", "Notes": "Competitor eval in progress" }
];

const lastWeekSnapshot = [
  { "Deal Name": "Acme Widget Expansion", "Stage": "Proposal", "Value": 85000, "Days in Stage": 5 },
  { "Deal Name": "Beta Corp New Business", "Stage": "Proposal", "Value": 120000, "Days in Stage": 1 },
  { "Deal Name": "Gamma Inc Renewal", "Stage": "Negotiation", "Value": 65000, "Days in Stage": 18 },
  { "Deal Name": "Delta SaaS Platform", "Stage": "Discovery", "Value": 200000, "Days in Stage": 0 },
  { "Deal Name": "Epsilon Tech Upgrade", "Stage": "Qualification", "Value": 45000, "Days in Stage": 11 },
  { "Deal Name": "Zeta Cloud Migration", "Stage": "Discovery", "Value": 175000, "Days in Stage": 10 },
  { "Deal Name": "Eta Analytics New", "Stage": "Discovery", "Value": 90000, "Days in Stage": 3 },
  { "Deal Name": "Iota Labs Trial", "Stage": "Qualification", "Value": 30000, "Days in Stage": 15 },
  { "Deal Name": "Kappa Solutions", "Stage": "Proposal", "Value": 150000, "Days in Stage": 7 }
];

// Summary stats for quick reference
const summary = {
  quarterlyTarget: 800000,
  closedWonYTD: 55000,
  totalOpenPipeline: pipelineData.filter(d => d.Stage !== "Closed Won").reduce((sum, d) => sum + d.Value, 0),
  coverageRatio: null // calculated below
};
summary.coverageRatio = (summary.totalOpenPipeline / (summary.quarterlyTarget - summary.closedWonYTD)).toFixed(1);

console.log("=== Test Forecast Data ===");
console.log(`Quarterly Target: $${summary.quarterlyTarget.toLocaleString()}`);
console.log(`Closed Won YTD: $${summary.closedWonYTD.toLocaleString()}`);
console.log(`Open Pipeline: $${summary.totalOpenPipeline.toLocaleString()}`);
console.log(`Coverage Ratio: ${summary.coverageRatio}x`);
console.log(`\nPipeline tab: ${pipelineData.length} deals`);
console.log(`Last Week Snapshot: ${lastWeekSnapshot.length} deals`);

module.exports = { pipelineData, lastWeekSnapshot, summary };
