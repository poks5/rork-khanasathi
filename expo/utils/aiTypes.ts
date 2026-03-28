export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; image: string };

export type CoreMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string | ContentPart[] }
  | { role: 'assistant'; content: string | ContentPart[] };
