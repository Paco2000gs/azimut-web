/**
 * Many posts were pasted with their title as the first line, so the title showed
 * twice on the article page: once in the hero and again at the top of the body.
 * Drop that first line when it repeats the title; leave everything else alone.
 */
const normalizeTitle = (text) =>
    text.replace(/<[^>]+>/g, '').replace(/^[#\s*]+/, '').replace(/[*_\s]+$/, '')
        .replace(/\s+/g, ' ').trim().toLowerCase();

export const stripLeadingTitle = (content, title) => {
    if (!content || !title) return content;
    const target = normalizeTitle(title);

    // HTML body: a leading <h1>-<h3> or <p> holding the title.
    const html = content.match(/^\s*<(h[1-3]|p)[^>]*>([\s\S]*?)<\/\1>\s*/i);
    if (html) return normalizeTitle(html[2]) === target ? content.slice(html[0].length) : content;

    // Plain text or markdown body: the first non-empty line.
    const lines = content.split(/\r?\n/);
    const first = lines.findIndex(l => l.trim() !== '');
    if (first === -1 || normalizeTitle(lines[first]) !== target) return content;
    return lines.slice(first + 1).join('\n');
};
