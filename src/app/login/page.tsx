"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Client component that uses useSearchParams
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  
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
            .then(res => res.json())
            .then(session => {
              console.log("Session check after Google error:", session);
              if (session?.user) {
                // If we have a session despite the error, redirect to the appropriate page
                console.log("Session found despite error, redirecting");
                router.push("/api/auth/session-redirect");
              } else {
                // Show error but don't auto-retry to avoid potential loops
                setError("Google sign-in failed. Please try again using the button below.");
              }
            })
            .catch(err => {
              console.error("Error checking session after Google auth error:", err);
              setError("Google sign-in failed. Please try again using the button below.");
            });
          break;
        default:
          console.log("Unknown error type:", errorParam);
          setError("An error occurred. Please try again.");
      }
    }
  }, [errorParam, router]);
  
  // Check if we're coming from a Google auth redirect
  useEffect(() => {
    // Check for Google auth indicators in URL or referrer
    const isGoogleAuth = searchParams.get("callbackUrl")?.includes("google") || 
                        searchParams.get("error")?.includes("OAuthCallback") ||
                        document.referrer.includes("accounts.google.com") ||
                        window.location.href.includes("google");
    
    if (isGoogleAuth && !autoSubmitted) {
      console.log("Detected Google auth redirect, checking session...");
      console.log("Environment:", process.env.NODE_ENV);
      console.log("URL:", window.location.href);
      console.log("Referrer:", document.referrer);
      setAutoSubmitted(true);
      
      // Try to get the session directly
      fetch("/api/auth/session")
        .then(res => res.json())
        .then(session => {
          console.log("Session from API:", session);
          
          if (session?.user) {
            console.log("Session found, redirecting to session-redirect");
            // If we have a session, redirect to session-redirect
            // Use window.location.href for API routes instead of router.push
            window.location.href = "/api/auth/session-redirect";
          } else {
            console.log("No session found, redirecting to Google auth");
            // If no session, redirect to Google auth
            signIn("google", { callbackUrl: "/api/auth/session-redirect" });
          }
        })
        .catch(err => {
          console.error("Error checking session:", err);
          // If error, redirect to Google auth
          signIn("google", { callbackUrl: "/api/auth/session-redirect" });
        });
    }
  }, [autoSubmitted, router, searchParams]);

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
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Get the session to check the user role
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      
      // Redirect based on user role
      if (session?.user?.role === "user") {
        router.push("/student");
      } else if (session?.user?.role === "instructor") {
        router.push("/instructor");
      } else if (session?.user?.role === "admin") {
        router.push("/admin");
      } else {
        // Fallback to the callback URL or home page
        router.push(callbackUrl);
      }
      
      router.refresh();
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
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
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-dark bg-brand-yellow hover:bg-brand-yellow-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
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
              // Use absolute URL for production to avoid URL mismatches
              const callbackUrl = process.env.NODE_ENV === "production"
                ? "https://vancastro.vercel.app/api/auth/session-redirect"
                : "/api/auth/session-redirect";
              signIn("google", { callbackUrl });
            }}
            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Loading...
          </h2>
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