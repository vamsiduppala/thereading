import OpenAI from 'openai';
import { updateChatStatus } from './chatBuffer.js';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: DEEPSEEK_API_KEY,
});

async function checkBalanceAndNotify(messageId: string): Promise<boolean> {
    updateChatStatus(messageId, "0. Verifying DeepSeek API balance...");
    try {
        const response = await fetch('https://api.deepseek.com/user/balance', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            }
        });
        const data = await response.json();
        
        let isBalanceOver = false;
        
        if (data.is_available === false) {
             isBalanceOver = true;
        } else if (data.balance_infos && data.balance_infos.length > 0) {
             const total = data.balance_infos.reduce((acc: number, info: any) => acc + parseFloat(info.total_balance), 0);
             if (total <= 0) isBalanceOver = true;
        }

        if (isBalanceOver) {
            updateChatStatus(messageId, "WARNING: DeepSeek balance is depleted! Contact admin.");
            return false;
        }
        return true;
    } catch (e) {
        console.error("Failed to check balance", e);
        return true; 
    }
}

export async function runServerAIPipeline(messageId: string, question: string, birth: any, facts: any, localPort: number) {
    const longitudes = Object.fromEntries(Object.entries(facts.planets).filter(([g]) => g !== 'ketu').map(([g, p]: any) => [g, p.longitude]));
    
    const hasBalance = await checkBalanceAndNotify(messageId);
    if (!hasBalance) {
        updateChatStatus(messageId, "Done", JSON.stringify({
            headline: "Service Unavailable",
            sections: [{ title: "Error", body: ["Sorry, the AI reasoning engine's balance is depleted. The administrator has been notified."] }]
        }));
        return;
    }

    const availableAPIs = [
        { path: "/bphs/arbitrate", method: "POST", description: "Arbitrate rules and get knowledge findings for the chart" },
        { path: "/bphs/dignity", method: "GET", description: "Get the dignity of a specific planet" },
        { path: "/karakas/chara", method: "POST", description: "Get the Chara Karakas (soul planets) for the chart" }
    ];

    updateChatStatus(messageId, "1. AI deciding which astrological APIs to query...");
    
    const prompt1 = `The user is asking: "${question}".
    Available internal APIs:
    ${JSON.stringify(availableAPIs, null, 2)}
    Based on the question, decide which APIs you need to call to get the data to answer this.
    CRITICAL: For POST /bphs/arbitrate, you MUST include the body exactly as: { "facts": ${JSON.stringify(facts)} }
    CRITICAL: For POST /karakas/chara, you MUST include the body exactly as: { "longitudes": ${JSON.stringify(longitudes)} }
    Return ONLY a JSON array of objects with { "path", "method", "body" (if POST), "query" (if GET) }.`;

    let apiCalls = [];
    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-v4-flash",
            messages: [
                { role: "system", content: "You output valid JSON only." },
                { role: "user", content: prompt1 }
            ],
            response_format: { type: 'json_object' }
        });
        apiCalls = JSON.parse(completion.choices[0]?.message?.content || '[]');
    } catch (e) {
        console.error("Step 1 failed", e);
        apiCalls = [{ path: "/bphs/arbitrate", method: "POST", body: { facts: { lagnaSign: facts.lagnaSign, planets: facts.planets } } }];
    }

    updateChatStatus(messageId, "2. Collecting FULL UNTRUNCATED responses from selected APIs...");
    const apiResponses: Record<string, any> = {};
    for (const call of apiCalls) {
        try {
            const url = `http://localhost:${localPort}${call.path}`;
            const opts: RequestInit = {
                method: call.method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (call.method === 'POST' && call.body) {
                opts.body = JSON.stringify(call.body);
            }
            const response = await fetch(url, opts);
            apiResponses[call.path] = await response.json();
        } catch (e) {
            console.error(`Failed to fetch ${call.path} from local server:`, e);
        }
    }

    updateChatStatus(messageId, "3. Synthesizing full master analysis and generating UI...");
    
    const megaPrompt = `You are a master AI guiding the user. 
    The user asked: "${question}".
    
    Here is the FULL RAW DATA pulled from astrological APIs regarding the user's chart:
    ${JSON.stringify(apiResponses, null, 2)}
    
    Your task is to deeply analyze this data in context of the user's question, synthesize a cohesive conclusion, and output it directly into a highly structured JSON UI format.
    
    CRITICAL RULES FOR YOUR RESPONSE:
    1. Speak ZERO astrological terms (no 'houses', 'lords', 'dasha', 'planets', etc).
    2. Speak ONLY in casual prediction answers, explaining the user's life or situation plainly and empathetically.
    3. If the user is asking "when" something will happen, or "which year", you MUST calculate the next 11 strongest windows (predicting percentages for those specific years/months).
    4. Provide a table of prediction strengths in percentages for the best upcoming windows.
    
    You must format this analysis into a highly structured JSON object that matches the app's native UI design.
    The JSON must match this structure exactly:
    {
      "headline": "A short, engaging, casual title",
      "sections": [
        {
          "title": "Section Title (e.g. 'The Core Truth', 'Upcoming Windows')",
          "body": [
            "Paragraph 1 in plain English without astrology terms. You can use *asterisks* for bold text.",
            "Paragraph 2."
          ],
          "windows": [
            { "label": "Jan - Mar 2027 (or Year)", "sub": "Short context", "pct": 85 },
            { "label": "Next Window", "sub": "Short context", "pct": 60 }
          ],
          "quotes": [
            "A casual, inspiring quote or key insight summarizing the situation."
          ]
        }
      ]
    }
    
    Ensure that the 11 strongest windows (if timing is requested) or the relevant prediction percentages are placed inside the 'windows' array of a section. This is MANDATORY for the UI to display it as a beautiful native table/progress bar. Do NOT use markdown outside of the body paragraphs.`;

    let finalResponseText = "";
    try {
        const result3 = await openai.chat.completions.create({
            model: "deepseek-v4-flash",
            messages: [{ role: "system", content: "You output valid JSON only." }, { role: "user", content: megaPrompt }],
            response_format: { type: "json_object" },
            // @ts-ignore
            thinking: { type: "enabled" }
        });
        finalResponseText = result3.choices[0]?.message?.content || "";
    } catch (e) {
        console.error("Step 3 Thinking Mode failed, falling back:", e);
        try {
            const fallbackResult = await openai.chat.completions.create({
                model: "deepseek-v4-flash",
                messages: [{ role: "system", content: "You output valid JSON only." }, { role: "user", content: megaPrompt }],
                response_format: { type: "json_object" }
            });
            finalResponseText = fallbackResult.choices[0]?.message?.content || "";
        } catch (fallbackError) {
            console.error("Step 3 Fallback failed:", fallbackError);
            finalResponseText = JSON.stringify({
                headline: "Analysis Error",
                sections: [{ title: "Error", body: ["The astrological engine failed to process the combined payload."] }]
            });
        }
    }

    // Set status to Done and save the result
    updateChatStatus(messageId, "Done", finalResponseText);
}
