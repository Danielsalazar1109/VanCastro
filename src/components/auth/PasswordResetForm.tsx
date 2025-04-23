"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PasswordResetFormProps {
	onComplete?: () => void;
}

export default function PasswordResetForm({ onComplete }: PasswordResetFormProps) {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const [countdown, setCountdown] = useState(300); // 5 minutos en segundos
	const [resendDisabled, setResendDisabled] = useState(true);

	// Iniciar el contador cuando estamos en el paso 2
	useEffect(() => {
		if (step === 2) {
			const timer = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						setResendDisabled(false);
						clearInterval(timer);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => clearInterval(timer);
		}
	}, [step]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
	};

	// Paso 1: Solicitar código de recuperación
	const handleRequestCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Error al solicitar el código");
			}

			// Avanzar al siguiente paso
			setStep(2);
			setCountdown(300);
			setResendDisabled(true);
			setSuccess("Código enviado correctamente. Por favor revisa tu correo electrónico.");
		} catch (error) {
			console.error("Error requesting code:", error);
			setError(error instanceof Error ? error.message : "Error al solicitar el código");
		} finally {
			setLoading(false);
		}
	};

	// Reenviar código
	const handleResendCode = async () => {
		setLoading(true);
		setError("");
		setSuccess("");
		setResendDisabled(true);

		try {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Error al reenviar el código");
			}

			// Reiniciar el contador
			setCountdown(300);
			setSuccess("Código reenviado correctamente. Por favor revisa tu correo electrónico.");

			// Iniciar el temporizador nuevamente
			const timer = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						setResendDisabled(false);
						clearInterval(timer);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} catch (error) {
			console.error("Error resending code:", error);
			setError(error instanceof Error ? error.message : "Error al reenviar el código");
		} finally {
			setLoading(false);
		}
	};

	// Paso 2: Verificar código
	const handleVerifyCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const response = await fetch("/api/auth/verify-reset-code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, code }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Código inválido o expirado");
			}

			// Avanzar al siguiente paso
			setStep(3);
			setSuccess("Código verificado correctamente. Ahora puedes establecer una nueva contraseña.");
		} catch (error) {
			console.error("Error verifying code:", error);
			setError(error instanceof Error ? error.message : "Error al verificar el código");
		} finally {
			setLoading(false);
		}
	};

	// Paso 3: Establecer nueva contraseña
	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		// Validar que las contraseñas coincidan
		if (newPassword !== confirmPassword) {
			setError("Las contraseñas no coinciden");
			setLoading(false);
			return;
		}

		try {
			// Directamente procedemos a cambiar la contraseña
			// Ya no verificamos el código OTP en el backend
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					code,
					newPassword,
					confirmPassword,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Error al restablecer la contraseña");
			}

			setSuccess("Contraseña restablecida correctamente. Redirigiendo al inicio de sesión...");

			// Esperar un momento antes de redirigir
			setTimeout(() => {
				if (onComplete) {
					onComplete();
				} else {
					router.push("/login?message=password-reset-success");
				}
			}, 2000);
		} catch (error) {
			console.error("Error resetting password:", error);
			setError(error instanceof Error ? error.message : "Error al restablecer la contraseña");
		} finally {
			setLoading(false);
		}
	};

	// Renderizar el paso correspondiente
	const renderStep = () => {
		switch (step) {
			case 1:
				return (
					<form className="mt-8 space-y-6" onSubmit={handleRequestCode}>
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">
								Correo electrónico
							</label>
							<input
								id="email"
								type="email"
								placeholder="Ingresa tu correo electrónico"
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-dark bg-brand-yellow hover:bg-brand-yellow-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow"
						>
							{loading ? "Enviando..." : "Enviar código"}
						</button>

						<div className="text-center">
							<Link href="/login" className="text-sm text-brand-yellow hover:text-brand-yellow-hover">
								Volver al inicio de sesión
							</Link>
						</div>
					</form>
				);

			case 2:
				return (
					<form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
						<div>
							<label htmlFor="code" className="block text-sm font-medium text-gray-700">
								Código de verificación
							</label>
							<input
								id="code"
								type="text"
								placeholder="Ingresa el código de 6 dígitos"
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
								value={code}
								onChange={(e) => setCode(e.target.value)}
								maxLength={6}
								required
							/>
						</div>

						<div className="flex items-center justify-between">
							<p className="text-sm text-gray-600">Tiempo restante: {formatTime(countdown)}</p>
							<button
								type="button"
								disabled={resendDisabled || loading}
								onClick={handleResendCode}
								className="text-sm text-brand-yellow hover:text-brand-yellow-hover disabled:text-gray-400"
							>
								Reenviar código
							</button>
						</div>

						<div className="flex justify-between">
							<button
								type="button"
								onClick={() => setStep(1)}
								className="text-sm text-brand-yellow hover:text-brand-yellow-hover"
							>
								Volver
							</button>

							<button
								type="submit"
								disabled={loading || code.length !== 6}
								className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-dark bg-brand-yellow hover:bg-brand-yellow-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow"
							>
								{loading ? "Verificando..." : "Verificar código"}
							</button>
						</div>
					</form>
				);

			case 3:
				return (
					<form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
						<div>
							<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
								Nueva contraseña
							</label>
							<input
								id="newPassword"
								type="password"
								placeholder="Ingresa tu nueva contraseña"
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
							/>
						</div>

						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
								Confirmar contraseña
							</label>
							<input
								id="confirmPassword"
								type="password"
								placeholder="Confirma tu nueva contraseña"
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
						</div>

						{newPassword && confirmPassword && newPassword !== confirmPassword && (
							<div className="text-red-500 text-sm">Las contraseñas no coinciden</div>
						)}

						<div className="flex justify-between">
							<button
								type="button"
								onClick={() => setStep(2)}
								className="text-sm text-brand-yellow hover:text-brand-yellow-hover"
							>
								Volver
							</button>

							<button
								type="submit"
								disabled={
									loading || !newPassword || !confirmPassword || newPassword !== confirmPassword
								}
								className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-dark bg-brand-yellow hover:bg-brand-yellow-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow"
							>
								{loading ? "Guardando..." : "Guardar nueva contraseña"}
							</button>
						</div>
					</form>
				);

			default:
				return null;
		}
	};

	return (
		<div className="max-w-md w-full space-y-8">
			<div>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					{step === 1 && "Recuperar contraseña"}
					{step === 2 && "Verificar código"}
					{step === 3 && "Nueva contraseña"}
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					{step === 1 && "Ingresa tu correo electrónico para recibir un código de verificación"}
					{step === 2 && `Hemos enviado un código a ${email}`}
					{step === 3 && "Crea una nueva contraseña para tu cuenta"}
				</p>
			</div>

			{error && (
				<div className="text-red-500 text-sm text-center p-3 bg-red-50 border border-red-200 rounded-md">
					{error}
				</div>
			)}

			{success && (
				<div className="text-green-500 text-sm text-center p-3 bg-green-50 border border-green-200 rounded-md">
					{success}
				</div>
			)}

			{renderStep()}
		</div>
	);
}
