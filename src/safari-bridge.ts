import { exec } from 'child_process';

export async function runInSafari(jsCode: string): Promise<any> {
    const base64Js = Buffer.from(jsCode).toString('base64');
    const runId = "run_" + Math.random().toString(36).substring(2);
    
    const appleScript = `
tell application "Safari"
    set windowList to windows
    repeat with w in windowList
        set tabList to tabs of w
        repeat with t in tabList
            if (URL of t) contains "app.logos.com" then
                set scriptRunner to "
                window.__logos_results = window.__logos_results || {};
                window.__logos_results['${runId}'] = 'pending';
                (async function() {
                    try {
                        const code = decodeURIComponent(escape(window.atob('${base64Js}')));
                        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
                        const fn = new AsyncFunction(code);
                        const result = await fn();
                        window.__logos_results['${runId}'] = JSON.stringify({ success: true, data: result });
                    } catch(e) {
                        window.__logos_results['${runId}'] = JSON.stringify({ success: false, error: e.message });
                    }
                })();
                "
                do JavaScript scriptRunner in t
                
                -- Poll for completion
                repeat 150 times
                    delay 0.1
                    set res to do JavaScript "window.__logos_results['${runId}']" in t
                    if res is not "pending" then
                        do JavaScript "delete window.__logos_results['${runId}']" in t
                        return res
                    end if
                end repeat
                
                return "TIMEOUT"
            end if
        end repeat
    end repeat
    return "NO_TAB"
end tell
`;

    return new Promise((resolve, reject) => {
        const process = exec('osascript', (error, stdout, stderr) => {
            if (error) {
                return reject(new Error(`AppleScript error: ${stderr || error.message}`));
            }
            
            const out = stdout.trim();
            if (out === "NO_TAB") {
                return reject(new Error("Could not find an active app.logos.com tab in Safari. Please open Logos Web App and log in."));
            }
            if (out === "TIMEOUT") {
                return reject(new Error("Safari execution timed out."));
            }
            
            try {
                const parsed = JSON.parse(out);
                if (parsed.success) {
                    resolve(parsed.data);
                } else {
                    reject(new Error(parsed.error));
                }
            } catch (e) {
                reject(new Error("Failed to parse response from Safari: " + out));
            }
        });
        
        process.stdin?.write(appleScript);
        process.stdin?.end();
    });
}
