import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import FooterWrapper from "@/components/layout/FooterWrapper";
import AuthSessionProvider from "@/components/auth/SessionProvider";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

export const metadata: Metadata = {
	icons: "/favicon/car.svg",
	title: "Vancastro",
	description: "Book your driving lessons online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${inter.variable} font-sans`}>
				<AuthSessionProvider>
					<Header />
					<main className="min-h-screen bg-gray-50">{children}</main>
					<FooterWrapper />
				</AuthSessionProvider>
			</body>
		</html>
	);
}
