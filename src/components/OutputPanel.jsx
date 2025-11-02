import React from 'react';

export default function OutputPanel({ text, onAction, pending, lastParams }) {
async function copy() {
if (!text) return;
await navigator.clipboard.writeText(text);
alert('Copied to clipboard');
}


const disabled = pending || !lastParams;


return (
<div className="output">
<div className="toolbar">
<button onClick={() => onAction({ ...lastParams, action: 'regenerate' })} disabled={disabled}>Regenerate</button>
<button onClick={() => onAction({ ...lastParams, action: 'shorten' })} disabled={disabled}>Shorten</button>
<button onClick={() => onAction({ ...lastParams, action: 'expand' })} disabled={disabled}>Expand</button>
<button onClick={() => onAction({ ...lastParams, action: 'improve_tone' })} disabled={disabled}>Improve Tone</button>
<button onClick={copy} disabled={!text}>Copy</button>
</div>
<pre className="result" aria-live="polite">{text || 'Your generated copy will appear here.'}</pre>
</div>
);

}
