# TOOLS.md - Local Notes & Procedures

## Gmail (via gog CLI)

**Account:** astephenfang@gmail.com

### Common Commands
```bash
# Search recent emails
gog gmail search "newer_than:1d" --account astephenfang@gmail.com --json

# Search with pagination
gog gmail search "newer_than:1d" --account astephenfang@gmail.com --json --page <TOKEN>

# Get full message
gog gmail get <messageId> --account astephenfang@gmail.com --json

# Mark thread as read
gog gmail thread modify <threadId> --remove UNREAD --account astephenfang@gmail.com

# Mark thread as unread
gog gmail thread modify <threadId> --add UNREAD --account astephenfang@gmail.com

# Batch mark as read (loop)
for id in <id1> <id2>; do gog gmail thread modify "$id" --remove UNREAD --account astephenfang@gmail.com; done
```

### Email Summary Template
When summarizing emails, categorize into:
1. **⚠️ Needs Attention** — failed payments, security alerts, work-related, time-sensitive
2. **📊 Updates** — work summaries, account notifications, LinkedIn messages
3. **🛒 Promos** — marketing emails, sales, newsletters (brief, skippable)

Always flag: failed payments, security/password changes, Outlier/work announcements, LinkedIn messages.

## Flight Search

**Method:** web_fetch on Google Flights URL
```
https://www.google.com/travel/flights?q=flights%20from%20AKL%20to%20MEL%20on%20YYYY-MM-DD%20return%20YYYY-MM-DD&curr=NZD
```

## Hubstaff (VPS)

**Install location:** ~/.local/share/hubstaff/
**Binaries:** HubstaffCLI, HubstaffClient, HubstaffHelper
**CLI symlink:** /usr/local/bin/HubstaffCLI

### CLI Commands
```bash
HubstaffCLI status                    # Check tracker status
HubstaffCLI organizations             # List orgs
HubstaffCLI projects [org_id]         # List projects
HubstaffCLI start_project <id>        # Start tracking
HubstaffCLI stop                      # Stop tracking
```
**Note:** CLI requires HubstaffClient running on a display. Client needs initial login via GUI.

## Virtual Display (Xvfb)

```bash
# Start
Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset &
export DISPLAY=:99

# Start window manager
fluxbox &

# Take screenshot
scrot /tmp/screenshot.png
# or
import -window root /tmp/screenshot.png
```

## Mouse Sim Script
**Location:** /root/.openclaw/workspace/mouse_sim.py
**Venv:** /opt/mouse-sim-env
**Run:** `/opt/mouse-sim-env/bin/python /root/.openclaw/workspace/mouse_sim.py`
**Deps:** pyautogui, pynput, python-xlib

## Routing: When to Use What

| Task | Tool | Notes |
|------|------|-------|
| Email summary | gog gmail search + json | Categorize by priority |
| Mark emails read | gog gmail thread modify | Loop over thread IDs |
| Unsubscribe from email | Find unsub link in email body, open via browser or web_fetch | React SPAs need real browser |
| Flight prices | web_fetch on Google Flights URL | Parse text output for prices |
| Reminders/alerts | cron tool | Use isolated agentTurn for recurring checks |
| File on VPS | exec tool | Direct shell access |
| Web research | web_fetch (no web_search — no Brave key) | Fetch specific URLs only |
