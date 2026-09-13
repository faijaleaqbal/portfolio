# Md Faijal Eaqbal — portfolio

> I build AI-powered products, automation systems and developer infrastructure.

Live site: **https://faijaleaqbal.duckdns.org** · BCA @ Malda College (Gour Banga University) · Malda, WB, India

This repo is the source of my portfolio — an **evidence-backed engineering portfolio**, not a
skills list. Every number on the site is measured from its repository on the date stated, with the
counting method written next to the claim.

## Selected work (6 flagships)

| # | Project | What it is | Proof |
|---|---------|-----------|-------|
| 1 | [MaldaOS](https://github.com/faijaleaqbal/Maldaos) · [case study](https://faijaleaqbal.duckdns.org/projects/maldaos.html) | Campus operations & issue-resolution platform: Supabase RLS, role workflows, AI triage, audit log, 3D campus twin | 17 pages + 1 API route · 165 frontend tests · 33 AI-gateway tests · 53 RLS policies · 27 RPC functions · CI |
| 2 | [Pixel-Assistor](https://github.com/faijaleaqbal/Pixel-Assistor) · [case study](https://faijaleaqbal.duckdns.org/projects/pixel-assistor.html) | Production Discord automation: moderation, Lavalink audio, multi-chain crypto, games | 123 commands loaded · 8 categories · 147/147 tests green · PM2 live |
| 3 | [Readstacks](https://github.com/faijaleaqbal/Readstacks) · [case study](https://faijaleaqbal.duckdns.org/projects/readstacks.html) | Private local RAG document assistant: per-user vector isolation, multi-provider fallback, SSE streaming | 10/10 tests green · **live demo: https://readstacks.duckdns.org** |
| 4 | [Picfix](https://github.com/faijaleaqbal/Picfix) · [case study](https://faijaleaqbal.duckdns.org/projects/picfix.html) | 59-page image & PDF suite: exam-photo specs, PDF engine, BullMQ + Redis workers, FastAPI AI microservice | 59 tool pages · 12 API route groups · 11 controllers |
| 5 | [Alya](https://github.com/faijaleaqbal/Rasa) · [case study](https://faijaleaqbal.duckdns.org/projects/alya.html) | Autonomous Hinglish AI assistant: Rasa 3.6 + Groq fallback, 40-skill registry, GitHub + OpenCode MCP | 40-skill registry · 41 intents · 494 test functions · **live: [@Alya_Rasa_Bot](https://t.me/Alya_Rasa_Bot)** |
| 6 | [malda-portal](https://github.com/faijaleaqbal/malda-portal) · [case study](https://faijaleaqbal.duckdns.org/projects/malda-portal.html) | 62-page institutional portal for Malda College, zero framework, token theming | 62 HTML pages · dark/light themes |

Also shipped: [LifeOS bot](https://github.com/faijaleaqbal/lifeos-bot),
[college notification bot](https://github.com/faijaleaqbal/malda-college-notification-bot) (live via PM2),
[Blitz Game Zone](https://github.com/faijaleaqbal/Blitz_Game_Zone) (TON mini-app).

## How numbers are counted (methodology)

- **355 automated tests** = MaldaOS frontend 165 (`npx vitest run`, 6 files) + AI-gateway 33
  (`npm test` in `ai-gateway/`) + Pixel-Assistor 147 (`npm test`) + Readstacks 10 (`npm test`).
  Excludes suites needing live credentials (MaldaOS runtime tests need a local Supabase stack;
  Pixel live-smoke needs a bot token). These exclusions are footnoted on the site itself.
  Alya additionally carries 494 test functions across its own suite.
- **123 commands** = output of the repo's own loader (`handlers/commandHandler`), 2026-09-13.
- **53 RLS policies / 27 RPC functions** = case-insensitive `CREATE POLICY` / `CREATE FUNCTION`
  statements across the 8 MaldaOS Supabase migrations.
- **59 tool pages** = `frontend/app/*/` dirs with a `page.tsx` (system routes excluded).
- **62 portal pages** = 31 root `*.html` + 6 `cells/` + 5 `facilities/` + 20 `subjects/`.
- **40 skills / 41 intents** = distinct `/commands` in `actions/command_registry.py` / entries in `domain.yml`.

Older README copy in some repos says 124 / 21 / 67+ / 50 / 37+ — the re-counted values above are
authoritative and each case-study page says so explicitly.

## Live demos — honest status

- ✅ Readstacks: https://readstacks.duckdns.org (HTTP 200, Nginx → PM2)
- ✅ Alya: https://t.me/Alya_Rasa_Bot · notification bot + Pixel-Assistor: online via PM2
- ❌ MaldaOS / Picfix / Portal: **no public demo link is claimed** — MaldaOS needs a Supabase
  stack, Picfix's domain is down. Case-study pages state this instead of faking a button.
  That is deliberate: no fake "Live Demo" anywhere on this site.

## What I actually build

- **AI systems** — RAG (BM25 + Vectra hybrid, page citations), multi-provider LLM gateways, SSE failover
- **Backend systems** — Postgres/SQLite, JWT, RBAC/RLS, SECURITY DEFINER RPCs, audit logs, BullMQ + Redis
- **Real-time systems** — SSE streaming, Discord gateway dispatch, Lavalink audio, schedulers
- **Automation** — Telegram/Discord bots, scraping pipelines, cron daemons, payment QR flows
- **Infrastructure** — Docker/Compose, Nginx TLS, PM2, GitHub Actions CI, systemd/cron

How I build: Idea → Architecture → Implementation → Testing → Security → Deployment → Monitoring.

## Project structure

```
portfolio/  (GitHub Pages — static, no build step)
├── index.html                  # home: hero, engineering, 6 flagships, stack, proof, contact
├── projects/                   # 6 case studies (problem → architecture → engineering →
│                               #   security → testing → result) + case-study.css
├── assets/images/case-studies/ # real MaldaOS Playwright screenshots (resized ≤1280px)
├── styles/main.css · scripts/  # vendored three/gsap/lenis; EmailJS contact form
├── 404.html · sitemap.xml · robots.txt · CNAME
└── PRD.md · structure.md · rules.md · phases.md · tasks.md · memory.md  # planning docs
```

## Run locally

```bash
python3 -m http.server 8901
# open http://127.0.0.1:8901/
```

Deploy: push to `main` → GitHub Pages serves `faijaleaqbal.duckdns.org` (CNAME).

## Contact

- GitHub: [@faijaleaqbal](https://github.com/faijaleaqbal)
- Email: faijaleaqbal@gmail.com · Telegram: [@xynqr](https://t.me/xynqr)
- LinkedIn: [md-faijal-eaqbal-a6bb1a380](https://www.linkedin.com/in/md-faijal-eaqbal-a6bb1a380)
