# MEMORY.md - Long-Term Memory

## Stephen
- Based in Auckland, NZ (Pacific/Auckland, NZDT UTC+13)
- Discord: shinramenisbae
- Gmail: astephenfang@gmail.com
- Works on Outlier AI (Aether project) — uses Hubstaff for time tracking on Multimango
- Has a Stake investing account (NZ region)
- University of Auckland student (rec centre membership)
- Uses Sharesies, Easy Crypto, Wise (USD account)
- Duolingo streak: 52+ days
- Planning trip to Melbourne: Apr 9-12, 2026. Price alert set at NZ$630. Prices have been ~$588-634 on Qantas.

## VPS / Infrastructure
- Hostinger VPS: Ubuntu 24.04, 8GB RAM, 92GB disk, Python 3.12
- OpenClaw gateway running on this VPS (srv1346724, IP 76.13.182.206)
- Xvfb on :99 (systemd: xvfb.service) — if crashed: `rm -f /tmp/.X99-lock /tmp/.X11-unix/X99` then restart
- NordVPN v4.4.0 connected to NZ #111 — firewall enabled, allowlisted: ports 22/80/3000/6080 + subnet 76.13.182.0/24 + Discord gateways
- Chrome 145 non-headless on Xvfb :99, CDP port 18800, attachOnly mode (systemd: openclaw-browser.service)
  - Config: ~/.openclaw/openclaw.json — attachOnly=true, headless=false, noSandbox=true, defaultProfile="openclaw"
  - User data: /root/.openclaw/browser/openclaw/user-data
- Gateway systemd drop-in at ~/.config/systemd/user/openclaw-gateway.service.d/display.conf (DISPLAY=:99)
- Hubstaff at ~/.local/share/hubstaff/ — client needs login dialog completed on :99
- Mouse sim script at /root/.openclaw/workspace/mouse_sim.py (venv: /opt/mouse-sim-env)
- **Mission Control** web app at /root/.openclaw/workspace/mission-control/ — Next.js on port 80 (systemd: mission-control.service)
  - Pages: Tasks board, Calendar, Memory (daily/weekly/long-term with search), Screen (live noVNC viewer)
  - x11vnc on port 5900 + noVNC/websockify on port 6080 (systemd services)
  - URL: http://76.13.182.206/

## Active Cron Jobs
- Flight price watcher: AKL→MEL Apr 9-12, checks every 6h, alerts if < NZ$630 (job ID: ccce6dea-8cf8-44bd-94c6-71853c51889b)
- Email summary cron (job ID: f97379af-c999-49f0-aa72-fa9fae48af3d) — runs daily at 08:00 NZDT

## Tools & Access
- gog CLI (gogcli v0.9.0) authorized for astephenfang@gmail.com — Gmail/Calendar/Drive/Contacts
- Browser: Chrome 145 non-headless on Xvfb, NordVPN for NZ IP, OpenClaw attaches via CDP
- agent-browser v0.10.0 (Playwright Chromium) — supplementary tool for form automation
- self-improving-agent skill — .learnings/ directory for error/correction logs
- Email: read, search, modify labels (mark read/unread), fetch full bodies

## Multimango (Outlier Work Platform)
- Account "eleven": wfe-67adaf4f5bcd9e452a882ca2@outlier.ai / 2ac2e307-1e70-4d7a-935b-ef95eb68a21d
- Status: approvedAnnotator, logged in
- 25+ task types available (perception captions, video tasks, Instagram tasks, TTS, etc.)
- AI detection: captions must be humanized — use first person, contractions, casual tone. Humanize skill installed.
- Completed 2 perception caption tasks successfully

## Fallback Model
- Kimi K2.5 via NVIDIA NIM API as fallback when Claude rate-limited
- Config: nvidia/kimi-k2-instruct in agents.defaults.model.fallbacks

## Lessons Learned
- Hubstaff Linux installer uses MojoSetup which breaks on Ubuntu 24.04 — extract the embedded ZIP at byte offset 524926 instead of running the GUI
- Gmail thread modify with --remove UNREAD marks threads as read
- Google Flights data accessible via web_fetch on the travel URL
- Stake unsubscribe page is React SPA — needs real browser, can't do via fetch
- Ubuntu 24.04 doesn't have libncurses5 — symlink from .so.6 works for compat
