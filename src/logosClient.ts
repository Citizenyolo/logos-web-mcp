import { runInSafari } from './safari-bridge.js';

export async function logosLibrarySearch(query: string, limit?: number, cursor?: string) {
    const js = `
        let p = {
            query: ${JSON.stringify(query)},
            semanticSearchSettings: { userLanguage: "en-US" },
            resourceIds: []
        };
        if (${JSON.stringify(cursor || null)}) p.next = ${JSON.stringify(cursor)};
        
        let res = await fetch("https://app.logos.com/api/app/search/v2/books", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p)
        });
        
        if (res.status === 429) {
            throw new Error("Rate limit exceeded (HTTP 429). Please slow down.");
        }
        if (!res.ok) throw new Error("Search failed: " + res.status);
        
        let data = await res.json();
        
        for (let r of (data.results || [])) {
            r.logosLink = "https://ref.ly/logosres/" + r.resourceId + (r.offset ? ";offset=" + r.offset : "");
        }
        
        let results = data.results || [];
        if (${JSON.stringify(limit || null)}) results = results.slice(0, ${limit});
        
        return {
            results,
            nextCursor: data.next
        };
    `;
    return runInSafari(js);
}

export async function logosSearchResource(resourceId: string, query: string, limit?: number, cursor?: string) {
    const js = `
        let p = {
            query: ${JSON.stringify(query)},
            semanticSearchSettings: { userLanguage: "en-US" },
            resourceIds: [${JSON.stringify(resourceId)}]
        };
        if (${JSON.stringify(cursor || null)}) p.next = ${JSON.stringify(cursor)};
        
        let res = await fetch("https://app.logos.com/api/app/search/v2/books", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p)
        });
        
        if (res.status === 429) {
            throw new Error("Rate limit exceeded (HTTP 429). Please slow down.");
        }
        if (!res.ok) throw new Error("Search failed: " + res.status);
        
        let data = await res.json();
        
        for (let r of (data.results || [])) {
            r.logosLink = "https://ref.ly/logosres/" + r.resourceId + (r.offset ? ";offset=" + r.offset : "");
        }
        
        let results = data.results || [];
        if (${JSON.stringify(limit || null)}) results = results.slice(0, ${limit});
        
        return {
            results,
            nextCursor: data.next
        };
    `;
    return runInSafari(js);
}

const parserJS = `
function parseRichText(xmlString) {
    if (!xmlString) return "";
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString("<Root>" + xmlString + "</Root>", "text/xml");
    let text = "";
    
    function traverse(node) {
        if (node.nodeName === "Paragraph") {
            if (text !== "" && !text.endsWith("\\n\\n")) text += "\\n\\n";
            for (let child of node.childNodes) traverse(child);
        } else if (node.nodeName === "Run") {
            let t = node.getAttribute("Text");
            let italic = node.getAttribute("FontItalic") === "True";
            let bold = node.getAttribute("FontBold") === "True";
            if (t) {
                if (bold) t = "**" + t + "**";
                if (italic) t = "*" + t + "*";
                text += t;
            }
        } else if (node.nodeName === "Reference") {
            let ref = node.getAttribute("Reference");
            text += "[";
            let startLen = text.length;
            for (let child of node.childNodes) traverse(child);
            if (text.length === startLen) text += "ref";
            // Clean up the bible reference prefix for the logosres link
            let cleanRef = ref;
            if (ref.startsWith("bible+")) {
               cleanRef = ref.split(".")[0].replace("bible+", "") + "." + ref.split(".").slice(1).join(".");
            }
            text += "](https://ref.ly/logosres/" + cleanRef + ")";
        } else if (node.nodeName === "Tab") {
            text += "  ";
        } else if (node.childNodes && node.childNodes.length > 0) {
            for (let child of node.childNodes) traverse(child);
        }
    }
    traverse(xmlDoc.documentElement);
    return text.trim();
}
`;

export async function logosGetPassage(resourceId: string, reference: string) {
    const js = `
        ${parserJS}
        let url = "https://app.logos.com/api/app/preview?resourceId=" + encodeURIComponent(${JSON.stringify(resourceId)}) + "&reference=" + encodeURIComponent(${JSON.stringify(reference)});
        let res = await fetch(url);
        
        if (res.status === 429) {
            throw new Error("Rate limit exceeded (HTTP 429). Please slow down.");
        }
        if (!res.ok) throw new Error("Fetch failed: " + res.status);
        
        let data = await res.json();
        let markdown = parseRichText(data.richText);
        let logosLink = "https://ref.ly/logosres/" + ${JSON.stringify(resourceId)} + ";ref=" + ${JSON.stringify(reference)};
        return { passage: markdown, logosLink };
    `;
    return runInSafari(js);
}

export async function logosGetContext(resourceId: string, offset: number, length: number) {
    const js = `
        ${parserJS}
        let url = "https://app.logos.com/api/app/preview?resourceId=" + encodeURIComponent(${JSON.stringify(resourceId)}) + "&offset=" + ${offset} + "&length=" + ${length};
        let res = await fetch(url);
        
        if (res.status === 429) {
            throw new Error("Rate limit exceeded (HTTP 429). Please slow down.");
        }
        if (!res.ok) throw new Error("Fetch failed: " + res.status);
        
        let data = await res.json();
        let markdown = parseRichText(data.richText);
        let logosLink = "https://ref.ly/logosres/" + ${JSON.stringify(resourceId)} + ";offset=" + ${offset};
        return { passage: markdown, logosLink };
    `;
    return runInSafari(js);
}
