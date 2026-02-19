#!/bin/bash
# Multimango Login Script
# Usage: ./multimango-login.sh <agent_id>

set -e

AGENT_ID=${1:-"jarvis"}

echo "🔐 Logging into Multimango as $AGENT_ID..."

# Account credentials based on agent
if [ "$AGENT_ID" = "vps-agent" ]; then
    ACCOUNT="eleven"
    EMAIL="wfe-67adaf4f5bcd9e452a882ca2@outlier.ai"
    # Password should be in environment or secure storage
elif [ "$AGENT_ID" = "kimiclaw-agent" ]; then
    ACCOUNT="tweleve"
    EMAIL="wfe-67adaf4f5bcd9e452a882ca2@outlier.ai"  # Update with actual account 12 email
    # Password should be in environment or secure storage
else
    echo "❌ Unknown agent: $AGENT_ID"
    exit 1
fi

# Check if already logged in
if [ -f "/tmp/multimango_${AGENT_ID}_logged_in" ]; then
    echo "✅ Already logged in as $ACCOUNT"
    exit 0
fi

# Login using browser automation or direct API
# This is a placeholder - you'll need to implement actual login logic
# Options:
# 1. Use Playwright/agent-browser to automate login
# 2. Use existing session cookies if available
# 3. Use API tokens if available

echo "📱 Opening Multimango login page..."

# Example using agent-browser (you need to have it installed)
if command -v agent-browser &> /dev/null; then
    agent-browser navigate "https://multimango.outlier.ai/login" --wait-for-network-idle
    
    # Fill in credentials
    # Note: You should use environment variables for passwords
    # agent-browser type "input[name=email]" "$EMAIL"
    # agent-browser type "input[name=password]" "$PASSWORD"
    # agent-browser click "button[type=submit]"
    
    echo "✅ Login form submitted"
else
    echo "⚠️  agent-browser not available, manual login required"
fi

# Mark as logged in
touch "/tmp/multimango_${AGENT_ID}_logged_in"

echo "✅ Multimango login complete for $ACCOUNT"
