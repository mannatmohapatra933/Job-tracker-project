require('dotenv').config();
const key = process.env.REACT_APP_GEMINI_API_KEY;
const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + key;
fetch(url, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    contents: [{parts: [{text: 'Return a dummy JSON like {"summary":"hi"}'}]}]
  })
}).then(r=>r.json()).then(d=>console.log(d.candidates[0].content.parts.map(p => Object.keys(p) + ": " + (p.text ? p.text.substring(0, 50) : ""))));
