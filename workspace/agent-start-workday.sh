#!/bin/bash
# Agent Start Workday Script
# Usage: ./agent-start-workday.sh <agent_id>
# Example: ./agent-start-workday.sh jarvis

set -e

AGENT_ID=${1:-"vps-agent"}
MISSION_CONTROL="http://76.13.182.206/api"
HUBSTAFF_DIR="$HOME/.local/share/hubstaff"

echo "🚀 Starting workday for agent: $AGENT_ID"

# 1. Register heartbeat - starting
cecho "📡 Registering with Mission Control..."
curl -s -X POST "$MISSION_CONTROL/agents" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\":\"$AGENT_ID\",\"status\":\"starting\",\"hubstaff_status\":\"starting\",\"multimango_status\":\"logging_in\"}" > /dev/null

# 2. Start Hubstaff tracking
echo "▶️  Starting Hubstaff..."
if [ -f "$HUBSTAFF_DIR/start.sh" ]; then
    bash "$HUBSTAFF_DIR/start.sh" &
else
    # Fallback - try to find and start Hubstaff
    if command -v hubstaff &> /dev/null; then
        hubstaff &
    else
        echo "⚠️  Hubstaff not found, skipping..."
    fi
fi

# 3. Notify Mission Control - Hubstaff started
curl -s -X POST "$MISSION_CONTROL/hubstaff" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\":\"$AGENT_ID\",\"action\":\"start\"}" > /dev/null

echo "✅ Hubstaff tracking started"

# 4. Login to Multimango
echo "🔐 Logging into Multimango..."
# This will be handled by the multimango-login script
bash "$(dirname "$0")/multimango-login.sh" "$AGENT_ID"

# 5. Update status - ready for work
curl -s -X POST "$MISSION_CONTROL/agents" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\":\"$AGENT_ID\",\"status\":\"working\",\"hubstaff_status\":\"tracking\",\"multimango_status\":\"logged_in\"}" > /dev/null

echo "✅ Agent $AGENT_ID is ready for work!"
echo ""
echo "Starting work loop..."
bash "$(dirname "$0")/agent-work-loop.sh" "$AGENT_ID"
