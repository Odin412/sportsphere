---
name: bot-squad
description: Use when someone asks to start/stop/check the bot squad, manage test bots, or run automated platform interactions
argument-hint: "[start|stop|status|config] [--mode organic|qa|stress|marketing] [--speed 1-10]"
---

# Bot Squad — Automated Platform Testing & Activity

Manage the 25-bot squad that continuously exercises the Sportsphere platform.

## Commands

Based on `$ARGUMENTS`:

### `start` (default)
```bash
cd sportsphere-main/sportsphere-main
node tools/bot_squad.mjs $ARGUMENTS
```
- Default mode: `organic`, speed: `3`, all 25 bots
- Options: `--mode <mode>`, `--speed <1-10>`, `--bots <N>`, `--headed`
- Modes: `organic` (realistic), `qa-testing` (edge cases), `stress-test` (high volume), `marketing` (brand-like)

### `stop`
```bash
cd sportsphere-main/sportsphere-main
node tools/bot_squad.mjs --stop
```

### `status`
```bash
cd sportsphere-main/sportsphere-main
node tools/bot_squad.mjs --status
```
Also query Supabase for recent bot activity:
```bash
node -e "
  const SB='https://xjcygntnkjkgvyynldzf.supabase.co';
  const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
  fetch(SB+'/rest/v1/bot_activity_log?select=action_type,success,created_at&order=created_at.desc&limit=10', {
    headers: { 'apikey': KEY, 'Authorization': 'Bearer '+KEY }
  }).then(r=>r.json()).then(d=>console.log(JSON.stringify(d,null,2)));
"
```

### `config`
Show current configuration and allow adjustments via the `bot_config` table.

### `setup`
First-time setup — creates bot accounts:
```bash
cd sportsphere-main/sportsphere-main
node tools/setup_bot_squad.mjs
```

## Sports Brain Context
The bot squad uses the Sports Brain for season-aware content. Check it:
```bash
cd sportsphere-main/sportsphere-main
node -e "import('./tools/sports_brain.mjs').then(m => console.log(JSON.stringify(m.getSportsContext(), null, 2)))"
```

## Key Files
- `tools/bot_squad.mjs` — Main orchestrator
- `tools/bot_personas.json` — 25 bot persona definitions
- `tools/bot_content.mjs` — Content generation (NO training/drill content)
- `tools/bot_scheduler.mjs` — Action timing engine
- `tools/bot_actions.mjs` — API + Playwright action executors
- `tools/sports_brain.mjs` — Sports calendar intelligence
- `tools/bot_config.mjs` — Configuration management
