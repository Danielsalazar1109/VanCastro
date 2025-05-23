"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Client component that uses useSearchParams
function LoginPageContent() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/login";
	const errorParam = searchParams.get("error");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [autoSubmitted, setAutoSubmitted] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [redirected, setRedirected] = useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	// We're removing the automatic redirection for authenticated users
	// The middleware will handle redirecting authenticated users from the login page
	// This helps prevent redirection loops

	// Handle error parameter from URL
	useEffect(() => {
		if (errorParam) {
			console.log("Error parameter detected:", errorParam);

			switch (errorParam) {
				case "AccessDenied":
					setError("Access denied. You don't have permission to access that page.");
					break;
				case "CredentialsSignin":
					setError("Invalid email or password.");
					break;
				case "google":
					console.log("Google authentication error detected");
					// For Google auth errors, we'll try to recover by initiating a new sign-in
					// But first, let's check if we already have a session
					fetch("/api/auth/session")
						.then((res) => res.json())
						.then((session) => {
							console.log("Session check after Google error:", session);
							if (session?.user) {
								// If we have a session despite the error, let the middleware handle redirection
								console.log("Session found despite error, refreshing page to trigger middleware");
								window.location.reload();
							} else {
								// Show error but don't auto-retry to avoid potential loops
								setError("Google sign-in failed. Please try again using the button below.");
							}
						})
						.catch((err) => {
							console.error("Error checking session after Google auth error:", err);
							setError("Google sign-in failed. Please try again using the button below.");
						});
					break;
				default:
					console.log("Unknown error type:", errorParam);
					setError("An error occurred. Please try again.");
			}
		}
	}, [errorParam]);

	// We're simplifying the Google auth redirect handling
	// The middleware will handle redirecting authenticated users appropriately

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				// Check if the error is due to exceeding the login attempt limit
				if (result.error.includes("LIMIT_EXCEEDED:")) {
					// Extract the reset date from the error message
					const resetDate = result.error.split("LIMIT_EXCEEDED:")[1];
					setError(
						`You have exceeded the limit of 5 login attempts per day. Your attempts will reset tomorrow (${resetDate}).`
					);
					console.log("Rate limit error detected:", result.error);
				} else {
					setError("Invalid email or password");
					console.log("Login error:", result.error);
				}
				setLoading(false);
				return;
			}

			// After successful login, directly redirect to the appropriate dashboard
			console.log("Login successful, redirecting based on role");
			// Add a small delay to ensure the session is fully updated
			setTimeout(async () => {
				try {
					// Get the updated session to check the user role
					const updatedResponse = await fetch("/api/auth/session");
					const updatedSession = await updatedResponse.json();
					console.log("Updated session after login:", updatedSession);
					// Use the updated session for redirection
					if (!updatedSession?.user) {
						console.error("No user in updated session");
						setError("Failed to get user information. Please try again.");
						setLoading(false);
						return;
					}
					// Check if user has a phone number
					if (!updatedSession.user.phone || updatedSession.user.phone === "") {
						console.log("User doesn't have a phone number, redirecting to complete profile page");
						window.location.replace("/complete-profile");
						return;
					}

					// Redirect based on user role
					const userRole = updatedSession.user.role;
					console.log("User role from updated session:", userRole);

					if (userRole === "user") {
						console.log("User is a student, redirecting to student page");
						window.location.replace("/student");
					} else if (userRole === "instructor") {
						console.log("User is an instructor, redirecting to instructor page");
						window.location.replace("/instructor");
					} else if (userRole === "admin") {
						console.log("User is an admin, redirecting to admin page");
						window.location.replace("/admin");
					} else {
						// Fallback to the callback URL or home page
						console.log("User role not recognized, redirecting to home page");
						window.location.replace(callbackUrl !== "/login" ? callbackUrl : "/");
					}
				} catch (error) {
					console.error("Error getting updated session:", error);
					setError("An error occurred while redirecting. Please try again.");
					setLoading(false);
				}
			}, 500); // 500ms delay
		} catch (error) {
			console.error("Login error:", error);
			setError("An unexpected error occurred. Please try again.");
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Enter your credentials to access your account
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
								placeholder="Email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								autoFocus
							/>
						</div>
						<div className="mt-6">
							<label htmlFor="password" className="block text-sm font-medium text-gray-700">
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									required
									className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow placeholder-gray-500"
									placeholder="Password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
								<button
									type="button"
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
									onClick={togglePasswordVisibility}
									tabIndex={-1}
								>
									{showPassword ? (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
												clipRule="evenodd"
											/>
											<path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
										</svg>
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
											<path
												fillRule="evenodd"
												d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
												clipRule="evenodd"
											/>
										</svg>
									)}
								</button>
							</div>
						</div>
					</div>

					{error && (
						<div className="text-red-500 text-sm text-center p-3 bg-red-50 border border-red-200 rounded-md">
							{error}
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-dark bg-brand-yellow hover:bg-brand-yellow-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow"
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>

						{/* Enlace para recuperación de contraseña */}
						<div className="text-center mt-2">
							<Link href="/forgot-password" className="text-sm text-gray-600 hover:text-brand-yellow">
								Forgot your Password?
							</Link>
						</div>
					</div>

					<div className="relative my-4">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
						</div>
					</div>

					<div>
						<button
							type="button"
							onClick={() => {
								setLoading(true);
								// Let NextAuth handle the redirect flow for Google authentication
								// Use root as callback to let the session check handle the redirection
								signIn("google", { callbackUrl: "/login" });
							}}
							className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow"
						>
							<svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
								<g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
									<path
										fill="#4285F4"
										d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
									/>
									<path
										fill="#34A853"
										d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
									/>
									<path
										fill="#FBBC05"
										d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
									/>
									<path
										fill="#EA4335"
										d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
									/>
								</g>
							</svg>
							Sign in with Google
						</button>
					</div>

					<div className="text-center mt-4">
						<p className="text-sm text-gray-600">
							Don't have an account?{" "}
							<Link href="/register" className="text-brand-yellow hover:text-brand-yellow-hover">
								Register
							</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}

// Loading fallback component
function LoginLoadingFallback() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 text-center">
				<div className="animate-pulse">
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Loading...</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Please wait while we prepare the login page
					</p>
				</div>
			</div>
		</div>
	);
}

// Main page component with Suspense boundary
export default function LoginPage() {
	return (
		<Suspense fallback={<LoginLoadingFallback />}>
			<LoginPageContent />
		</Suspense>
	);
}
