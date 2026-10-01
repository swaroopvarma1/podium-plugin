# Podium

Build presentation decks with Claude and present them from a link. Podium renders and hosts
the deck; Claude designs it, as a program, with the skill in this plugin.

## Use it

Ask Claude for a deck, a pitch or a talk. It asks about the room and the one claim first,
then writes a build program. In Claude Code the program runs on your machine; in claude.ai
chat, the desktop app and Cowork, Podium runs it with the `build` tool. Either way Claude
looks at every slide (`look`) and fixes what it sees before handing the deck over.

Your own photos and logos go in through a drop zone Claude opens (`add_pictures`): drop
them into the Podium panel in the chat, or open the link it gives you.

Connect the Podium connector from this plugin's **Connectors** tab and sign in with your
Podium account.

## Data

Decks, their build programs and the pictures you add are stored in your Podium account at
https://podium.breezelabs.app. If the Podium admin has turned image generation on for you, the description of
each picture you ask for goes to the image model Podium uses. Decks load their typefaces
from Google Fonts when they are shown.
