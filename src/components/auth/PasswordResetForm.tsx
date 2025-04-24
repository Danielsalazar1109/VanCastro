"use client";

import { useState, useEffect, useRef } from "react";
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
	const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
	const [resendDisabled, setResendDisabled] = useState(true);
	const retryAttempted = useRef(false);

	// Start the countdown when we are in step 2
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

	// Step 1: Request recovery code
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
				throw new Error(data.message || "Error requesting the code");
			}

			// Move to the next step
			setStep(2);
			setCountdown(300);
			setResendDisabled(true);
			setSuccess("Code sent successfully. Please check your email.");
		} catch (error) {
			console.error("Error requesting code:", error);
			setError(error instanceof Error ? error.message : "Error requesting the code");
		} finally {
			setLoading(false);
		}
	};

	// Resend code
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
				throw new Error(data.message || "Error resending the code");
			}

			// Reset the counter
			setCountdown(300);
			setSuccess("Code resent successfully. Please check your email.");

			// Start the timer again
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
			setError(error instanceof Error ? error.message : "Error resending the code");
		} finally {
			setLoading(false);
		}
	};

	// Step 2: Verify code
	const handleVerifyCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			console.log(`Verifying code: ${code} for email: ${email}`);
			const response = await fetch("/api/auth/verify-reset-code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, code }),
			});

			const data = await response.json();
			console.log("Verification response:", data);

			if (!response.ok) {
				// If the first attempt fails, try requesting a new code automatically
				if (response.status === 400 && !retryAttempted.current) {
					console.log("First verification failed, requesting new code automatically");
					retryAttempted.current = true;

					// Request a new code
					await handleResendCode();

					// Show message to user
					setError("The previous code may have expired. A new code has been sent to your email.");
					setLoading(false);
					return;
				}

				throw new Error(data.message || "Invalid or expired code");
			}

			// Move to the next step
			setStep(3);
			setSuccess("Code verified successfully. Now you can set a new password.");
		} catch (error) {
			console.error("Error verifying code:", error);
			setError(error instanceof Error ? error.message : "Error verifying the code");
		} finally {
			setLoading(false);
		}
	};

	// Step 3: Set new password
	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		// Validate that passwords match
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			// Directly proceed to change the password
			// We no longer verify the OTP code in the backend
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
				throw new Error(data.message || "Error resetting the password");
			}

			setSuccess("Password reset successfully. Redirecting to login...");

			// Wait a moment before redirecting
			setTimeout(() => {
				if (onComplete) {
					onComplete();
				} else {
					router.push("/login?message=password-reset-success");
				}
			}, 2000);
		} catch (error) {
			console.error("Error resetting password:", error);
			setError(error instanceof Error ? error.message : "Error resetting the password");
		} finally {
			setLoading(false);
		}
	};

	// Render the corresponding step
	const renderStep = () => {
		switch (step) {
			case 1:
				return (
					<form className="mt-8 space-y-6" onSubmit={handleRequestCode}>
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">
								Email
							</label>
							<input
								id="email"
								type="email"
								placeholder="Enter your email"
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
							{loading ? "Sending..." : "Send code"}
						</button>

						<div className="text-center">
							<Link href="/login" className="text-sm text-brand-yellow hover:text-brand-yellow-hover">
								Back to login
							</Link>
						</div>
					</form>
				);

			case 2:
				return (
					<form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
						<div>
							<label htmlFor="code" className="block text-sm font-medium text-gray-700">
								Verification code
							</label>
							<input
								id="code"
								type="text"
								placeholder="Enter the 6-digit code"
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
								value={code}
								onChange={(e) => setCode(e.target.value)}
								maxLength={6}
								required
							/>
						</div>

						<div className="flex items-center justify-between">
							<p className="text-sm text-gray-600">Time remaining: {formatTime(countdown)}</p>
							<button
								type="button"
								disabled={resendDisabled || loading}
								onClick={handleResendCode}
								className="text-sm text-brand-yellow hover:text-brand-yellow-hover disabled:text-gray-400"
							>
								Resend code
							</button>
						</div>

						<div className="flex justify-between">
							<button
								type="button"
								onClick={() => setStep(1)}
								className="text-sm text-brand-yellow hover:text-brand-yellow-hover"
							>
								Back
							</button>

							<button
								type="submit"
								disabled={loading || code.length !== 6}
								className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-dark bg-brand-yellow hover:bg-brand-yellow-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow"
							>
								{loading ? "Verifying..." : "Verify code"}
							</button>
						</div>
					</form>
				);

			case 3:
				return (
					<form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
						<div>
							<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
								New password
							</label>
							<input
								id="newPassword"
								type="password"
								placeholder="Enter your new password"
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
							/>
						</div>

						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
								Confirm password
							</label>
							<input
								id="confirmPassword"
								type="password"
								placeholder="Confirm your new password"
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
						</div>

						{newPassword && confirmPassword && newPassword !== confirmPassword && (
							<div className="text-red-500 text-sm">Passwords do not match</div>
						)}

						<div className="flex justify-between">
							<button
								type="button"
								onClick={() => setStep(2)}
								className="text-sm text-brand-yellow hover:text-brand-yellow-hover"
							>
								Back
							</button>

							<button
								type="submit"
								disabled={
									loading || !newPassword || !confirmPassword || newPassword !== confirmPassword
								}
								className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-dark bg-brand-yellow hover:bg-brand-yellow-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow"
							>
								{loading ? "Saving..." : "Save new password"}
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
					{step === 1 && "Recover password"}
					{step === 2 && "Verify code"}
					{step === 3 && "New password"}
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					{step === 1 && "Enter your email to receive a verification code"}
					{step === 2 && `We have sent a code to ${email}`}
					{step === 3 && "Create a new password for your account"}
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
