import React from "react";
import Image from "next/image";

interface CircularSelectorProps {
	label: string;
	options: {
		value: string;
		imageUrl: string;
		alt: string;
	}[];
	selectedValue: string;
	onChange: (value: string) => void;
}

const CircularSelector: React.FC<CircularSelectorProps> = ({ label, options, selectedValue, onChange }) => {
	return (
		<div className="mb-6">
			<label className="block text-gray-700 text-sm font-bold mb-4">{label}</label>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
				{options.map((option) => (
					<div key={option.value} className="flex flex-col items-center">
						<div className="relative">
							<div
								onClick={() => onChange(option.value)}
								className={`
                  w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center 
                  cursor-pointer transition-all duration-300 
                  border-2 overflow-hidden
                  ${
										selectedValue === option.value
											? "border-yellow-500 scale-105 shadow-lg bg-yellow-50"
											: "border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 hover:scale-110"
									}
                `}
							>
								<Image
									src={option.imageUrl}
									alt={option.alt}
									width={400}
									height={400}
									className="w-full h-full object-cover"
								/>
							</div>
							{/* The checkmark positioned outside the circular image container */}
							{selectedValue === option.value && (
								<div className="absolute -top-1 -right-1 bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center z-10 text-xs">
									✓
								</div>
							)}
						</div>
						<h3 className="text-base sm:text-lg font-bold text-center mt-2">
							{option.value.charAt(0).toUpperCase() + option.value.slice(1)}
						</h3>
					</div>
				))}
			</div>
		</div>
	);
};

export default CircularSelector;
