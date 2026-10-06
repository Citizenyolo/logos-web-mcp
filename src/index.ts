import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { logosLibrarySearch, logosSearchResource, logosGetPassage, logosGetContext } from "./logosClient.js";

const server = new McpServer({
    name: "logos-web-mcp",
    version: "0.1.0",
});

server.tool(
    "logos_library_search",
    "Search the authenticated Logos library for a query",
    {
        query: z.string().describe("The search query (e.g., 'Augustine Matthew 7')"),
        limit: z.number().optional().describe("Max number of results to return (default 10)"),
        cursor: z.string().optional().describe("Pagination cursor from a previous search"),
    },
    async ({ query, limit, cursor }) => {
        try {
            const data = await logosLibrarySearch(query, limit || 10, cursor);
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        } catch (e: any) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    }
);

server.tool(
    "logos_search_resource",
    "Search a specific resource in the Logos library",
    {
        resource_id: z.string().describe("The Logos resource ID (e.g., 'LLS:MTTHWCNTRS')"),
        query: z.string().describe("The search query"),
        limit: z.number().optional().describe("Max number of results to return (default 10)"),
        cursor: z.string().optional().describe("Pagination cursor"),
    },
    async ({ resource_id, query, limit, cursor }) => {
        try {
            const data = await logosSearchResource(resource_id, query, limit || 10, cursor);
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        } catch (e: any) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    }
);

server.tool(
    "logos_get_passage",
    "Retrieve a Bible passage or commentary on a Bible passage",
    {
        resource_id: z.string().describe("The Logos resource ID (e.g., 'LLS:MTTHWCNTRS')"),
        reference: z.string().describe("The Logos Bible reference (e.g., 'bible.61.7.1-61.7.5')"),
    },
    async ({ resource_id, reference }) => {
        try {
            const data = await logosGetPassage(resource_id, reference);
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        } catch (e: any) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    }
);

server.tool(
    "logos_get_context",
    "Retrieve a surrounding text passage from a specific resource by offset",
    {
        resource_id: z.string().describe("The Logos resource ID"),
        offset: z.number().describe("The starting offset for the text"),
        length: z.number().describe("The length of text to retrieve (e.g., 5000)"),
    },
    async ({ resource_id, offset, length }) => {
        try {
            const data = await logosGetContext(resource_id, offset, length);
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
            };
        } catch (e: any) {
            return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
        }
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Logos Web MCP Server running on stdio");
}

main().catch((e) => {
    console.error("Fatal error", e);
    process.exit(1);
});
