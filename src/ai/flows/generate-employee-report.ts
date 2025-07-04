// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview Un flujo para generar informes personalizables sobre datos de empleados usando IA.
 *
 * - generateEmployeeReport - Una función que genera el informe del empleado.
 * - GenerateEmployeeReportInput - El tipo de entrada para la función generateEmployeeReport.
 * - GenerateEmployeeReportOutput - El tipo de retorno para la función generateEmployeeReport.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmployeeReportInputSchema = z.object({
  reportType: z
    .string()
    .describe(
      'El tipo de informe a generar (asistencia, ausencias, costos de proyecto, etc.)'
    ),
  informationDetails: z
    .string()
    .describe('Información específica para incluir en el informe.'),
  dateRange: z.string().describe('El rango de fechas para el informe (ej., último mes, T1 2024).'),
  timeRange: z.string().describe('El rango de tiempo para el informe.'),
  format: z
    .string()
    .describe('El formato deseado para el informe (PDF, Excel, CSV).'),
});
export type GenerateEmployeeReportInput = z.infer<typeof GenerateEmployeeReportInputSchema>;

const GenerateEmployeeReportOutputSchema = z.object({
  report: z.string().describe('El informe del empleado generado en el formato especificado.'),
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
  prompt: `Eres un asistente de IA especializado en generar informes basados en datos de empleados.

  Basado en los criterios proporcionados, genera un informe completo y bien formateado.

  Tipo de Informe: {{{reportType}}}
  Detalles de Información: {{{informationDetails}}}
  Rango de Fechas: {{{dateRange}}}
  Rango de Tiempo: {{{timeRange}}}
  Formato: {{{format}}}

  Asegúrate de que el informe sea preciso, revelador y fácil de entender para que los administradores tomen decisiones basadas en datos.`,
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
