# Logos Web MCP (Model Context Protocol)

A specialized Model Context Protocol (MCP) server that provides retrieval tools an AI research workflow can use to search your personal licensed Logos library and extract relevant context blocks for research synthesis.

---

### Important — Logos Terms and responsible use

This is an independent, experimental open-source project and is not affiliated with, endorsed by, or supported by Logos/Faithlife.

The project is intended as a proof of concept for personal, human-initiated research using resources to which the user already has legitimate access. It is deliberately designed for focused retrieval rather than crawling, bulk extraction, library replication, or model training.

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

## 📋 Prerequisites

- **macOS** (Requires AppleScript / `osascript`).
- **Safari browser** (Must be open with an active, logged-in tab pointing to `https://app.logos.com`).
- **Node.js** (v18+ recommended).
- **Legitimate Logos Account** with an active library.

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Citizenyolo/logos-web-mcp.git
   cd logos-web-mcp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the TypeScript files:**
   ```bash
   npm run build
   ```

4. **Add to your MCP Client configuration (e.g., Antigravity or Claude Desktop):**
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

## 🤝 Contributing
Contributions are welcome. Please ensure that all pull requests respect the foundational architectural principle of this project: zero persistence of credentials and strict reliance on the user's active Safari context.

## 📜 License
[MIT License](LICENSE)
