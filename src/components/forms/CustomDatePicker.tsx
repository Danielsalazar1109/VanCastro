"use client";

import React, { useState, useEffect } from "react";

interface CustomDatePickerProps {
	value: string;
	onChange: (date: string) => void;
	minDate: string;
	className?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, minDate, className = "" }) => {
	// State for the calendar
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);

	// Update the current month when the value changes
	useEffect(() => {
		if (value) {
			// Parse date safely from YYYY-MM-DD format to avoid timezone issues
			const [year, month, day] = value.split('-').map(num => parseInt(num, 10));
			if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
				const date = new Date(year, month - 1, day);
				setSelectedDate(date);
				setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
			}
		}
	}, [value]);

	// Format date as YYYY-MM-DD
	const formatDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	// Format date for display
	const formatDisplayDate = (date: Date | null): string => {
		if (!date) return "";
		// Use a more consistent approach to format the date for display
		const month = date.toLocaleString("en-US", { month: "long" });
		const day = date.getDate();
		const year = date.getFullYear();
		return `${month} ${day}, ${year}`;
	};

	// Get days in month
	const getDaysInMonth = (year: number, month: number): number => {
		return new Date(year, month + 1, 0).getDate();
	};

	// Get day of week (0 = Monday, 6 = Sunday in our custom calendar)
	const getDayOfWeek = (date: Date): number => {
		const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
		return day === 0 ? 6 : day - 1; // Convert to 0 = Monday, ..., 6 = Sunday
	};

	// Generate calendar days
	const generateCalendarDays = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();

		const daysInMonth = getDaysInMonth(year, month);
		const firstDayOfMonth = getDayOfWeek(new Date(year, month, 1));

		const daysInPrevMonth = getDaysInMonth(year, month - 1);

		const days = [];

		// Previous month days
		for (let i = firstDayOfMonth - 1; i >= 0; i--) {
			const day = daysInPrevMonth - i;
			const date = new Date(year, month - 1, day);
			days.push({
				date,
				day,
				isCurrentMonth: false,
				isSelectable: formatDate(date) >= minDate,
			});
		}

		// Current month days
		for (let i = 1; i <= daysInMonth; i++) {
			const date = new Date(year, month, i);
			// Skip Sundays (day 0)
			if (date.getDay() !== 0) {
				days.push({
					date,
					day: i,
					isCurrentMonth: true,
					isSelectable: formatDate(date) >= minDate,
				});
			}
		}

		// Next month days to fill the calendar grid
		const remainingDays = 35 - days.length; // 5 rows x 7 columns - days already added
		for (let i = 1; i <= remainingDays; i++) {
			const date = new Date(year, month + 1, i);
			// Skip Sundays (day 0)
			if (date.getDay() !== 0) {
				days.push({
					date,
					day: i,
					isCurrentMonth: false,
					isSelectable: formatDate(date) >= minDate,
				});
			} else {
				// Add one more day to compensate for skipped Sunday
				remainingDays + 1;
			}
		}

		return days;
	};

	// Handle date selection
	const handleDateSelect = (date: Date, isSelectable: boolean) => {
		if (!isSelectable) return;

		// Create a new date to avoid timezone issues
		const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		setSelectedDate(selectedDate);
		onChange(formatDate(selectedDate));
		setIsOpen(false);
	};

	// Navigate to previous month
	const goToPreviousMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
	};

	// Navigate to next month
	const goToNextMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
	};

	// Get month and year display
	const getMonthYearDisplay = () => {
		return currentMonth.toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
		});
	};

	// Day names (Monday to Saturday, no Sunday)
	const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

	return (
		<div className="relative">
			<div
				className={`bg-white p-2 border border-gray-300 rounded-md cursor-pointer ${className}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				{selectedDate ? formatDisplayDate(selectedDate) : "Select date"}
			</div>

			{isOpen && (
				<div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
					<div className="flex justify-between items-center p-2 border-b">
						<button
							type="button"
							onClick={goToPreviousMonth}
							className="p-1 hover:bg-gray-100 rounded-full"
						>
							&#9664;
						</button>
						<div className="font-medium">{getMonthYearDisplay()}</div>
						<button type="button" onClick={goToNextMonth} className="p-1 hover:bg-gray-100 rounded-full">
							&#9654;
						</button>
					</div>

					<div className="grid grid-cols-6 gap-1 p-2">
						{/* Day names */}
						{dayNames.map((name) => (
							<div key={name} className="text-center text-xs font-medium text-gray-500 p-1">
								{name}
							</div>
						))}

						{/* Calendar days */}
						{generateCalendarDays().map((day, index) => (
							<div
								key={index}
								onClick={() => handleDateSelect(day.date, day.isSelectable)}
								className={`
                  text-center p-1 text-sm cursor-pointer rounded-full
                  ${!day.isCurrentMonth ? "text-gray-400" : ""}
                  ${
						selectedDate &&
						day.date.getDate() === selectedDate.getDate() &&
						day.date.getMonth() === selectedDate.getMonth() &&
						day.date.getFullYear() === selectedDate.getFullYear()
							? "bg-yellow-400 text-white font-bold"
							: day.isSelectable
								? "hover:bg-yellow-100"
								: "text-gray-300 cursor-not-allowed"
					}
                `}
							>
								{day.day}
							</div>
						))}
					</div>

					<div className="flex justify-between p-2 border-t">
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="text-sm text-blue-500 hover:text-blue-700"
						>
							Close
						</button>
						<button
							type="button"
							onClick={() => {
								// Create a new date for today that's timezone-safe
								const today = new Date();
								const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
								setSelectedDate(todayDate);
								onChange(formatDate(todayDate));
								setIsOpen(false);
							}}
							className="text-sm text-blue-500 hover:text-blue-700"
						>
							Today
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default CustomDatePicker;
