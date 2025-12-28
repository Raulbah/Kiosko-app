"use client";

import { useActionState } from "react"; // Hook nuevo en React 19 / Next 15 (antes useFormState)
import { loginAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, null);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <Card className="w-full max-w-sm shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🔐</span>
                    </div>
                    <CardTitle className="text-2xl">Acceso Admin</CardTitle>
                    <CardDescription>Ingresa tu número de empleado</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        {state?.error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{state.error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">No. Empleado</Label>
                            <Input 
                                id="employeeId" 
                                name="employeeId" 
                                placeholder="Ej. 1045" 
                                required 
                                className="text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                required 
                                className="text-lg"
                            />
                        </div>
                        <Button type="submit" className="w-full text-lg h-11" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center justify-center text-xs text-muted-foreground">
                    Sistema de Gestión v1.0
                </CardFooter>
            </Card>
        </div>
    );
}