"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";

export default function FooterWrapper() {
	const pathname = usePathname();
	const isAdminPage = pathname?.startsWith("/admin");
	const isInstructorPage = pathname?.startsWith("/instructor");

	// Don't render footer on admin pages
	if (isAdminPage || isInstructorPage) {
		return null;
	}

	return <Footer />;
}
