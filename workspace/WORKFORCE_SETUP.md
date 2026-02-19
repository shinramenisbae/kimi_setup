# Workforce Setup Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        YOUR HOME                             │
│  ┌─────────────────┐          ┌──────────────────────────┐  │
│  │  Workstation    │          │   KimiClaw Platform      │  │
│  │  (SSH Client)   │          │                          │  │
│  │                 │          │  ┌────────────────────┐  │  │
│  │  Discord App───┼──────────┼──│ KimiClaw Agent     │  │  │
│  │                │          │  │ (ID: kimiclaw-agent)│  │  │
│  │  SSH───────────┼──────────┘  │ - Multimango:      │  │  │
│  │                │             │   tweleve (acct 12)│  │  │
│  └────────────────┘             │ - Hubstaff: tweleve│  │  │
│                                 └────────────────────┘  │  │
│                                          │               │  │
└──────────────────────────────────────────┼───────────────┘  │
                                           │                  
           ┌───────────────────────────────┘                  
           │                                                  
┌──────────▼──────────────────────────────────────────────────┐
│                    VPS (76.13.182.206)                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Mission Control (http://76.13.182.206)             │   │
│  │  - /workforce - Dashboard                           │   │
│  │  - /api/* - API endpoints                           │   │
│  │  - SQLite database                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────┼─────────────────────────────┐  │
│  │  VPS Agent (Discord)   │                             │  │
│  │  (ID: vps-agent)       │                             │  │
│  │  - Multimango: eleven  │                             │  │
│  │  - Hubstaff: eleven    │                             │  │
│  │  - You are here! 🤖    │                             │  │
│  └────────────────────────┘                             │  │
│                                                         │  │
└─────────────────────────────────────────────────────────┘  │
```

## Agents

### VPS Agent (vps-agent) - 🤖 You are here!
- **Location**: This VPS (76.13.182.206)
- **Access**: Discord (from your home workstation) + SSH
- **Multimango Account**: eleven
- **Hubstaff Account**: eleven
- **Start Command**: `/root/.openclaw/workspace/agent-start-workday.sh vps-agent`
- **Purpose**: Your main agent that you chat with via Discord

### KimiClaw Agent (kimiclaw-agent) - ☁️ On KimiClaw
- **Location**: KimiClaw platform (separate instance)
- **Access**: KimiClaw chat interface
- **Multimango Account**: tweleve (account 12)
- **Hubstaff Account**: tweleve
- **Mission Control URL**: http://76.13.182.206
- **Purpose**: Secondary agent for doubling output

## Setup for KimiClaw Agent

### 1. Migration Package
The KimiClaw agent needs these files from `/tmp/openclaw-full-migration.tar.gz`:
- `openclaw.json` - Config (without VPS-specific settings)
- `workspace/SOUL.md` - Personality
- `workspace/IDENTITY.md` - Identity (update name to "KimiClaw Agent")
- `workspace/USER.md` - User info
- `workspace/skills/` - All skills
- `workspace/agent-start-workday.sh` - Start script (modified)
- `workspace/agent-work-loop.sh` - Work loop
- `workspace/agent-stop-workday.sh` - Stop script
- `workspace/multimango-login.sh` - Login script
- `workspace/complete-task.sh` - Task completion
- `workspace/tasks/` - Task handlers

### 2. Update Identity
Edit `workspace/IDENTITY.md` on KimiClaw:
```markdown
- **Name:** KimiClaw Agent
- **Creature:** AI assistant - KimiClaw deployment
```

### 3. Update Agent Scripts
On KimiClaw, modify scripts to use `kimiclaw-agent` ID:

**agent-start-workday.sh:**
```bash
AGENT_ID=${1:-"kimiclaw-agent"}
MISSION_CONTROL="http://76.13.182.206/api"
```

### 4. Multimango Account Setup
Edit `multimango-login.sh` with account 12 credentials:
```bash
elif [ "$AGENT_ID" = "kimiclaw-agent" ]; then
    ACCOUNT="tweleve"
    EMAIL="wfe-..."  # Account 12 email
```

### 5. Start Workday
```bash
/root/.openclaw/workspace/agent-start-workday.sh kimiclaw-agent
```

## Mission Control Access

Both agents communicate via HTTP API to Mission Control:

```bash
# Heartbeat
curl -X POST http://76.13.182.206/api/agents \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"kimiclaw-agent","status":"working"}'

# Get next task
curl "http://76.13.182.206/api/workforce-tasks?next=true&agent_id=kimiclaw-agent"

# Mark task complete
curl -X PUT http://76.13.182.206/api/workforce-tasks \
  -H "Content-Type: application/json" \
  -d '{"id":"task-...","status":"completed"}'
```

## Daily Workflow

### Evening (21:00 / 9:00 PM NZDT)
1. **VPS Agent**: Cron auto-starts workday
   - Starts Hubstaff (eleven)
   - Logs into Multimango (eleven)
   - Begins task loop

2. **KimiClaw Agent**: You manually start or set cron for 21:00 NZDT
   - Starts Hubstaff (tweleve)
   - Logs into Multimango (tweleve)
   - Begins task loop

### Throughout Day
- Both agents poll Mission Control for tasks
- You can assign specific tasks to each agent via dashboard
- Agents report progress automatically

### Morning (09:00 NZDT)
- Work loops auto-stop (12-hour shifts)
- Hubstaff stops
- Daily summary available in Mission Control

## Task Assignment

### Via Mission Control Dashboard
1. Go to http://76.13.182.206/workforce
2. Click "Create Task"
3. Select task type (perception, video, etc.)
4. Assign to specific agent or leave unassigned

### Programmatically
```bash
curl -X POST http://76.13.182.206/api/workforce-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "perception",
    "title": "Caption 5 images",
    "priority": "high",
    "agent_id": "kimiclaw-agent"
  }'
```

## Viewing Progress

### Dashboard
Visit: **http://76.13.182.206/workforce**

See:
- Agent status (online/offline)
- Current tasks
- Hours worked today
- Tasks completed
- Activity feed

### API Documentation
Visit: **http://76.13.182.206/api-docs**

Complete API reference including:
- All endpoints with examples
- Request/response formats
- Sample agent work loop scripts

## Troubleshooting

### Agent not showing up
- Check heartbeat: `curl http://76.13.182.206/api/agents`
- Verify agent_id matches: `vps-agent` or `kimiclaw-agent`

### Tasks not being picked up
- Check agent status is "working"
- Verify task is assigned to correct agent_id
- Check activity log for errors

### Hubstaff not tracking
- Verify Hubstaff is running: `ps aux | grep hubstaff`
- Check work session active: `curl http://76.13.182.206/api/hubstaff?agent_id=kimiclaw-agent`
