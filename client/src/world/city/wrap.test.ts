import { describe, expect, it } from 'vitest';
import { wrapLines } from './wrap';

// Um caractere = 1 de largura: basta para conferir onde a linha quebra.
const measure = (s: string) => [...s].length;

describe('wrapLines', () => {
  it('em línguas com espaço quebra só entre palavras, como antes', () => {
    expect(wrapLines('A meta aparece com 10 prédios', 12, measure)).toEqual(['A meta', 'aparece com', '10 prédios']);
  });

  it('em chinês, sem espaços, quebra entre caracteres em vez de deixar a frase toda numa linha cortada', () => {
    expect(wrapLines('點亮十棟大樓就會出現目標', 5, measure)).toEqual(['點亮十棟大', '樓就會出現', '目標']);
  });

  it('mistura chinês e palavras latinas sem partir a palavra latina', () => {
    expect(wrapLines('已用 Claude Code 工作', 8, measure)).toEqual(['已用', 'Claude', 'Code 工作']);
  });

  it('uma palavra maior que a linha fica inteira na sua própria linha', () => {
    expect(wrapLines('supercalifragilístico', 5, measure)).toEqual(['supercalifragilístico']);
  });
});
