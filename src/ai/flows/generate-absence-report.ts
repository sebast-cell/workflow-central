'use server';

/**
 * @fileOverview An AI agent for generating reports on employee absences.
 *
 * - generateAbsenceReport - A function that generates absence reports.
 * - GenerateAbsenceReportInput - The input type for the generateAbsenceReport function.
 * - GenerateAbsenceReportOutput - The return type for the generateAbsenceReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAbsenceReportInputSchema = z.object({
  query: z
    .string()
    .describe(
      'A natural language query requesting a report on employee absences. Example: "absences from the sales team in Q2"'
    ),
});
export type GenerateAbsenceReportInput = z.infer<typeof GenerateAbsenceReportInputSchema>;

const GenerateAbsenceReportOutputSchema = z.object({
  report: z.string().describe('A detailed report on employee absences based on the query.'),
});
export type GenerateAbsenceReportOutput = z.infer<typeof GenerateAbsenceReportOutputSchema>;

export async function generateAbsenceReport(input: GenerateAbsenceReportInput): Promise<GenerateAbsenceReportOutput> {
  return generateAbsenceReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAbsenceReportPrompt',
  input: {schema: GenerateAbsenceReportInputSchema},
  output: {schema: GenerateAbsenceReportOutputSchema},
  prompt: `You are an HR report generator. You will generate a report on employee absences based on the query provided.

Query: {{{query}}}`,
});

const generateAbsenceReportFlow = ai.defineFlow(
  {
    name: 'generateAbsenceReportFlow',
    inputSchema: GenerateAbsenceReportInputSchema,
    outputSchema: GenerateAbsenceReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
