# Bot Squad Workflow

## Objective
Continuously exercise the Sportsphere platform with 25 automated bot accounts that behave like real users — posting, liking, commenting, following, messaging, and engaging with all features.

## Architecture
- **Sports Brain** (`tools/sports_brain.mjs`) → Season/event awareness, content priority weights
- **Bot Personas** (`tools/bot_personas.json`) → 25 bots: 12 parent-managed youth, 2 adult athletes, 5 basketball, 4 football, 3 soccer, 3 general
- **Content Banks** (`tools/bot_content.mjs`) → NO training/drills. Game recaps, news, motivation, parent perspective, tournament talk.
- **Scheduler** (`tools/bot_scheduler.mjs`) → Weighted random timing with peak hours, jitter, daily limits
- **Actions** (`tools/bot_actions.mjs`) → 16 action types via API + Playwright
- **Orchestrator** (`tools/bot_squad.mjs`) → Main loop, CLI, graceful shutdown

## Modes
| Mode | Speed | Description |
|------|-------|-------------|
| organic | 1.0x | Realistic usage. Default. |
| qa-testing | 0.5x | Edge case content, unusual patterns |
| stress-test | 5.0x | High volume, all bots rapid-fire |
| marketing | 0.8x | Polished brand-like content |

## Running
```bash
# Start (background)
node tools/bot_squad.mjs --mode organic --speed 3 &

# Stop
node tools/bot_squad.mjs --stop

# Status
node tools/bot_squad.mjs --status

# First-time setup (create accounts)
node tools/setup_bot_squad.mjs
```

## Monitoring
- Activity log: `bot_activity_log` table in Supabase
- Maintenance log: `bot_maintenance_log` table
- Report: `.tmp/bot_squad_report.json` (written on shutdown)
- Command Center: `/CommandCenter` admin page (when built)

## Sport Priority (Baseball/Softball First)
Baseball/softball always ≥25% of content. Dynamically shifts with seasons:
- Spring training → baseball 45%+
- World Series → baseball 60%
- March Madness → basketball spikes
- Super Bowl week → football spikes

## Known Constraints
- Supabase rate limits: scheduler includes backoff logic
- Playwright pool: max 2 concurrent browsers (memory)
- Bot emails: `*@sportsphere.app` domain
- Content: NO training drills. Empty training pages await quality uploads.
