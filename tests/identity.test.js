import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeUsername, usernameEmail, accountName } from '../identity.js';
test('page script parses and login form has no email input', () => {
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(()=>new Function(script.replace(/^import .*;$/gm,'')));
  assert.doesNotMatch(html, /type="email"/);
  assert.doesNotMatch(script, /sendPasswordResetEmail/);
  assert.doesNotMatch(html, /resetPasswordButton/);
  assert.doesNotMatch(script, /localStorage\s*\./);
});
test('case and surrounding whitespace resolve to one identity', () => {
  assert.equal(usernameEmail('  Alice_123 '), usernameEmail('alice_123'));
  assert.equal(normalizeUsername('ABC'), 'abc');
});
test('reject email injection, unicode lookalikes and invalid lengths', () => {
  for (const name of ['', 'ab', 'a'.repeat(33), 'alice@example.com', 'alice+other', 'аlice', 'a b', 'a\nb']) {
    assert.throws(() => usernameEmail(name));
  }
});
test('distinct valid usernames cannot collide', () => {
  assert.notEqual(usernameEmail('alice'), usernameEmail('alice_'));
  assert.equal(accountName({email: usernameEmail('Alice')}), 'alice');
  assert.equal(accountName({email: 'legacy@example.com'}), 'บัญชีเดิม');
});
