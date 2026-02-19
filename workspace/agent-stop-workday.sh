#!/bin/bash
# Agent Stop Workday Script
# Usage: ./agent-stop-workday.sh <agent_id>

set -e

AGENT_ID=${1:-"vps-agent"}
MISSION_CONTROL="http://76.13.182.206/api"

echo "🛑 Stopping workday for agent: $AGENT_ID"

# 1. Stop Hubstaff tracking
echo "⏹️  Stopping Hubstaff..."
curl -s -X POST "$MISSION_CONTROL/hubstaff" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\":\"$AGENT_ID\",\"action\":\"stop\"}" > /dev/null

# Kill Hubstaff process if running
pkill -f hubstaff || true

# 2. Logout from Multimango (optional)
echo "🔓 Logging out from Multimango..."
# Kill browser sessions, clear cookies, etc.
pkill -f "multimango" || true

# 3. Update agent status
curl -s -X POST "$MISSION_CONTROL/agents" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\":\"$AGENT_ID\",\"status\":\"offline\",\"hubstaff_status\":\"stopped\",\"multimango_status\":\"logged_out\",\"current_task_id\":null}" > /dev/null

# 4. Log activity
curl -s -X POST "$MISSION_CONTROL/activity" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\":\"$AGENT_ID\",\"type\":\"workday\",\"message\":\"Workday ended\"}" > /dev/null

echo "✅ Workday ended for $AGENT_ID"
echo "📊 Check Mission Control for today's summary"
