import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { config } from '@/lib/config';
import { TranscriptSegment } from '@/types';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

const LANGUAGE_NAMES: Record<string, string> = {
  vi: 'Vietnamese',
  en: 'English',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ru: 'Russian',
  pt: 'Portuguese',
  th: 'Thai',
};

export async function translateTranscript(
  segments: TranscriptSegment[],
  sourceLang: string,
  targetLang: string,
  jobId: number
): Promise<TranscriptSegment[]> {
  if (sourceLang === targetLang) {
    return segments;
  }

  try {
    // Batch translate for efficiency (process in chunks of 20)
    const chunkSize = 20;
    const translatedSegments: TranscriptSegment[] = [];

    for (let i = 0; i < segments.length; i += chunkSize) {
      const chunk = segments.slice(i, i + chunkSize);
      const textToTranslate = chunk.map((seg, idx) => `[${i + idx + 1}] ${seg.text}`).join('\n');

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following subtitles from ${LANGUAGE_NAMES[sourceLang] || sourceLang} to ${LANGUAGE_NAMES[targetLang] || targetLang}. Keep the line numbers [N] intact. Maintain natural timing and phrasing for subtitles.`,
          },
          {
            role: 'user',
            content: textToTranslate,
          },
        ],
        temperature: 0.3,
      });

      const translatedText = response.choices[0]?.message?.content || '';
      const lines = translatedText.split('\n').filter(Boolean);

      lines.forEach((line) => {
        const match = line.match(/\[(\d+)\]\s*(.+)/);
        if (match) {
          const originalIndex = parseInt(match[1]) - 1;
          const translatedLine = match[2].trim();
          
          if (segments[originalIndex]) {
            translatedSegments.push({
              ...segments[originalIndex],
              text: translatedLine,
            });
          }
        }
      });
    }

    // Save translated transcript
    const jobDir = path.join(config.app.mediaDir, jobId.toString());
    const translatedPath = path.join(jobDir, `transcript_${targetLang}.json`);
    await fs.writeFile(translatedPath, JSON.stringify(translatedSegments, null, 2));

    return translatedSegments;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Failed to translate transcript: ${error}`);
  }
}

