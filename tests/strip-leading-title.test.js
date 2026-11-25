import { test } from 'node:test';
import assert from 'node:assert/strict';



import { stripLeadingTitle } from '../src/utils/stripLeadingTitle.js';

const title = 'Why Investors Are Buying in Jimena de la Frontera in 2026';

test('drops a plain first line equal to the title', () => {
    assert.equal(stripLeadingTitle(`${title}\n\nFirst paragraph.`, title).trim(), 'First paragraph.');
});

test('drops a markdown heading equal to the title', () => {
    assert.equal(stripLeadingTitle(`# ${title}\nBody`, title).trim(), 'Body');
});

test('drops a leading HTML heading equal to the title', () => {
    assert.equal(stripLeadingTitle(`<h2>${title}</h2><p>Body</p>`, title), '<p>Body</p>');
});

test('keeps content whose first line is different', () => {
    const body = 'A new Gibraltar treaty is pulling capital inland.\nMore.';
    assert.equal(stripLeadingTitle(body, title), body);
});
