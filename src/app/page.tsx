"use client";

import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/layout/HeroSection";
import ReviewsToggle from "@/components/home/reviewsToggle";
import WhySection from "@/components/whySection/WhySection";
import PlansGrid from "@/components/plans/PlansGrid";

export default function Home() {
	const handleSelectPackage = (link: string) => {
		console.log("Package selected:", link);
	};

	return (
		<>
			{/* Full-screen hero section with video placeholder and CTA */}
			<HeroSection />

			{/* Why Choose Our Driving School section */}
			<WhySection />

			{/* Reviews Toggle section */}
			<ReviewsToggle />
			<div className="w-full py-12 font-sans">
				<section className="text-center">
					<h2 className="text-4xl font-extrabold">How It Works ?</h2>
					<p className="text-2xl font-bold mb-8">: Follow 3 Simple Steps</p>

					<div className="w-full">
						{[
							{
								step: "Step 1",
								title: "Take the Knowledge Test",
								description:
									"Prepare for and complete the Knowledge Test to assess your understanding of driving rules.\n\nNeed translation? Click here to connect with a partner for language support.",
								bg: "bg-amber-100",
							},
							{
								step: "Step 2",
								title: "Phone Consultation",
								description:
									"Discuss available plans tailored to your needs (e.g. changing licenses or starting as a beginner).",
								bg: "bg-amber-200",
							},
							{
								step: "Step 3",
								title: "Road Test Preparation",
								description:
									"\nConvenient Pickup & Drop-off\nWe'll pick you up and drop you off at the meeting point.\n\nMeet at a Designated Location\nTypically at a SkyTrain station.\n\nRoad Test Scheduling\nWe'll help you schedule your Road Test.",
								bg: "bg-amber-300",
							},
						].map((item, index) => (
							<div key={index} className={`w-full py-12 px-8 ${item.bg} text-center shadow-md`}>
								<div className="inline-block bg-gray-800 text-white text-lg font-bold px-6 py-2 rounded-full mb-6">
									{item.step}
								</div>
								<h3 className="text-2xl font-extrabold mb-4 text-gray-900">{item.title}</h3>
								<p className="text-lg text-gray-900 whitespace-pre-line leading-relaxed font-semibold">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</section>
			</div>

			{/* PlansGrid component added here */}
			<PlansGrid onSelectPackage={handleSelectPackage} />

			<div>
				<p>algo</p>
			</div>
		</>
	);
}
