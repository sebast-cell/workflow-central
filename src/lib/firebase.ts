/**
 * Este archivo actúa como un alias o punto de entrada principal para la configuración
 * del cliente de Firebase.
 *
 * Simplemente re-exporta todo desde 'firebase-client.ts' para satisfacer
 * las importaciones que buscan este módulo, como las del proceso de build de Vercel.
 */
export * from './firebase-client';
