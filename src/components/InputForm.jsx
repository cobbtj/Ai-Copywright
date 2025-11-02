import { useState } from 'react';
import { CONTENT_TYPES, TONES } from '../lib/presets';


export default function InputForm({ onSubmit, pending }) {
const [topic, setTopic] = useState('');
const [tone, setTone] = useState('friendly');
const [keywords, setKeywords] = useState('');
const [contentType, setContentType] = useState('blog_intro');


function handleSubmit(e) {
e.preventDefault();
onSubmit({ topic, tone, keywords, contentType, action: 'generate' });
}


return (
<form onSubmit={handleSubmit} className="form">
<div className="row">
<label>Content Type</label>
<select value={contentType} onChange={(e) => setContentType(e.target.value)}>
{CONTENT_TYPES.map((c) => (
<option key={c.value} value={c.value}>{c.label}</option>
))}
</select>
</div>


<div className="row">
<label>Topic / Product</label>
<input
type="text"
value={topic}
onChange={(e) => setTopic(e.target.value)}
placeholder="e.g., Budget travel in NYC"
required
/>
</div>


<div className="row">
<label>Tone</label>
<select value={tone} onChange={(e) => setTone(e.target.value)}>
{TONES.map((t) => (
<option key={t} value={t}>{t}</option>
))}
</select>
</div>


<div className="row">
<label>Keywords (comma-separated)</label>
<input
type="text"
value={keywords}
onChange={(e) => setKeywords(e.target.value)}
placeholder="budget, subway, pizza"
/>
</div>


<button type="submit" disabled={pending}>
{pending ? 'Generating…' : 'Generate'}
</button>
</form>
);
}