// src/components/auth/login-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import axios from "axios";
import { getFirebaseAuth } from "@/lib/firebase";
import { signInWithEmailAndPassword, Auth } from "firebase/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  useEffect(() => {
    // Intenta inicializar Firebase Auth
    try {
      const auth = getFirebaseAuth();
      setAuthInstance(auth);
    } catch (e: any) {
      console.error("❌ No se pudo inicializar Firebase Auth:", e);
      setError("No se pudieron cargar los servicios de autenticación.");
    } finally {
      setIsFirebaseLoading(false);
    }

    // Recupera el rol desde la query (si existe)
    const roleFromQuery = searchParams.get("role");
    if (roleFromQuery && ["admin", "employee"].includes(roleFromQuery)) {
      setRole(roleFromQuery);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authInstance) {
      setError("El servicio de autenticación no está listo. Revisa la configuración.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 🔑 Iniciar sesión con Firebase
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Llamar a la API backend
      const response = await axios.post("/api/auth/login", { idToken });
      const { employee } = response.data;

      login(employee);

      if (employee.role === "Owner" || employee.role === "Admin") {
        router.push("/dashboard");
      } else {
        router.push("/portal");
      }
    } catch (err: any) {
      let errorMessage = "Credenciales inválidas o error del servidor.";
      if (err.code) {
        switch (err.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            errorMessage = "El correo electrónico o la contraseña son incorrectos.";
            break;
          case "auth/invalid-email":
            errorMessage = "El formato del correo electrónico no es válido.";
            break;
          default:
            errorMessage = "Ocurrió un error inesperado al iniciar sesión.";
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 👉 Ahora los campos nunca estarán deshabilitados por authInstance
  const isSubmitDisabled = isLoading || isFirebaseLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error de Inicio de Sesión</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          // 👇 Ya no depende de authInstance
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          // 👇 Ya no depende de authInstance
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
        {isLoading || isFirebaseLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isLoading
          ? "Iniciando sesión..."
          : isFirebaseLoading
          ? "Cargando..."
          : "Iniciar Sesión"}
      </Button>
    </form>
  );
}
