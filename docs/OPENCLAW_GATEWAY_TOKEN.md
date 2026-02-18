# OpenClaw Gateway — Fix "gateway token missing"

When you see:

```text
disconnected (1008): unauthorized: gateway token missing (open the dashboard URL and paste the token in Control UI settings)
```

do this:

## 1. Open the Control UI (dashboard)

- **URL:** [http://127.0.0.1:18789/](http://127.0.0.1:18789/) (or `http://localhost:18789/`)
- If the page doesn’t load, start the gateway: `openclaw gateway start`

## 2. Get the gateway token

In a terminal:

```bash
# Show existing token (if set)
openclaw config get gateway.auth.token
```

If that’s empty or you need a new token:

```bash
openclaw doctor --generate-gateway-token
```

Copy the token from the output.

## 3. Paste the token in Control UI settings

- In the Control UI page, open **Settings** (gear or “Settings” in the UI).
- Find the **auth** / **token** field (for WebSocket `connect.params.auth.token`).
- Paste the token and save.

The UI stores it in `localStorage` so you stay connected next time.

## 4. (Optional) Set token in config

To fix “token missing” for other clients (e.g. Cursor MCP), set the token in OpenClaw config:

```bash
openclaw config set gateway.auth.token "YOUR_TOKEN_HERE"
```

Or put it in `~/.openclaw/openclaw.json`:

```json5
{
  gateway: {
    auth: { mode: "token", token: "YOUR_TOKEN_HERE" },
  },
}
```

Then restart the gateway: `openclaw gateway stop` then `openclaw gateway start`.

## 5. Cursor / MCP

If Cursor (or another app) connects to the gateway via MCP, configure the **same token** in that app’s gateway/MCP settings (e.g. Cursor → Settings → search for “MCP” or “gateway” → paste token).

---

**Security:** Don’t commit tokens to git. Store tokens in a password manager or env vars.
