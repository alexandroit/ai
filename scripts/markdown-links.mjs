// Package READMEs use explicit inline Markdown links. Ignore example code and
// comments so documentation checks require a rendered link, not a URL mention.
export function markdownLinkDestinations(markdown) {
  const lines = markdown.replace(/<!--[\s\S]*?(?:-->|$)/g, "\u0000").split(/\r?\n/);
  const destinations = [];
  let fence;

  for (const line of lines) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = undefined;
      continue;
    }
    if (fence || /^(?: {4}|\t)/.test(line)) continue;

    const prose = line.replace(/(`+).*?\1/g, "\u0000");
    for (const match of prose.matchAll(/(?<![!\\])\[[^\[\]\n]+\]\(\s*(?:<([^>\n]+)>|([^\s)]+))(?:\s+["'][^"'\n]*["'])?\s*\)/g)) {
      destinations.push(match[1] ?? match[2]);
    }
  }

  return destinations;
}
