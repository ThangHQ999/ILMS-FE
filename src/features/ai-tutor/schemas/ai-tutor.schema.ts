import { z } from 'zod';

export const chatMessageSchema = z.object({
  id: z.string(),
  sender: z.enum(['user', 'ai']),
  content: z.string(),
  timestamp: z.string(),
  codeSnippet: z
    .object({
      filename: z.string(),
      language: z.string(),
      code: z.string(),
    })
    .optional(),
  complexityTable: z
    .object({
      headers: z.array(z.string()),
      rows: z.array(
        z.object({
          caseName: z.string(),
          time: z.string(),
          space: z.string(),
          condition: z.string(),
          isWorst: z.boolean().optional(),
        })
      ),
    })
    .optional(),
  socraticQuestion: z.string().optional(),
  isStreaming: z.boolean().optional(),
});

export const chatSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  group: z.enum(['today', 'past7days']),
  subjectId: z.string().optional(),
  messages: z.array(chatMessageSchema),
});

export const sendMessageInputSchema = z.object({
  sessionId: z.string(),
  prompt: z.string().min(1, 'Prompt is required'),
  subjectId: z.string().optional(),
});
