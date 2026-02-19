#!/bin/bash
# Agent Work Loop - Continuously picks up and completes tasks
# Usage: ./agent-work-loop.sh <agent_id>

set -e

AGENT_ID=${1:-"vps-agent"}
MISSION_CONTROL="http://76.13.182.206/api"
WORKDAY_END_HOUR=17  # 5 PM

echo "🔄 Work loop started for $AGENT_ID"
echo "   Will check for tasks every 20 minutes"
echo "   Workday ends at ${WORKDAY_END_HOUR}:00"

while true; do
    CURRENT_HOUR=$(date +%H)
    
    # Check if workday should end
    if [ "$CURRENT_HOUR" -ge "$WORKDAY_END_HOUR" ]; then
        echo "🕐 Workday ending (hour: $CURRENT_HOUR)"
        bash "$(dirname "$0")/agent-stop-workday.sh" "$AGENT_ID"
        exit 0
    fi
    
    # Heartbeat
    curl -s -X POST "$MISSION_CONTROL/agents" \
        -H "Content-Type: application/json" \
        -d "{\"agent_id\":\"$AGENT_ID\",\"status\":\"working\"}" > /dev/null
    
    # Get next task
    echo "📋 Checking for tasks..."
    TASK=$(curl -s "$MISSION_CONTROL/workforce-tasks?next=true&agent_id=$AGENT_ID")
    
    if [ "$TASK" != "null" ] && [ -n "$TASK" ]; then
        TASK_ID=$(echo "$TASK" | jq -r '.id')
        TASK_TYPE=$(echo "$TASK" | jq -r '.type')
        TASK_TITLE=$(echo "$TASK" | jq -r '.title')
        
        echo "🎯 Found task: $TASK_TITLE ($TASK_TYPE)"
        
        # Mark task as in_progress
        curl -s -X PUT "$MISSION_CONTROL/workforce-tasks" \
            -H "Content-Type: application/json" \
            -d "{\"id\":\"$TASK_ID\",\"agent_id\":\"$AGENT_ID\",\"status\":\"in_progress\",\"started_at\":\"$(date -Iseconds)\"}" > /dev/null
        
        # Complete the task
        echo "⚡ Completing task..."
        if bash "$(dirname "$0")/complete-task.sh" "$AGENT_ID" "$TASK_ID" "$TASK_TYPE" "$TASK_TITLE"; then
            echo "✅ Task completed successfully"
            
            # Mark task complete
            curl -s -X PUT "$MISSION_CONTROL/workforce-tasks" \
                -H "Content-Type: application/json" \
                -d "{\"id\":\"$TASK_ID\",\"status\":\"completed\",\"completed_at\":\"$(date -Iseconds)\"}" > /dev/null
            
            # Notify Hubstaff of task completion
            curl -s -X POST "$MISSION_CONTROL/hubstaff" \
                -H "Content-Type: application/json" \
                -d "{\"agent_id\":\"$AGENT_ID\",\"action\":\"task_complete\"}" > /dev/null
        else
            echo "❌ Task failed"
            
            # Mark task failed
            curl -s -X PUT "$MISSION_CONTROL/workforce-tasks" \
                -H "Content-Type: application/json" \
                -d "{\"id\":\"$TASK_ID\",\"status\":\"failed\",\"error_message\":\"Task execution failed\"}" > /dev/null
        fi
        
        # Wait 5 minutes between tasks
        echo "⏳ Waiting 5 minutes before next task..."
        sleep 300
    else
        echo "😴 No tasks available, waiting 20 minutes..."
        sleep 1200
    fi
done
