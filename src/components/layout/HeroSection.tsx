import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection() {
	const [isMobile, setIsMobile] = useState(false);

	// Check if we're on a mobile device
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		// Initial check
		checkMobile();

		// Add event listener for window resize
		window.addEventListener("resize", checkMobile);

		// Cleanup
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<div className="relative w-full overflow-hidden" style={{ height: isMobile ? "calc(100vh - 80px)" : "100vh" }}>
			{/* Video background */}
			<div className="absolute inset-0">
				{/* Only load video on non-mobile devices to save bandwidth */}
				{isMobile ? (
					<div className="absolute inset-0 bg-stone-900"></div>
				) : (
					<video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline>
						<source src="/heropage/video.mp4" type="video/mp4" />
						Your browser does not support the video tag.
					</video>
				)}
				{/* Overlay to ensure text readability */}
				<div className="absolute inset-0 bg-black opacity-50"></div>
			</div>

			{/* Content overlay */}
			<div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
				<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 md:mb-6 max-w-4xl leading-tight">
					Join us on the road
				</h1>
				<p className="text-lg sm:text-xl md:text-2xl text-white mb-6 md:mb-8 max-w-2xl">
					We're here to support you every step of the way
				</p>
				<Link href="/booking" className="btn-primary text-base md:text-lg px-6 py-2 md:px-8 md:py-3 rounded-md">
					Book a Lesson Now
				</Link>
			</div>
		</div>
	);
}
