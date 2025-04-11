"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Header() {
	const { data: session, status } = useSession();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (isMenuOpen && !target.closest("nav") && !target.closest("button")) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isMenuOpen]);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
		<header className="bg-stone-900 shadow-sm py-3">
			<div className="container mx-auto px-6 flex items-center justify-between h-20">
				<Link href="/">
					<Image
						src="https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png"
						alt="VanCastro Driving School Logo"
						width={130}
						height={40}
					/>
				</Link>

				{/* Mobile menu button */}
				<button
					className="md:hidden text-white focus:outline-none bg-brand-yellow p-2 rounded-md hover:bg-brand-yellow-hover transition-colors"
					onClick={toggleMenu}
					aria-label="Toggle menu"
				>
					{isMenuOpen ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6 text-brand-dark"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6 text-brand-dark"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					)}
				</button>

				{/* Desktop Navigation */}
				<nav className="hidden md:block">
					<ul className="flex items-center space-x-8 text-lg">
						<li>
							<Link href="/" className="text-white hover:text-yellow-500 transition-colors duration-200">
								Home
							</Link>
						</li>
						<li>
							<Link
								href="/plans"
								className="text-white hover:text-yellow-500 transition-colors duration-200"
							>
								Plans
							</Link>
						</li>
						<li>
							<Link
								href="/booking"
								className="text-white hover:text-yellow-500 transition-colors duration-200"
							>
								Booking
							</Link>
						</li>
						<li>
							<Link
								href="/faq"
								className="text-white hover:text-yellow-500 transition-colors duration-200"
							>
								FAQ
							</Link>
						</li>
						<li>
							<Link
								href="/contact"
								className="text-white hover:text-yellow-500 transition-colors duration-200"
							>
								Contact
							</Link>
						</li>
						<li>
							{status === "authenticated" ? (
								<button
									onClick={() => signOut({ callbackUrl: "/" })}
									className="bg-red-500 px-4 py-2 rounded-md text-white hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
								>
									<span>Logout</span>
								</button>
							) : (
								<Link
									href="/login"
									className="text-white hover:text-yellow-500 transition-colors duration-200"
								>
									<button className="btn-primary">Login</button>
								</Link>
							)}
						</li>
					</ul>
				</nav>
			</div>

			{/* Mobile Navigation */}
			<div
				className={`md:hidden fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
					isMenuOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsMenuOpen(false)}></div>
				<div className="relative bg-stone-900 h-full w-4/5 max-w-xs shadow-xl overflow-y-auto">
					<div className="flex justify-between items-center p-4 border-b border-gray-700">
						<Link href="/" onClick={() => setIsMenuOpen(false)}>
							<Image
								src="https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png"
								alt="VanCastro Driving School Logo"
								width={100}
								height={30}
							/>
						</Link>
						<button
							className="text-white focus:outline-none"
							onClick={() => setIsMenuOpen(false)}
							aria-label="Close menu"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
					<nav className="p-4">
						<ul className="flex flex-col space-y-4">
							<li>
								<Link
									href="/"
									className="text-white hover:text-yellow-500 transition-colors duration-200 block py-3 text-lg font-medium"
									onClick={() => setIsMenuOpen(false)}
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href="/plans"
									className="text-white hover:text-yellow-500 transition-colors duration-200 block py-3 text-lg font-medium"
									onClick={() => setIsMenuOpen(false)}
								>
									Plans
								</Link>
							</li>
							<li>
								<Link
									href="/booking"
									className="text-white hover:text-yellow-500 transition-colors duration-200 block py-3 text-lg font-medium"
									onClick={() => setIsMenuOpen(false)}
								>
									Booking
								</Link>
							</li>
							<li>
								<Link
									href="/faq"
									className="text-white hover:text-yellow-500 transition-colors duration-200 block py-3 text-lg font-medium"
									onClick={() => setIsMenuOpen(false)}
								>
									FAQ
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="text-white hover:text-yellow-500 transition-colors duration-200 block py-3 text-lg font-medium"
									onClick={() => setIsMenuOpen(false)}
								>
									Contact
								</Link>
							</li>
							<li className="pt-4 mt-4 border-t border-gray-700">
								{status === "authenticated" ? (
									<button
										onClick={() => {
											signOut({ callbackUrl: "/" });
											setIsMenuOpen(false);
										}}
										className="bg-red-500 px-4 py-3 rounded-md text-white hover:bg-red-600 transition-colors duration-200 w-full text-left text-lg font-medium"
									>
										Logout
									</button>
								) : (
									<Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
										<button className="btn-primary w-full text-left py-3 text-lg font-medium">
											Login
										</button>
									</Link>
								)}
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</header>
	);
}
