
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige permanentemente a la página de inicio de sesión.
  // El middleware se encargará de redirigir a los usuarios que ya han iniciado sesión.
  redirect('/login');
}
