#!/bin/bash
# Utility scripts for manually triggering n8n webhooks

# Usage: ./webhook-trigger.sh <action> [args]
# Make sure to replace YOUR_N8N_URL with your actual n8n instance URL

N8N_URL="${N8N_URL:-http://localhost:5678}"

case "$1" in
  onboard)
    echo "Triggering client onboarding..."
    curl -X POST "$N8N_URL/webhook/onboard-client" \
      -H "Content-Type: application/json" \
      -d '{
        "company_name": "Test Company Inc",
        "primary_contact": "Jane Doe",
        "contact_email": "jane@testcompany.com",
        "contact_title": "VP Revenue Operations",
        "arr": "25000000",
        "sales_team_size": "15",
        "crm": "Salesforce",
        "scope_tier": "implementation",
        "duration": "6 months",
        "start_date": "2025-02-01",
        "challenges": "Inconsistent forecasting, CRM data quality issues, no defined sales process",
        "agreed_scope": "CRM optimization, forecast model build, sales process documentation"
      }'
    ;;

  proposal)
    echo "Triggering proposal generation..."
    curl -X POST "$N8N_URL/webhook/generate-proposal" \
      -H "Content-Type: application/json" \
      -d '{
        "company_name": "Prospect Corp",
        "industry": "B2B SaaS - MarTech",
        "arr": "35000000",
        "employee_count": "200",
        "sales_team_size": "25",
        "crm": "HubSpot",
        "website": "https://prospectcorp.com",
        "challenges": "Pipeline coverage declining, forecast accuracy below 60%, reps not following process",
        "current_state": "Using HubSpot but poorly configured, no defined stages, manual forecasting in spreadsheets",
        "desired_outcomes": "80%+ forecast accuracy, 4x pipeline coverage, standardized sales process",
        "timeline": "Want to see results within one quarter",
        "budget_signals": "VP mentioned they had budget for a consultant, looking at $15-20k/month",
        "stakeholders": "VP Sales (sponsor), CRO (decision maker), RevOps Manager (day-to-day)",
        "source": "LinkedIn DM after seeing pipeline coverage post",
        "scope_tier": "implementation",
        "duration": "6 months",
        "investment": "18000",
        "billing_frequency": "month"
      }'
    ;;

  lead)
    echo "Triggering inbound lead capture..."
    curl -X POST "$N8N_URL/webhook/inbound-lead" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Alex Johnson",
        "email": "alex@growthsaas.com",
        "company": "GrowthSaaS",
        "title": "Director of Revenue Operations",
        "message": "Hi, I found you through your LinkedIn post about pipeline coverage. We are a Series B SaaS company at about $20M ARR and struggling with forecast accuracy. Would love to chat about how you might help."
      }'
    ;;

  *)
    echo "Usage: ./webhook-trigger.sh <action>"
    echo ""
    echo "Actions:"
    echo "  onboard   - Trigger client onboarding workflow"
    echo "  proposal  - Trigger proposal generation workflow"
    echo "  lead      - Trigger inbound lead capture workflow"
    echo ""
    echo "Set N8N_URL environment variable (default: http://localhost:5678)"
    ;;
esac
