'use server';
/**
 * @fileOverview An AI-powered employee report generator.
 *
 * - generateEmployeeReport - A function that handles the report generation process.
 * - GenerateEmployeeReportInput - The input type for the generateEmployeeReport function.
 * - GenerateEmployeeReportOutput - The return type for the generateEmployeeReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateEmployeeReportInputSchema = z.object({
  reportType: z.string().describe("The type of report to generate (e.g., Asistencia, Ausencias y Tiempo Libre, Costos de Proyecto)."),
  informationDetails: z.string().describe("Specific details or filters to include in the report (e.g., include overtime, filter by Engineering department)."),
  dateRange: z.string().describe("The date range for the report (e.g., Last Month, Q3 2024, Last 30 days)."),
  timeRange: z.string().describe("The time range for the report (e.g., 9am-5pm, all day)."),
  format: z.string().describe("The desired output format for the report (e.g., PDF, Excel, CSV)."),
});
export type GenerateEmployeeReportInput = z.infer<typeof GenerateEmployeeReportInputSchema>;

export const GenerateEmployeeReportOutputSchema = z.object({
  report: z.string().describe("The generated report content as a string, formatted as plain text, regardless of the requested final format. The text should resemble the requested format."),
});
export type GenerateEmployeeReportOutput = z.infer<typeof GenerateEmployeeReportOutputSchema>;

export async function generateEmployeeReport(input: GenerateEmployeeReportInput): Promise<GenerateEmployeeReportOutput> {
  return generateEmployeeReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmployeeReportPrompt',
  input: {schema: GenerateEmployeeReportInputSchema},
  output: {schema: GenerateEmployeeReportOutputSchema},
  prompt: `You are an expert HR analyst. Your task is to generate a professional employee report based on the following criteria.

Generate a report of type: "{{reportType}}".
Covering the date range: "{{dateRange}}" and time range: "{{timeRange}}".
Include the following specific details: "{{informationDetails}}".
The final intended format is {{format}}, but you should generate a plain text representation of the report content.

For example, if the format is Excel or CSV, you should generate comma-separated values. If it's a PDF, generate a well-structured text document.

Based on the criteria, here is a plausible mock report. Do not state that it is mock data.

Generate the report now.`,
});

const generateEmployeeReportFlow = ai.defineFlow(
  {
    name: 'generateEmployeeReportFlow',
    inputSchema: GenerateEmployeeReportInputSchema,
    outputSchema: GenerateEmployeeReportOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
