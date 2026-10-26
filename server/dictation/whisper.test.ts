import { describe, expect, it } from 'vitest';
import { findWhisper, parseWhisperJson, whisperArgs } from './whisper';

describe('Whisper local', () => {
  it('lê texto e idioma do JSON do whisper-cli, sem marcas de silêncio', () => {
    const raw = JSON.stringify({ result: { language: 'pt' }, transcription: [{ text: ' Crie um agente' }, { text: ' para o relatório. [BLANK_AUDIO]' }] });
    expect(parseWhisperJson(raw)).toEqual({ text: 'Crie um agente para o relatório.', lang: 'pt' });
    expect(parseWhisperJson('{}')).toEqual({ text: '', lang: '' });
  });

  it('acha binários e o melhor modelo multilíngue (nunca um .en)', () => {
    const have = new Set(['/opt/homebrew/bin/whisper-cli', '/opt/homebrew/bin/ffmpeg', '/h/.whisper/ggml-base.en.bin', '/h/.local/share/whisper/ggml-base.bin', '/h/.local/share/whisper/ggml-small.bin']);
    const setup = findWhisper({ HOME: '/h', PATH: '' }, (p) => have.has(p));
    expect(setup).toEqual({ bin: '/opt/homebrew/bin/whisper-cli', ffmpeg: '/opt/homebrew/bin/ffmpeg', model: '/h/.local/share/whisper/ggml-small.bin', langs: ['pt', 'en'] });
    have.delete('/h/.local/share/whisper/ggml-small.bin');
    have.delete('/h/.local/share/whisper/ggml-base.bin');
    expect(findWhisper({ HOME: '/h', PATH: '' }, (p) => have.has(p))).toHaveProperty('missing');
    expect(findWhisper({ HOME: '/h', PATH: '' }, () => false)).toEqual({ missing: 'whisper-cli (brew install whisper-cpp)' });
    expect(findWhisper({ HOME: '/h', PATH: '', HABBLAUD_DICTATION_LANGS: 'en, pt, xx-bad' }, () => true)).toMatchObject({ langs: ['en', 'pt'] });
  });
});

describe('prompt do ditado', () => {
  const base = { bin: 'w', ffmpeg: 'f', model: 'm.bin', langs: ['zh', 'en'] };

  it('sem HABBLAUD_DICTATION_PROMPT, os argumentos ficam como sempre', () => {
    expect(findWhisper({ HOME: '/h', PATH: '' }, () => true)).not.toHaveProperty('prompt');
    expect(whisperArgs(base, 'auto', 'a.wav', 'o')).toEqual(['-m', 'm.bin', '-l', 'auto', '-f', 'a.wav', '-nt', '-np', '-oj', '-of', 'o']);
  });

  it('com o prompt, o Whisper o recebe: sem ele, o chinês sai em caracteres simplificados mesmo para quem fala de Taiwan', () => {
    const setup = findWhisper({ HOME: '/h', PATH: '', HABBLAUD_DICTATION_PROMPT: '  請使用繁體字。 ' }, () => true);
    expect(setup).toMatchObject({ prompt: '請使用繁體字。' });
    expect(whisperArgs({ ...base, prompt: '請使用繁體字。' }, 'auto', 'a.wav', 'o')).toEqual([
      '-m', 'm.bin', '-l', 'auto', '--prompt', '請使用繁體字。', '-f', 'a.wav', '-nt', '-np', '-oj', '-of', 'o',
    ]);
  });
});
