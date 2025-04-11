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
			{isMobile ? (
				// Mobile content - Exact layout from the image
				<div className="relative w-full h-full bg-white flex flex-col items-center justify-between">
					{/* Content container with borders */}
					<div className="w-full h-full flex flex-col">
						{/* Title and subtitle section */}
						<div className="w-full p-4 pb-2">
							<h1 className="font-bold text-black text-center" style={{ fontSize: "24px" }}>
								Join Us on the Road!
							</h1>
							<p className="text-black text-center" style={{ fontSize: "15px" }}>
								We're here to support you
								<br />
								every step of the way.
							</p>
						</div>

						{/* Car image section - Reduced height and negative margin */}
						<div className="flex items-center justify-center -mt-4" style={{ height: "450px" }}>
							<div className="relative" style={{ width: "480px", height: "306px" }}>
								<img
									src="https://s3-alpha-sig.figma.com/img/ae0d/e3f7/92ee57e923f9a1bed04bc3cab9107c88?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=DvKnR7HzF5rxW-RmQwkN8lAY6om48CaJcfU1k8mhupu2K2ICmStHJeyYu27BZB2c71Gwf-oxLHgaT~Qu3ut3Xn~PPUV0Ol~89O86jCFxaEs3u2tA2W7S5-BcyeeKeiHyj4X3oHjSqTypdrksUJcVGakvmXBksX9G94yiY5i4A3rpIZooPFwW5HT7GTX5E-I6E06fWcZWUnFp-ve5MnnDJC8X6eLbOGEHyQl7EW5s~~9JvlCFz~lVn5RWRmfg1IO3CLEc-HLBWJhGrphh80j8N92Eq-UgNx0mudhD221sxC3PcIdxudJfIGr3v~2c0Or1unBeo~cbLmWTiMMUGCS0Cw__"
									alt="Car on road"
									className="w-full h-full object-contain"
								/>
							</div>
						</div>

						{/* Register button section */}
						<div className="w-full p-4 flex justify-center">
							<Link
								href="/register"
								className="bg-gray-800 text-white font-bold py-3 px-8 rounded-md w-full block text-center"
							>
								Register Now
							</Link>
						</div>
					</div>
				</div>
			) : (
				// Desktop content
				<>
					{/* Video background for desktop */}
					<div className="absolute inset-0">
						<video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline>
							<source src="/heropage/video.mp4" type="video/mp4" />
							Your browser does not support the video tag.
						</video>
						{/* Overlay for desktop video */}
						<div className="absolute inset-0 bg-black opacity-50"></div>
					</div>

					{/* Content overlay for desktop */}
					<div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
						<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 md:mb-6 max-w-4xl leading-tight">
							Join us on the road
						</h1>
						<p className="text-lg sm:text-xl md:text-2xl text-white mb-6 md:mb-8 max-w-2xl">
							We're here to support you every step of the way
						</p>
						<Link
							href="/booking"
							className="btn-primary text-base md:text-lg px-6 py-2 md:px-8 md:py-3 rounded-md"
						>
							Book a Lesson Now
						</Link>
					</div>
				</>
			)}
		</div>
	);
}
