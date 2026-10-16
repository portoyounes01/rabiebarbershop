const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

test('approved home portraits are used for the hero and portfolio lead', () => {
  assert.match(html, /assets\/work\/hero-home-edit\.jpg/);
  assert.match(html, /assets\/work\/texture-home-edit\.jpg/);
  assert.ok(fs.existsSync(path.join(root, 'assets/work/hero-home-edit.jpg')));
  assert.ok(fs.existsSync(path.join(root, 'assets/work/texture-home-edit.jpg')));
});

test('motion controls are removed and animation is enabled regardless of system preference', () => {
  assert.doesNotMatch(html, /motion-toggle/);
  assert.match(app, /classList\.add\(['"]motion-enabled['"]\)/);
  assert.doesNotMatch(app, /rbs-motion|motionPaused|prefers-reduced-motion/);
});

test('the site clearly sells home visits and gathers location in the appointment request', () => {
  assert.match(html, /THE CUT/);
  assert.match(html, /COMES TO YOU/);
  assert.match(html, /home visit/i);
  assert.match(html, /area/i);
  assert.match(app, /home visit/i);
  assert.match(app, /area/i);
  assert.doesNotMatch(html, /Get in the chair|Let’s get you in the chair/);
});

test('the service location is all of Évora, Portugal', () => {
  assert.match(html, /Évora, Portugal/);
  assert.match(html, /all of Évora/i);
  assert.match(app, /Évora/);
  assert.doesNotMatch(html + app, /Luxembourg/i);
});
