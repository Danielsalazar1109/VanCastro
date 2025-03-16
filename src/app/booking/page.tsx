"use client";

import { useEffect, useState } from "react";

interface Package {
	title: string;
	duration: string;
	price: string;
	features: string[];
	link: string;
	popular?: boolean;
}

const packages: { [key: string]: Package[] } = {
	Class4: [
		{
			title: "Hourly lesson",
			duration: "60 mins",
			price: "$126",
			features: [
				"60 mins/lesson",
				"Include driving school car",
				"Pick-up and Drop-off",
				"Class 5 or Class 7 license",
				"Available at Vancouver, North Vancouver, Surrey and Burnaby",
			],
			link: "https://calendly.com/vancastro-anderson/class-4-60min?hide_gdpr_banner=1&primary_color=fec101",
		},
		{
			title: "Best for Class 4",
			duration: "90 mins",
			price: "$157.50",
			features: [
				"60 mins/lesson",
				"Include driving school car",
				"Pick-up and Drop-off",
				"Class 5 or Class 7 license",
				"Available at Vancouver, North Vancouver, Surrey and Burnaby",
			],
			link: "",
			popular: true,
		},
		{
			title: "Warm up",
			duration: "Road test",
			price: "$250",
			features: [
				"90 mins/lesson",
				"Include driving school car",
				"Pick-up and Drop-off",
				"Class 5 or Class 7 license",
				"Available at Vancouver, North Vancouver, Surrey and Burnaby",
			],
			link: "",
		},
	],
	Class5: [
		{
			title: "Hourly lesson",
			duration: "60 mins",
			price: "$80",
			features: [
				"60 mins/lesson",
				"Include driving school car",
				"Pick-up and Drop-off",
				"Class 5 license",
				"Available at Vancouver, North Vancouver, Surrey and Burnaby",
			],
			link: "",
		},
		{
			title: "Best for Intermediate",
			duration: "90 mins",
			price: "$150",
			features: [
				"60 mins/lesson",
				"Include driving school car",
				"Pick-up and Drop-off",
				"Class 5 license",
				"Available at Vancouver, North Vancouver, Surrey and Burnaby",
			],
			link: "",
			popular: true,
		},
		{
			title: "Road test",
			duration: "Warm up",
			price: "$220",
			features: [
				"90 mins/lesson",
				"Include driving school car",
				"Pick-up and Drop-off",
				"Class 5 license",
				"Available at Vancouver, North Vancouver, Surrey and Burnaby",
			],
			link: "",
		},
	],
	Class7: [
		{
			title: "Hourly lesson",
			duration: "60 mins",
			price: "$85",
			features: [
				"60 mins/lesson",
				"Include driving school car",
				"Pick-up and Drop-off",
				"Class 7 license",
				"Available at Vancouver, North Vancouver, Surrey and Burnaby",
			],
			link: "",
		},
		{
			title: "Best for Class 7",
			duration: "90 mins",
			price: "$165",
			features: [
				"60 mins/lesson",
				"Include driving school car",
				"Pick-up and Drop-off",
				"Class 7 license",
				"Available at Vancouver, North Vancouver, Surrey and Burnaby",
			],
			link: "",
			popular: true,
		},
		{
			title: "Road test",
			duration: "Warm up",
			price: "$230",
			features: [
				"90 mins/lesson",
				"Include driving school car",
				"Pick-up and Drop-off",
				"Class 7 license",
				"Available at Vancouver, North Vancouver, Surrey and Burnaby",
			],
			link: "",
		},
	],
};

export default function BookingPage() {
	const [selectedClass, setSelectedClass] = useState<"Class4" | "Class5" | "Class7">("Class4");
	const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://assets.calendly.com/assets/external/widget.js";
		script.async = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, [selectedPackage]);

	return (
		<div className="w-full min-h-screen flex flex-col items-center bg-white py-10">
			{!selectedPackage && (
				<>
					<h1 className="text-4xl font-bold">Pick What Fits You Best</h1>
					<div className="mt-6 flex gap-4">
						{["Class4", "Class5", "Class7"].map((cls) => (
							<button
								key={cls}
								onClick={() => setSelectedClass(cls as "Class4" | "Class5" | "Class7")}
								className={`px-8 py-3 font-semibold rounded-lg border shadow-md transition-all 
                                    ${selectedClass === cls ? "bg-yellow-400 border-black" : "bg-gray-200"}`}
							>
								{cls.replace("Class", "Class ")}
							</button>
						))}
					</div>
				</>
			)}

			{!selectedPackage && (
				<div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-[90%] max-w-5xl">
					{packages[selectedClass].map((pkg, index) => (
						<div
							key={index}
							className="relative bg-white border-2 border-yellow-400 rounded-2xl shadow-lg p-8 text-center"
						>
							{pkg.popular && (
								<div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-black text-yellow-400 text-xs font-bold px-4 py-1 rounded-full flex items-center">
									<span className="mr-2">⭐</span> Most popular <span className="ml-2">⭐</span>
								</div>
							)}

							<h2 className="text-lg font-bold mt-2">{pkg.title}</h2>
							<p className="text-gray-600 text-xl mt-1 font-bold mb-4">{pkg.duration}</p>

							<div className="relative flex justify-center mb-6">
								<div className="w-28 h-28 bg-yellow-200 rounded-full flex items-center justify-center">
									<span className="text-4xl font-extrabold text-gray-800">{pkg.price}</span>
								</div>
							</div>

							<ul className="text-sm text-gray-600 mb-6 text-left space-y-2">
								{pkg.features.map((feature, i) => (
									<li key={i} className="flex items-center">
										<span className="text-yellow-500 mr-2">✔</span> {feature}
									</li>
								))}
							</ul>

							<button
								className="mt-4 px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg w-full shadow-md hover:bg-yellow-500 transition"
								onClick={() => setSelectedPackage(pkg.link)}
							>
								Register Now
							</button>
						</div>
					))}
				</div>
			)}

			{selectedPackage && (
				<div className="w-[1200px] h-[600px] flex justify-center items-center overflow-hidden">
					<div
						key={selectedPackage}
						className="calendly-inline-widget"
						data-url={selectedPackage}
						style={{ width: 2300, height: 700 }} //border: "none"//
					></div>
				</div>
			)}
		</div>
	);
}
