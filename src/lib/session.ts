import 'server-only';
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
