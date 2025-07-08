'use server';
/**
 * @fileOverview An AI-powered attendance data summarizer.
 *
 * - summarizeAttendance - A function that handles the attendance summarization process.
 * - SummarizeAttendanceInput - The input type for the summarizeAttendance function.
 * - SummarizeAttendanceOutput - The return type for the summarizeAttendance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttendanceLogSchema = z.object({
  time: z.string().describe("The time of the event, e.g., '09:01 AM'"),
  employee: z.string().describe("The name of the employee."),
  status: z.string().describe("The status of the event, e.g., 'Entrada Marcada', 'Salida Marcada', 'En Descanso'"),
  location: z.string().describe("The location of the event, e.g., 'Oficina', 'Remoto'"),
});
export type AttendanceLog = z.infer<typeof AttendanceLogSchema>;

const SummarizeAttendanceInputSchema = z.array(AttendanceLogSchema);
export type SummarizeAttendanceInput = z.infer<typeof SummarizeAttendanceInputSchema>;

const SummarizeAttendanceOutputSchema = z.object({
  summary: z.string().describe("The generated summary of the attendance data, formatted as a professional HR report in plain text."),
});
export type SummarizeAttendanceOutput = z.infer<typeof SummarizeAttendanceOutputSchema>;

export async function summarizeAttendance(input: SummarizeAttendanceInput): Promise<SummarizeAttendanceOutput> {
  return summarizeAttendanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAttendancePrompt',
  input: {schema: SummarizeAttendanceInputSchema},
  output: {schema: SummarizeAttendanceOutputSchema},
  prompt: `You are an expert HR analyst. Analyze the following attendance log data and generate a concise, professional summary report in Spanish.

The report should include:
- A brief overview of the data provided.
- Key metrics like total number of employees present, total clock-ins ('Entrada Marcada'), total clock-outs ('Salida Marcada'), and total breaks ('En Descanso').
- Identify any notable patterns, trends, or outliers. For example: employees who consistently clock in late (after 9:05 AM) or early, unusual activity, or busiest/quietest times.
- Present the final output as a clean, easy-to-read plain text report. Do not add any conversational text, just the report itself. Structure it with clear headings.

Here is the attendance data to analyze:
{{#each .}}
- {{time}}, {{employee}}, {{status}}, {{location}}
{{/each}}

Generate the summary report now.`,
});

const summarizeAttendanceFlow = ai.defineFlow(
  {
    name: 'summarizeAttendanceFlow',
    inputSchema: SummarizeAttendanceInputSchema,
    outputSchema: SummarizeAttendanceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
