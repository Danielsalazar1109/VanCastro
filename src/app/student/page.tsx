"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

// Student dashboard content component that uses useSearchParams
function StudentDashboardContent() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(true);
	const [retryCount, setRetryCount] = useState(0);
	const fromSessionRedirect = searchParams.get("from") === "session-redirect";

	useEffect(() => {
		// If coming from session-redirect, give the session some time to establish
		if (fromSessionRedirect && status === "unauthenticated" && retryCount < 3) {
			console.log(`Session not ready yet, retry attempt ${retryCount + 1}/3`);
			// Wait a bit and increment retry count
			const timer = setTimeout(() => {
				setRetryCount(prev => prev + 1);
			}, 1000); // Wait 1 second before retrying
			
			return () => clearTimeout(timer);
		}
		
		// Redirect if not logged in or not a student
		if (status === "unauthenticated" && (!fromSessionRedirect || retryCount >= 3)) {
			console.log("Redirecting to login: unauthenticated");
			router.push("/login");
		} else if (status === "authenticated") {
			// Use string comparison for role check
			const userRole = session?.user?.role as string;
			if (userRole !== "user") {
				console.log("Redirecting to home: not a student");
				router.push("/login");
			}
			setLoading(false);
		}
	}, [status, session, router, fromSessionRedirect, retryCount]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold">Loading...</h2>
					<p className="text-gray-500">Please wait while we load your dashboard</p>
				</div>
			</div>
		);
	}

	// Get user info from session
	const user = session?.user;
	const userAny = user as any; // Type assertion to access custom fields

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-white shadow rounded-lg overflow-hidden">
					{/* Header - neutral color instead of brand-yellow */}
					<div className="bg-gray-100 px-6 py-4">
						<p className="text-gray-700">Welcome to your student portal</p>
					</div>

					{/* Profile and Actions in a single section with two columns */}
					<div className="p-6 border-b">
						<div className="flex flex-col md:flex-row">
							{/* Left column - Profile information */}
							<div className="w-full md:w-2/3">
								<h2 className="text-xl font-semibold mb-4 text-center">Your Profile</h2>
								<div className="space-y-4">
									<div>
										<p className="text-gray-600">Name</p>
										<p className="font-medium">
											{userAny?.firstName} {userAny?.lastName || user?.name}
										</p>
									</div>
									<div>
										<p className="text-gray-600">Email</p>
										<p className="font-medium">{user?.email}</p>
									</div>
									<div>
										<p className="text-gray-600">Phone</p>
										<p className="font-medium">{userAny?.phone || "Not provided"}</p>
									</div>
									<div>
										<p className="text-gray-600">Account Type</p>
										<p className="font-medium">Student</p>
									</div>
								</div>
							</div>
							
							{/* Right column - Action buttons */}
							<div className="w-full md:w-1/3 mt-6 md:mt-0 flex flex-col justify-center space-y-4">
								<Link
									href="/booking"
									className="block py-3 px-4 bg-brand-yellow rounded-lg hover:bg-brand-yellow-hover transition text-center text-brand-dark font-medium"
								>
									Book a Lesson
								</Link>
								<Link
									href="/tracking"
									className="block py-3 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-center text-gray-700 font-medium"
								>
									Track your booking
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Loading fallback component
function StudentLoadingFallback() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h2 className="text-xl font-semibold">Loading...</h2>
				<p className="text-gray-500">Please wait while we load your dashboard</p>
			</div>
		</div>
	);
}

// Main page component with Suspense boundary
export default function StudentDashboard() {
	return (
		<Suspense fallback={<StudentLoadingFallback />}>
			<StudentDashboardContent />
		</Suspense>
	);
}
