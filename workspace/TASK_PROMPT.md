# Task: Manage OpenClaw Instance — Hubstaff + Browser Automation

You are managing an OpenClaw AI assistant ("Jarvis") running on a headless Ubuntu 24.04 VPS. Your job is to operate the browser and Hubstaff time tracker to complete work tasks.

## VPS Details
- **OS:** Ubuntu 24.04, 8GB RAM, Python 3.12
- **IP:** 76.13.182.206 (Hostinger, geolocates to Malaysia)
- **User:** root
- **OpenClaw config:** `/root/.openclaw/openclaw.json`
- **Workspace:** `/root/.openclaw/workspace/`

## Browser Setup
Chrome 145 runs **non-headless** on a virtual display to avoid bot detection.

- **Xvfb** virtual display on `:99` (1920x1080x24) — managed by `systemctl --user start xvfb.service`
- **Google Chrome** at `/usr/bin/google-chrome-stable` — managed by `systemctl --user start openclaw-browser.service`
  - Runs on `DISPLAY=:99`, CDP port `18800`
  - User data dir: `/root/.openclaw/browser/openclaw/user-data`
  - Flags: `--no-sandbox --no-first-run --disable-gpu`
  - User-Agent: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36` (no "HeadlessChrome")
- **OpenClaw browser config:** `attachOnly: true`, `headless: false`, `noSandbox: true`
- If Chrome dies: `systemctl --user restart openclaw-browser.service`
- If Xvfb dies: `systemctl --user restart xvfb.service` (kill stale locks first: `rm -f /tmp/.X99-lock /tmp/.X11-unix/X99`)

### NordVPN (NZ IP)
NordVPN is installed and logged in. The browser must appear to be in New Zealand.

- **Connect:** `nordvpn connect New_Zealand`
- **Verify:** `curl -s ifconfig.me` should return a NZ IP (e.g. `217.217.117.77`)
- **Status:** `nordvpn status`
- **Allowlist** (so gateway/SSH don't break): Discord gateway subnets (`162.159.128.0/20`, `162.159.136.0/21`) and port 22 are already allowlisted
- **Important:** Always verify NordVPN is connected before doing browser work. If it disconnects, reconnect before proceeding.

## Hubstaff Time Tracking
Hubstaff tracks time + activity for work projects. The CLI is installed but the client needs initial authentication.

- **Binaries:** `/root/.local/share/hubstaff/` (HubstaffCLI, HubstaffClient, HubstaffHelper)
- **CLI symlink:** `/usr/local/bin/HubstaffCLI`
- **Commands:**
  - `HubstaffCLI status` — check tracker state
  - `HubstaffCLI organizations` — list orgs
  - `HubstaffCLI projects [org_id]` — list projects
  - `HubstaffCLI start_project <id>` — start tracking
  - `HubstaffCLI stop` — stop tracking
- **Target project:** Multimango (Outlier AI / Aether)
- **Blocker:** HubstaffClient needs to be running on `:99` and authenticated. It may show a dialog requiring login. Try: `DISPLAY=:99 /root/.local/share/hubstaff/HubstaffClient &` — if it prompts for login, credentials will be needed from the user.

### Mouse Simulation (Activity Metrics)
Hubstaff measures mouse/keyboard activity. A simulation script generates realistic input.

- **Script:** `/root/.openclaw/workspace/mouse_sim.py`
- **Venv:** `/opt/mouse-sim-env`
- **Run:** `DISPLAY=:99 /opt/mouse-sim-env/bin/python /root/.openclaw/workspace/mouse_sim.py &`
- **Pattern:** Figure-8 Lissajous mouse movement + shift key presses, 425s active / 75s break cycle

## Browser Automation Workflow
The main task is to log into a work website and complete form-based tasks:

1. **Verify NordVPN is connected to NZ**
2. **Ensure Xvfb + Chrome are running** (`systemctl --user status xvfb.service openclaw-browser.service`)
3. **Start Hubstaff tracking** on the Multimango project (if authenticated)
4. **Start mouse simulation** in background
5. **Navigate to the work website** and log in with provided credentials
6. **For each page/question:**
   - Take a snapshot (`browser snapshot`) to read content and identify form elements
   - Analyze the question/text and determine the correct answer
   - Click/select/type the appropriate response using element `ref` attributes
   - Submit and proceed to the next page
7. **Stop Hubstaff** when done

## OpenClaw Browser Tool Reference
- `browser start` — attach to running Chrome (attachOnly mode)
- `browser navigate --targetUrl <url>` — go to a URL
- `browser snapshot` — get accessibility tree (DOM content, element refs)
- `browser screenshot` — capture visual screenshot
- `browser act --request '{"kind":"click","ref":"e5"}'` — click an element
- `browser act --request '{"kind":"type","ref":"e5","text":"hello"}'` — type into a field
- `browser act --request '{"kind":"press","key":"Enter"}'` — press a key
- `browser act --request '{"kind":"select","ref":"e5","values":["option1"]}'` — select dropdown
- `browser act --request '{"kind":"fill","ref":"e5","text":"value"}'` — fill a field (clears first)

## Gmail Access
- **Account:** astephenfang@gmail.com
- **Tool:** `gog gmail search "query" --account astephenfang@gmail.com --json`
- **Get message:** `gog gmail get <messageId> --account astephenfang@gmail.com --json`

## Credentials (to be provided)
- **Work website URL:** (pending)
- **Work website login:** (pending)
- **Hubstaff login:** (pending — needed for initial client auth)

## Key Warnings
- **Do NOT disconnect NordVPN without re-allowlisting** gateway IPs first — you'll lose connectivity
- **Do NOT switch Chrome to headless mode** — non-headless on Xvfb is required to avoid bot detection
- **If you lose browser connection:** check Xvfb first (`DISPLAY=:99 xdpyinfo`), then Chrome (`curl -s http://127.0.0.1:18800/json/version`), restart services as needed
- **Gateway process:** PID changes on restart. The OpenClaw gateway has `DISPLAY=:99` set via systemd drop-in at `~/.config/systemd/user/openclaw-gateway.service.d/display.conf`
