// Quebra de linha dos textos desenhados no canvas: entre palavras e, em chinês/japonês (que não usam espaços), entre
// quaisquer dois caracteres. A largura vem de quem chama (ctx.measureText), então a função é pura.
const WRAP_PIECES = /[⺀-鿿豈-﫿＀-￯]|[^\s⺀-鿿豈-﫿＀-￯]+|\s+/g;

export function wrapLines(text: string, maxW: number, measure: (s: string) => number): string[] {
  const out: string[] = [];
  let cur = '';
  for (const piece of text.match(WRAP_PIECES) ?? []) {
    const next = cur + piece;
    if (measure(next.trimEnd()) <= maxW || !cur.trim()) cur = next;
    else {
      out.push(cur.trimEnd());
      cur = piece.trimStart();
    }
  }
  if (cur.trim()) out.push(cur.trimEnd());
  return out;
}
