import React from 'react';
import { useState } from 'react';
import InputForm from './components/InputForm';
import OutputPanel from './components/OutputPanel';
import './index.css';


const API_URL = import.meta.env.PROD
  ? 'https://ai-copywright.vercel.app.vercel.app/api/generate'
  : '/api/generate';


export default function App() {
const [pending, setPending] = useState(false);
const [output, setOutput] = useState('');
const [lastParams, setLastParams] = useState(null);


async function callAPI(params) {
setPending(true);
try {
const res = await fetch(API_URL, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(params),
});
const data = await res.json();
if (!res.ok) throw new Error(data?.error || 'Request failed');
setOutput(data.result || '');
setLastParams(params);
// (Optional) Save last 5 results to localStorage
const history = JSON.parse(localStorage.getItem('copy_history') || '[]');
history.unshift({ ts: Date.now(), params, text: data.result });
localStorage.setItem('copy_history', JSON.stringify(history.slice(0, 5)));
} catch (err) {
setOutput(`Error: ${err.message}`);
} finally {
setPending(false);
}
}


return (
<div className="container">
<header>
<h1>AI Copy / Blog Generator</h1>
<p>Generate intros, product descriptions, ad copy, and social captions.</p>
</header>


<InputForm onSubmit={callAPI} pending={pending} />
<OutputPanel text={output} onAction={callAPI} pending={pending} lastParams={lastParams} />


<footer>
<small>Token-safe demo • Output capped ~400 tokens • Origin-locked</small>
</footer>
</div>
);
}
