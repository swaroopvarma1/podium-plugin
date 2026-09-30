# Podium for Claude

Design presentation decks with Claude and present them from a link. This repository is
the Podium plugin's marketplace: the Podium skill and the Podium connector, in one
install, for claude.ai chat, the Claude desktop app, Cowork and Claude Code.

## Add it

**claude.ai or the desktop app** (it then follows your account into Cowork and Claude Code):

1. Customize → Plugins → Add → Add marketplace, and enter `swaroopvarma1/podium-plugin`.
2. Install **Podium**.
3. Open the plugin's Connectors tab, connect Podium, and sign in with your Podium account.
4. Turn on **Sync automatically** for the marketplace, so updates arrive by themselves.

**Claude Code only:**

```
claude plugin marketplace add swaroopvarma1/podium-plugin
claude plugin install podium@podium
```

Then `/mcp`, choose `podium`, and sign in.

## Where it comes from

`plugins/podium` is copied from https://podium.breezelabs.app/plugin.zip, the plugin
Podium was deployed with, every hour and after every deploy (`.github/workflows/sync.yml`).
Do not edit it here; it is overwritten.
