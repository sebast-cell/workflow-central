import 'server-only'; // Marca este módulo como de solo servidor
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

// Asegúrate de que JWT_SECRET esté definido en tu .env.local
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno');
}
const key = new TextEncoder().encode(secretKey);

// Función para encriptar datos en un token JWT
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // El token expira en 1 hora
    .sign(key);
}

// Función para desencriptar un token JWT y obtener los datos
export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('Fallo al verificar el token:', error);
    return null;
  }
}

// Función para crear una cookie de sesión
export async function createSession(sessionData: any) {
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora desde ahora
  const session = await encrypt({ ...sessionData, expires });

  // CORRECCIÓN: Usar 'await' antes de cookies()
  await cookies().set('session', session, { expires, httpOnly: true, secure: true, path: '/' });
}

// Función para obtener los datos de la sesión actual
export async function getSession() {
  // CORRECCIÓN: Usar 'await' antes de cookies()
  const cookie = await cookies().get('session')?.value;
  if (!cookie) return null;
  return await decrypt(cookie);
}

// Función para borrar la cookie de sesión
export async function deleteSession() {
  // CORRECCIÓN: Usar 'await' antes de cookies()
  await cookies().delete('session');
}
