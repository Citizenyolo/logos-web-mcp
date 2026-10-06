# Logos Web MCP (Model Context Protocol)

A specialized Model Context Protocol (MCP) server that provides retrieval tools an AI research workflow can use to search your personal licensed Logos library and extract relevant context blocks for research synthesis.

---

### Important — Logos Terms and responsible use

This is an independent, experimental open-source project and is not affiliated with, endorsed by, or supported by Logos/Faithlife.

The project is intended as a proof of concept for personal, human-initiated research using resources to which the user already has legitimate access. It is deliberately designed for focused retrieval rather than crawling, bulk extraction, library replication, or model training. Its platform scope is intentionally narrow: this proof-of-concept implementation supports macOS and Safari only and provides no automated installer.

Logos’ Terms of Service contain restrictions concerning automated access, AI systems, APIs, scraping, and related uses. Those terms may change over time. Before using this software, review the current Logos Terms of Service and obtain any permission that may be required for your intended use.

This software does not grant any rights to Logos services or licensed content. Users are responsible for ensuring that their use complies with applicable terms, licenses, and law.

Logos and related marks are trademarks of their respective owners.

---

## 🏗 Architecture

This MCP operates **entirely client-side** and relies completely on your own authenticated Safari session.
1. The MCP server is executed locally via Node.js.
2. It uses macOS `osascript` (AppleScript) to locate your active `app.logos.com` tab in Safari.
3. It securely delegates all network requests (`fetch`) through that exact browser tab.
4. The request executes within the authenticated app.logos.com Safari context and uses the browser's existing authenticated session.
5. The MCP does not extract or persist passwords, session tokens, or cookies.

## 🔒 Data Flow and Privacy

* The MCP retrieves content from your licensed Logos library through your authenticated Safari session.
* Retrieved search results and book/context excerpts are returned locally to your configured MCP client.
* Depending on your MCP client's configuration, that content may subsequently be sent to the AI/model provider used by that client for processing and synthesis.
* This project itself does not operate an external server and does not independently store or transmit retrieved Logos content to any third-party service.
* You should understand the privacy, data retention, and content-handling policies of your chosen MCP client and AI/model provider.

## 📋 Prerequisites

- **macOS** (Requires AppleScript / `osascript`).
- **Safari browser** (Must be open with an active, logged-in tab pointing to `https://app.logos.com`).
- **Node.js** (v18+ recommended).
- **Legitimate Logos Account** with an active library.

## ⚙️ MCP Client Setup

Add this to your MCP Client configuration (e.g., Antigravity or Claude Desktop):
   ```json
   {
     "mcpServers": {
       "logos-web": {
         "command": "node",
         "args": ["/absolute/path/to/logos-web-mcp/build/index.js"]
       }
     }
   }
   ```

## 🛠 Available MCP Tools

This server exposes 4 specific tools to your LLM:

* \`logos_library_search\` - Search your entire Logos library for a query (equivalent to the global Books Search).
* \`logos_search_resource\` - Run a targeted search within a specific book/resource.
* \`logos_get_passage\` - Retrieve a specific Bible passage or reference from a given resource.
* \`logos_get_context\` - Retrieve a bounded block of plaintext (markdown) context surrounding a specific search hit offset.

## 📖 Example Agent Skill

To see how this MCP can be paired with an LLM to act as a "Theological Research Librarian", see the included example skill instructions in the `example-agent-skill/` directory.

### Why a Theological Research Librarian?

Large Logos libraries can contain hundreds or thousands of books. For a serious research question, the challenge is often not obtaining a quick answer, but discovering which sources in that library contain the deepest and most relevant treatment of the subject.

The example Skill explores a different AI interaction model: a Senior Theological Research Librarian. Rather than stopping at a small number of search results and a short summary, it can search iteratively across your personal Logos library, follow promising authors, concepts, references, and primary sources, and identify the strongest material for deeper reading.

Importantly, the goal is not to outsource theological interpretation, analysis, or synthesis to AI. The AI acts as a research guide: helping the user navigate a library that may be too large to search manually, explaining why particular sources matter, and producing a structured bibliography linked back to the original sources. When the Logos desktop app is installed on the Mac, these links can open the relevant resource — at the referenced location where available — directly in Logos. The intended endpoint is better human reading and research, not a replacement for it.



> **Note on Portability:** The included `SKILL.md` represents one working configuration optimized for an environment that supports persistent file/artifact creation (like Antigravity). Different MCP/AI clients may support skills, system prompts, and file creation differently. You should adapt the example Skill to match your client’s specific capabilities and your own preferences.


## 📜 License
[MIT License](LICENSE)
