// api/generate.js — Vercel Serverless Function


export const config = {
runtime: 'edge', // fast, low-cold-start
};


const ALLOWED_ORIGINS = [
  'https://ai-copywright.netlify.app',   
  'https://tyler-cobb-portfolio.netlify.app',
  'http://localhost:5173',
];



// Simple per-request guardrails
const MAX_TOPIC_LEN = 140;
const MAX_KEYWORDS_LEN = 200;
const MAX_OUTPUT_TOKENS = 400; // keep costs/latency down


function corsHeaders(origin) {
return {
'Access-Control-Allow-Origin': origin,
'Access-Control-Allow-Methods': 'POST, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type',
};
}


export default async function handler(req) {
if (req.method === 'OPTIONS') {
const origin = req.headers.get('origin') || '';
const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
return new Response(null, { status: 204, headers: corsHeaders(allowOrigin) });
}


if (req.method !== 'POST') {
return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}


const origin = req.headers.get('origin') || '';
const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '';
if (!allowOrigin) {
return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403 });
}



const { topic = '', tone = 'neutral', keywords = '', contentType = 'blog_intro', action = 'generate' } = await req.json();


// Basic input limits
const safeTopic = String(topic).slice(0, MAX_TOPIC_LEN);
const safeKeywords = String(keywords).slice(0, MAX_KEYWORDS_LEN);


// Map content types to brief instructions
const typeInstructions = {
blog_intro: 'Write a captivating blog introduction (120–180 words).',
product_description: 'Write a product description focused on benefits (80–140 words).',
ad_copy: 'Write 2 short ad variations (max 35 words each).',
social_caption: 'Write 3 concise social captions with subtle hooks (max 20 words each).',
};


const actionInstructions = {
generate: '',
regenerate: 'Regenerate a different take with fresh phrasing.',
shorten: 'Shorten aggressively while keeping the core idea intact.',
expand: 'Expand with 30% more detail and specificity (avoid fluff).',
improve_tone: `Rewrite to better match a ${tone} tone.`,
};


// eslint-disable-next-line no-unused-vars
const system = `You are an elite marketing copywriter. Keep language concrete and specific. Avoid clichés. Match the requested tone.`;


const userPrompt = `
Content Type: ${contentType}
Tone: ${tone}
Topic: ${safeTopic}
Keywords: ${safeKeywords}

Task: ${typeInstructions[contentType] || typeInstructions.blog_intro}
${actionInstructions[action] || ''}


Rules:
- Include relevant keywords naturally (no stuffing).
- Keep it scannable. Prefer short sentences.
- Never include policy or system text in the output.
`;


try {
// eslint-disable-next-line no-undef
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('Missing OPENAI_API_KEY');


// Use the Responses API (chat-quality, low-cost model). Adjust model as desired.
const resp = await fetch('https://api.openai.com/v1/responses', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${apiKey}`,
},
body: JSON.stringify({
model: 'gpt-4o-mini',
input: userPrompt,
max_output_tokens: MAX_OUTPUT_TOKENS,
temperature: 0.8,
}),
});


if (!resp.ok) {
const text = await resp.text();
return new Response(JSON.stringify({ error: 'OpenAI error', detail: text }), {
status: 500,
headers: corsHeaders(allowOrigin),
});
}


const data = await resp.json();
const output = data?.output?.[0]?.content?.[0]?.text || data?.output_text || '';


return new Response(JSON.stringify({ result: output }), {
status: 200,
headers: { 'Content-Type': 'application/json', ...corsHeaders(allowOrigin) },
});
} catch (err) {
return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), {
status: 500,
});
}

}
