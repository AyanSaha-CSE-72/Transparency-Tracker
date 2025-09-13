// Summarize all the reports that have been filed to identify key recurring patterns, and generate an accurate description that highlights common concerns and major issues.

'use server';

/**
 * @fileOverview Summarizes corruption reports by identifying recurring patterns and major issues.
 *
 * - summarizeReports - A function that generates a summary of the reports.
 * - SummarizeReportsInput - The input type for the summarizeReports function.
 * - SummarizeReportsOutput - The return type for the summarizeReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReportsInputSchema = z.object({
  reports: z
    .string()
    .describe("A list of reports, with each report containing fields such as 'division', 'district', 'category', 'description', and 'date'."),
});

export type SummarizeReportsInput = z.infer<typeof SummarizeReportsInputSchema>;

const SummarizeReportsOutputSchema = z.object({
  summary: z.string().describe('A summary of the reports, highlighting common concerns and major issues.'),
});

export type SummarizeReportsOutput = z.infer<typeof SummarizeReportsOutputSchema>;

export async function summarizeReports(input: SummarizeReportsInput): Promise<SummarizeReportsOutput> {
  return summarizeReportsFlow(input);
}

const summarizeReportsPrompt = ai.definePrompt({
  name: 'summarizeReportsPrompt',
  input: {schema: SummarizeReportsInputSchema},
  output: {schema: SummarizeReportsOutputSchema},
  prompt: `You are an expert analyst tasked with summarizing corruption reports to identify key trends and issues.

  Given the following reports, identify recurring patterns, common concerns, and major issues. Generate a concise and accurate summary that highlights these elements to provide an overview of the reported problems.

  Reports:
  {{reports}}

  IMPORTANT: Your response MUST be a valid JSON object, containing a single key "summary".
  For example:
  {
    "summary": "The reports indicate a recurring issue with electricity in the Manikganj and Panchagarh districts, as well as concerns about the quality of education in the Narsingdi district."
  }`,
});

const summarizeReportsFlow = ai.defineFlow(
  {
    name: 'summarizeReportsFlow',
    inputSchema: SummarizeReportsInputSchema,
    outputSchema: SummarizeReportsOutputSchema,
  },
  async input => {
    const {output} = await summarizeReportsPrompt(input);
    return output!;
  }
);
