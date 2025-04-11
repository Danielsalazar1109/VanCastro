"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentDashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Redirect if not logged in or not a student
		if (status === "unauthenticated") {
			router.push("/login");
		} else if (status === "authenticated") {
			// Use string comparison for role check
			const userRole = session?.user?.role as string;
			if (userRole !== "user") {
				router.push("/");
			}
			setLoading(false);
		}
	}, [status, session, router]);

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
					{/* Header */}
					<div className="bg-brand-yellow px-6 py-4">
						<h1 className="text-2xl font-bold text-brand-dark">Student Dashboard</h1>
						<p className="text-brand-dark">Welcome to your student portal</p>
					</div>

					{/* Profile Section */}
					<div className="p-6 border-b">
						<h2 className="text-xl font-semibold mb-4">Your Profile</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

					{/* Quick Links */}
					<div className="p-6 border-b">
						<h2 className="text-xl font-semibold mb-4">Quick Links</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Link
								href="/booking"
								className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
							>
								<h3 className="font-medium text-lg">Book a Lesson</h3>
								<p className="text-gray-600">Schedule your next driving lesson</p>
							</Link>
							<Link
								href="/tracking"
								className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
							>
								<h3 className="font-medium text-lg">Track your booking</h3>
								<p className="text-gray-600">Check the status of your driving lessons</p>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
