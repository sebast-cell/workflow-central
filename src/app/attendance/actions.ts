'use server';

import { generateEmployeeReport, GenerateEmployeeReportInput } from '@/ai/flows/generate-employee-report';

const initialState = {
  report: null,
  error: null,
  success: false,
};


export async function generateAttendanceReportAction(
    prevState: any,
    formData: FormData
) {
    // If the form is empty (e.g., on initial render or reset), return initial state.
    if (!formData.get('dateRange')) {
      return initialState;
    }

    const data: GenerateEmployeeReportInput = {
        reportType: 'Asistencia',
        informationDetails: formData.get('informationDetails') as string,
        dateRange: formData.get('dateRange') as string,
        timeRange: 'Todo el día', // Defaulting this for simplicity in this context
        format: formData.get('format') as string,
    };
    
    try {
        const result = await generateEmployeeReport(data);
        return { success: true, report: result.report, error: null };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
        return { success: false, report: null, error: `No se pudo generar el informe: ${errorMessage}` };
    }
}
