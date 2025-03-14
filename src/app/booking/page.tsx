"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

export default function BookingPage() {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		service: "beginner",
		instructor: "",
	});

	const handleSelectInstructor = (instructor: string) => {
		setFormData((prev) => ({
			...prev,
			instructor,
		}));
		setStep(2);
	};

	const handleChange = (e: any) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		if (step < 3) {
			setStep(step + 1);
			return;
		}
		alert("Booking submitted! In a real implementation, you would be redirected to payment.");
	};

	const renderStepIndicator = () => (
		<div className="flex justify-center mb-8">
			{[1, 2, 3].map((i) => (
				<div key={i} className="flex items-center">
					<div
						className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= i ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-600"}`}
					>
						{i}
					</div>
					{i < 3 && <div className={`w-12 h-1 ${step > i ? "bg-primary-600" : "bg-gray-200"}`}></div>}
				</div>
			))}
		</div>
	);

	const renderStepContent = () => {
		switch (step) {
			case 1:
				return (
					<>
						<h2 className="text-2xl font-semibold mb-6 text-center">Select an Instructor</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div
								onClick={() => handleSelectInstructor("Anderson")}
								className="cursor-pointer border-2 border-yellow-400 p-6 rounded-lg shadow-md hover:bg-gray-100 flex flex-col items-center text-center"
							>
								<img
									src="https://framerusercontent.com/images/FLvYf83Xh4QeQmPkGlT1J5BCeg.png?scale-down-to=512"
									alt="Anderson"
									className="rounded-full w-40 h-40 object-cover mb-4"
								/>
								<p className="text-lg font-bold">Anderson</p>
								<p className="text-gray-600">25 years experience</p>
								<p className="text-gray-600">🌍 English, Portuguese, Spanish</p>
								<p className="text-gray-600">⏰ Monday - Friday, 8a.m.-6p.m.</p>
							</div>

							<div
								onClick={() => handleSelectInstructor("Andresa")}
								className="cursor-pointer border-2 border-yellow-400 p-6 rounded-lg shadow-md hover:bg-gray-100 flex flex-col items-center text-center"
							>
								<img
									src="https://framerusercontent.com/images/Cucs1Au8fUHTABGitQoXRjuGEA.png?scale-down-to=512"
									alt="Andresa"
									className="rounded-full w-40 h-40 object-cover mb-4"
								/>
								<p className="text-lg font-bold">Andresa</p>
								<p className="text-gray-600">25 years experience</p>
								<p className="text-gray-600">🌍 English, Portuguese, Spanish</p>
								<p className="text-gray-600">⏰ Monday - Friday, 8a.m.-6p.m.</p>
							</div>
						</div>
					</>
				);
			case 2:
				return (
					<>
						<h2 className="text-2xl font-semibold mb-6">Choose Date & Time</h2>
						<div className="calendly-container border border-gray-300 rounded-lg px-8 py-2">
							<div
								className="calendly-inline-widget"
								data-url="https://calendly.com/vancastroinstructor"
								style={{ minWidth: "500px", height: "400px" }}
							></div>
						</div>
						<Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
					</>
				);
			default:
				return null;
		}
	};

	return (
		<div className="container mx-auto px-6 py-8 max-w-4xl">
			<h1 className="text-3xl font-bold text-center mb-8">Book Your Driving Lesson</h1>
			{renderStepIndicator()}
			<div className="bg-white p-8 rounded-lg shadow-md">
				<form onSubmit={handleSubmit}>{renderStepContent()}</form>
			</div>
		</div>
	);
}
