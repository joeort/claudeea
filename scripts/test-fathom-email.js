/**
 * Test Script: Simulate a Fathom email for testing the call-intelligence workflow
 *
 * Usage: Run this in an n8n Code node or locally with Node.js to generate
 * a test email payload that matches Fathom's format.
 *
 * To test: Send this as the payload to the call-intelligence workflow's
 * first node (bypass the Gmail trigger and inject this data directly).
 */

const testFathomEmail = {
  id: "test-email-001",
  threadId: "thread-001",
  subject: "Meeting notes: Q1 Pipeline Review — Acme Corp",
  from: "notifications@fathom.video",
  to: "you@yourdomain.com",
  date: new Date().toISOString(),
  text: `Meeting Summary

Meeting: Q1 Pipeline Review
Date: ${new Date().toLocaleDateString()}
Duration: 45 minutes
Attendees: You (you@yourdomain.com), Jane Smith (jane@acmecorp.com), Mike Chen (mike@acmecorp.com)

Summary:
Reviewed Q1 pipeline health. Overall coverage is at 2.8x against $2M target — below the 3.5x benchmark. Three enterprise deals in Stage 3 have been stalled for 3+ weeks. Jane raised concerns about the new SDR team's qualification criteria — they're passing leads that don't match ICP. Discussed implementing a lead scoring model. Mike wants to see conversion rates by source channel before next meeting. Agreed to prioritize CRM cleanup sprint next week.

Action Items:
- Pull conversion rates by source channel (you)
- Schedule CRM cleanup sprint for next week (you)
- Share SDR qualification criteria doc (Jane)
- Set up meeting with SDR team lead (Jane)

Key Decisions:
- Will implement lead scoring model in HubSpot (start after CRM cleanup)
- Pushing enterprise deal reviews to weekly cadence (was biweekly)

Notes:
Jane mentioned the CFO is asking about ROI on the SDR investment. This could be an expansion opportunity — offer to build an SDR ROI dashboard. Mike seemed disengaged during the second half — might be bandwidth issues on his team.`,
  snippet: "Meeting notes: Q1 Pipeline Review — Acme Corp"
};

// To use in n8n: return [{ json: testFathomEmail }];
// To use in Node.js:
console.log(JSON.stringify(testFathomEmail, null, 2));

module.exports = testFathomEmail;
