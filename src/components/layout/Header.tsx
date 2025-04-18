"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

// Definición de enlaces de navegación pública
const publicNavLinks = [
	{ href: "/", label: "Home" },
	{ href: "/plans", label: "Plans" },
	{ href: "/booking", label: "Booking" },
	{ href: "/faq", label: "FAQ" },
	{ href: "/contact", label: "Contact" }
];

export default function Header() {
	const { data: session, status } = useSession();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// Determinar el dashboard del usuario según su rol
	const getDashboardLink = () => {
		if (!session) return null;
		
		const userRole = session.user?.role || "student";
		
		if (userRole === "admin") return "/admin";
		if (userRole === "instructor") return "/instructor";
		return "/student";
	};

	const dashboardLink = getDashboardLink();

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

	// Renderiza los enlaces de navegación según el estado de autenticación
	const renderNavLinks = (isMobile: boolean = false) => {
		// Si el usuario está autenticado, solo mostrar botón de dashboard y logout
		if (status === "authenticated") {
			const linkClasses = isMobile
				? "text-white hover:text-yellow-500 transition-colors duration-200 block py-3 text-lg font-medium"
				: "text-white hover:text-yellow-500 transition-colors duration-200";

			return (
				<>
					{dashboardLink && (
						<li>
							<Link
								href={dashboardLink}
								className={linkClasses}
								onClick={() => isMobile && setIsMenuOpen(false)}
							>
								Dashboard
							</Link>
						</li>
					)}
					<li>
						<button
							onClick={() => {
								signOut({ callbackUrl: "/" });
								isMobile && setIsMenuOpen(false);
							}}
							className={`bg-red-500 px-4 py-${isMobile ? "3" : "2"} rounded-md text-white hover:bg-red-600 transition-colors duration-200 ${
								isMobile ? "w-full text-left text-lg font-medium" : "flex items-center space-x-2"
							}`}
						>
							<span>Logout</span>
						</button>
					</li>
				</>
			);
		}

		// Para usuarios no autenticados, mostrar todos los enlaces públicos
		return (
			<>
				{publicNavLinks.map((link) => (
					<li key={link.href}>
						<Link
							href={link.href}
							className={
								isMobile
									? "text-white hover:text-yellow-500 transition-colors duration-200 block py-3 text-lg font-medium"
									: "text-white hover:text-yellow-500 transition-colors duration-200"
							}
							onClick={() => isMobile && setIsMenuOpen(false)}
						>
							{link.label}
						</Link>
					</li>
				))}
				<li>
					{isMobile ? (
						<Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
							<button className="btn-primary w-full text-left py-3 text-lg font-medium">Login</button>
						</Link>
					) : (
						<Link href="/login" className="text-white hover:text-yellow-500 transition-colors duration-200">
							<button className="btn-primary">Login</button>
						</Link>
					)}
				</li>
			</>
		);
	};

	return (
		<header className="bg-stone-900 shadow-sm py-3">
			<div className="container mx-auto px-6 flex items-center justify-between h-20">
				<Link href={status === "authenticated" ? getDashboardLink() || "/" : "/"}>
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
						{renderNavLinks()}
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
						<Link href={status === "authenticated" ? getDashboardLink() || "/" : "/"} onClick={() => setIsMenuOpen(false)}>
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
							{renderNavLinks(true)}
						</ul>
					</nav>
				</div>
			</div>
		</header>
	);
}
