const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');

// simple in-memory store for captcha answers (id -> text). TTL applied.
const store = new Map();
const TTL = 1000 * 60 * 5; // 5 minutes

function saveCaptcha(id, text) {
  store.set(id, { text, created: Date.now() });
}

function verifyCaptcha(id, text) {
  const entry = store.get(id);
  if (!entry) return false;
  if (Date.now() - entry.created > TTL) { store.delete(id); return false; }
  const ok = entry.text.toLowerCase() === String(text || '').toLowerCase();
  store.delete(id);
  return ok;
}

// cleanup old captchas periodically
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (now - v.created > TTL) store.delete(k);
  }
}, 60 * 1000);

router.get('/', (req, res) => {
  const captcha = svgCaptcha.create({ size: 5, noise: 2, color: true });
  const id = `${Date.now()}-${Math.round(Math.random()*1e9)}`;
  saveCaptcha(id, captcha.text);
  res.json({ id, svg: captcha.data });
});

// expose verify util (for internal use) via module exports
router.post('/verify', (req, res) => {
  const { id, text } = req.body;
  const ok = verifyCaptcha(id, text);
  res.json({ ok });
});

module.exports = { router, verifyCaptcha };
