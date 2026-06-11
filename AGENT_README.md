# AGENT_README — Operating this repo on a new machine

This file is for getting a **new machine/operator** (or the AI agent running on it) from a fresh
`git clone` to confidently editing, deploying, and publishing. The repo's `CLAUDE.md` describes the
site itself; this file describes the *environment* around it.

There are **two separate workflows** here, and they use **completely different infrastructure**:

| Workflow | What it changes | Infrastructure | Lives in this repo? |
|----------|-----------------|----------------|---------------------|
| **1. The website** | clearlightai.com | Netlify (auto-deploy from `main`) | ✅ Yes — fully self-contained |
| **2. Publishing pages** | pages.clearlightai.com/{slug} | AWS EC2 (via a Claude Code skill + SSH) | ❌ No — separate skill + server |

---

## Workflow 1 — Edit & deploy the website

Everything you need is in this repo. No secrets, no cloud credentials.

### One-time setup
1. Install **Node.js LTS (≥18)** and **git**.
2. Clone and install:
   ```bash
   git clone https://github.com/ClearLightAI/clai-website.git
   cd clai-website
   npm install
   ```
3. (Optional) Install **ffmpeg** only if you'll swap the hero video: `brew install ffmpeg`.

### Daily loop
```bash
npm run dev      # → http://localhost:3333  (live preview while editing)
# ...make changes...
npm run build    # optional: verify it builds clean before pushing
git add -A && git commit -m "your message" && git push
```

### How deploy works
- **Host:** Netlify. Pushing to the **`main`** branch auto-deploys. There is no manual deploy step.
- **Publish dir:** `dist` (Astro static output).
- **Domain:** clearlightai.com (DNS via Cloudflare).
- **Env vars** (e.g. the OpenClaw basic-auth on `/openclaw-biz-intel`) live **in Netlify**, not in this
  repo. Deploys inherit them automatically — you don't set anything locally.
- To see deploy status / roll back a bad deploy, you need **Netlify collaborator access** to the site.
  Pushing works without it, but visibility doesn't.

### Access you need for Workflow 1
- **GitHub write** on `ClearLightAI/clai-website`.
- **Netlify collaborator** on the site (for deploy visibility / rollback) — optional but recommended.

### Tech notes (see `CLAUDE.md` for the full picture)
- Astro 6, static output, Tailwind v4 via `@tailwindcss/vite` (NOT `@astrojs/tailwind`).
- Gradient text uses **inline `style`**, not Tailwind classes (v4 purges custom `background-clip`).
- Headings use `font-light`, never bold.

---

## Workflow 2 — Publishing hosted pages (pages.clearlightai.com)

This is **not part of this repo.** It's a Claude Code skill that builds a self-contained HTML page and
pushes it to a service on AWS over SSH. Setting it up is independent of the website.

### What it needs
1. **The skills plugin** — `clearlight-publish-page` lives in the `ClearLightAI/clai-agent-skills`
   repo, exposed via the `clearlight-content` plugin. To install:
   ```bash
   git clone https://github.com/ClearLightAI/clai-agent-skills.git
   ```
   Then in Claude Code, register that clone as a local plugin marketplace named **`clearlight-skills`**
   and enable the **`clearlight-content`** plugin. (Naming matters: this website repo's
   `.claude/settings.json` already references `clearlight-content@clearlight-skills`, so matching those
   names makes the plugin activate automatically here.)

2. **SSH access to the publish server** (`13.215.68.238`):
   - Generate your own keypair: `ssh-keygen -t ed25519 -f ~/.ssh/clai-pages -C "you-pages"`
   - Send the **public** key (`~/.ssh/clai-pages.pub`) to Stephen, who appends it to the EC2 box's
     `authorized_keys`. Port 22 is already open; no security-group change is needed.
   - **No AWS account / IAM user is required** — this is OS-level SSH only. The publish workflow never
     calls the AWS API.

3. **The publish secret** (`REGISTER_SECRET`) — no manual hand-off. Once SSH works, the skill fetches
   it off the server itself on first use.

### SSH key configuration
The skill reads the SSH key path from a `$CLAI_SSH_KEY` environment variable (set it once per session).
On a new machine:
```bash
export CLAI_SSH_KEY=~/.ssh/clai-pages    # whatever key Stephen authorized on the box
```
The skill's Prerequisites section walks through generating a key, getting the public half authorized,
and verifying the connection. If publishing fails with `Permission denied`, the public key isn't on the
server yet — send `~/.ssh/clai-pages.pub` to Stephen.

---

## Quick "do I have everything?" check

- [ ] `node -v` ≥ 18, `npm install` succeeds, `npm run dev` serves localhost:3333
- [ ] `git push` to `main` works (GitHub write access)
- [ ] (Website) Netlify collaborator access for deploy visibility
- [ ] (Pages) `clai-agent-skills` cloned + `clearlight-content` plugin enabled
- [ ] (Pages) your SSH pubkey added to `13.215.68.238`; `ssh -i ~/.ssh/clai-pages ec2-user@13.215.68.238` connects
