"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/student-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "An error occurred");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Registration successful, but login failed. Please try logging in manually.");
        setLoading(false);
        return;
      }

      // Redirect to student dashboard
      router.push("/student");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register as Student
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your student account
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Last Name"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +1
              </span>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                placeholder="(XXX) XXX-XXXX"
                pattern="[0-9]{10}"
                maxLength={10}
                value={phone.replace(/\D/g, '')}
                onChange={(e) => {
                  // Allow only numbers
                  const cleaned = e.target.value.replace(/\D/g, '');
                  // Limit to 10 digits
                  const limited = cleaned.substring(0, 10);
                  setPhone(limited);
                }}
                onBlur={(e) => {
                  // Format the number to (XXX) XXX-XXXX when focus is lost
                  const cleaned = e.target.value.replace(/\D/g, '');
                  if (cleaned.length === 10) {
                    const formatted = `(${cleaned.substring(0,3)}) ${cleaned.substring(3,6)}-${cleaned.substring(6,10)}`;
                    setPhone(cleaned); // Store without formatting for API submission
                  }
                }}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow border border-gray-300"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Format: 10 digits, not including the country code (+1)
            </p>
          </div>
          
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-dark bg-brand-yellow hover:bg-brand-yellow-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow"
          >
            {loading ? "Registering..." : "Register"}
          </button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or register with</span>
            </div>
          </div>

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
            Register with Google
          </button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="blue hover:text-brand-yellow-hover">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
