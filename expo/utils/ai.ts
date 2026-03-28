import { CoreMessage } from '@/utils/aiTypes';

export async function generateNutritionText(messages: CoreMessage[]): Promise<string> {
  try {
    const res = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('AI API error', text);
      throw new Error('Failed to generate text');
    }
    const data = (await res.json()) as { completion?: string };
    return data.completion ?? '';
  } catch (e) {
    console.error('generateNutritionText error', e);
    throw e;
  }
}
