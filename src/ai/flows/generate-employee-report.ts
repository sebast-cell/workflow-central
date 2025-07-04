// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview A flow for generating customizable reports on employee data using AI.
 *
 * - generateEmployeeReport - A function that generates the employee report.
 * - GenerateEmployeeReportInput - The input type for the generateEmployeeReport function.
 * - GenerateEmployeeReportOutput - The return type for the generateEmployeeReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmployeeReportInputSchema = z.object({
  reportType: z
    .string()
    .describe(
      'The type of report to generate (attendance, absences, project costs, etc.)'
    ),
  informationDetails: z
    .string()
    .describe('Specific information to include in the report.'),
  dateRange: z.string().describe('The date range for the report (e.g., last month, Q1 2024).'),
  timeRange: z.string().describe('The time range for the report.'),
  format: z
    .string()
    .describe('The desired format for the report (PDF, Excel, CSV).'),
});
export type GenerateEmployeeReportInput = z.infer<typeof GenerateEmployeeReportInputSchema>;

const GenerateEmployeeReportOutputSchema = z.object({
  report: z.string().describe('The generated employee report in the specified format.'),
});
export type GenerateEmployeeReportOutput = z.infer<typeof GenerateEmployeeReportOutputSchema>;

export async function generateEmployeeReport(
  input: GenerateEmployeeReportInput
): Promise<GenerateEmployeeReportOutput> {
  return generateEmployeeReportFlow(input);
}

const generateEmployeeReportPrompt = ai.definePrompt({
  name: 'generateEmployeeReportPrompt',
  input: {schema: GenerateEmployeeReportInputSchema},
  output: {schema: GenerateEmployeeReportOutputSchema},
  prompt: `You are an AI assistant specialized in generating reports based on employee data.

  Based on the provided criteria, generate a comprehensive and well-formatted report.

  Report Type: {{{reportType}}}
  Information Details: {{{informationDetails}}}
  Date Range: {{{dateRange}}}
  Time Range: {{{timeRange}}}
  Format: {{{format}}}

  Ensure the report is accurate, insightful, and easy to understand for administrators to make data-driven decisions.`,
});

const generateEmployeeReportFlow = ai.defineFlow(
  {
    name: 'generateEmployeeReportFlow',
    inputSchema: GenerateEmployeeReportInputSchema,
    outputSchema: GenerateEmployeeReportOutputSchema,
  },
  async input => {
    const {output} = await generateEmployeeReportPrompt(input);
    return output!;
  }
);
