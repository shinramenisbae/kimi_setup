#!/bin/bash
# Complete Task Script - Handles different Multimango task types
# Usage: ./complete-task.sh <agent_id> <task_id> <task_type> <task_title>

set -e

AGENT_ID=$1
TASK_ID=$2
TASK_TYPE=$3
TASK_TITLE=$4

if [ -z "$AGENT_ID" ] || [ -z "$TASK_ID" ] || [ -z "$TASK_TYPE" ]; then
    echo "Usage: $0 <agent_id> <task_id> <task_type> [task_title]"
    exit 1
fi

echo "⚡ Completing task: $TASK_TITLE ($TASK_TYPE)"
echo "   Agent: $AGENT_ID"
echo "   Task ID: $TASK_ID"

# Task completion based on type
case "$TASK_TYPE" in
    "perception")
        echo "📝 Completing perception caption task..."
        bash "$(dirname "$0")/tasks/perception-task.sh" "$AGENT_ID" "$TASK_ID"
        ;;
    "video")
        echo "🎥 Completing video task..."
        bash "$(dirname "$0")/tasks/video-task.sh" "$AGENT_ID" "$TASK_ID"
        ;;
    "instagram")
        echo "📸 Completing Instagram task..."
        bash "$(dirname "$0")/tasks/instagram-task.sh" "$AGENT_ID" "$TASK_ID"
        ;;
    "tts")
        echo "🗣️  Completing TTS task..."
        bash "$(dirname "$0")/tasks/tts-task.sh" "$AGENT_ID" "$TASK_ID"
        ;;
    *)
        echo "⚠️  Unknown task type: $TASK_TYPE, using generic completion"
        bash "$(dirname "$0")/tasks/generic-task.sh" "$AGENT_ID" "$TASK_ID"
        ;;
esac

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Task $TASK_ID completed successfully"
else
    echo "❌ Task $TASK_ID failed with code $EXIT_CODE"
fi

exit $EXIT_CODE
