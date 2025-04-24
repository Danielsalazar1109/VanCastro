"use client";

import { useState, useEffect } from "react";

interface EmailVerificationProps {
	email: string;
	onVerified: () => void;
}

export default function EmailVerification({ email, onVerified }: EmailVerificationProps) {
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [countdown, setCountdown] = useState(300); // 5 minutos en segundos
	const [resendDisabled, setResendDisabled] = useState(true);

	useEffect(() => {
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
	}, []);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
	};

	const handleResendCode = async () => {
		setLoading(true);
		setError("");
		setResendDisabled(true);

		try {
			const response = await fetch("/api/auth/request-verification", {
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/auth/verify-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, code }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Error al verificar el código");
			}

			// Notificar que la verificación fue exitosa
			onVerified();
		} catch (error) {
			console.error("Verification error:", error);
			setError(error instanceof Error ? error.message : "Error al verificar el código");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md w-full space-y-8">
			<div>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Verifica tu correo electrónico
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Hemos enviado un código de verificación a {email}
				</p>
			</div>

			<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

				{error && <div className="text-red-500 text-sm">{error}</div>}

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

				<button
					type="submit"
					disabled={loading || code.length !== 6}
					className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-dark bg-brand-yellow hover:bg-brand-yellow-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow disabled:bg-gray-300"
				>
					{loading ? "Verificando..." : "Verificar"}
				</button>
			</form>
		</div>
	);
}
