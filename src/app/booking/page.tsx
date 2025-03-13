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
						<h2 className="text-2xl font-semibold mb-6">Select an Instructor</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div
								onClick={() => handleSelectInstructor("Instructor 1")}
								className="cursor-pointer border p-4 rounded-lg shadow-md hover:bg-gray-100"
							>
								<img src="/images/instructor1.jpg" alt="Instructor 1" className="rounded-lg mb-2" />
								<p className="text-center font-semibold">Instructor 1</p>
							</div>
							<div
								onClick={() => handleSelectInstructor("Instructor 2")}
								className="cursor-pointer border p-4 rounded-lg shadow-md hover:bg-gray-100"
							>
								<img src="/images/instructor2.jpg" alt="Instructor 2" className="rounded-lg mb-2" />
								<p className="text-center font-semibold">Instructor 2</p>
							</div>
						</div>
					</>
				);
			case 2:
				return (
					<>
						<h2 className="text-2xl font-semibold mb-6">Choose Date & Time</h2>
						<p className="text-sm text-gray-500 mb-4">
							Select your preferred time slot using our scheduling tool below:
						</p>
						<div className="calendly-container border border-gray-300 rounded-lg px-8 py-2">
							<div
								className="calendly-inline-widget"
								data-url="https://calendly.com/vancastroinstructor?hide_gdpr_banner=1&background_color=000000&text_color=f8f8f8&primary_color=fec102"
								style={{ minWidth: "500px", height: "500px" }}
							></div>
						</div>
						<Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
					</>
				);
			case 3:
				return (
					<>
						<h2 className="text-2xl font-semibold mb-6">Your Information</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="mb-4">
								<label htmlFor="firstName" className="form-label">
									First Name
								</label>
								<input
									type="text"
									id="firstName"
									name="firstName"
									value={formData.firstName}
									onChange={handleChange}
									className="form-input"
									required
								/>
							</div>
						</div>
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
