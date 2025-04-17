"use client";

import React, { useState, useEffect } from "react";

interface CustomDatePickerProps {
	value: string;
	onChange: (date: string) => void;
	minDate: string;
	className?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, minDate, className = "" }) => {
	// Format date as YYYY-MM-DD
	const formatDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	// Calculate max date (4 months from now)
	const getMaxDate = (): string => {
		const today = new Date();
		const maxDate = new Date(today.getFullYear(), today.getMonth() + 4, today.getDate());
		return formatDate(maxDate);
	};

	// Initialize with the month of minDate if it's in the future
	const getInitialMonth = (): Date => {
		const today = new Date();
		const minDateObj = new Date(minDate + "T00:00:00");

		// If minDate is in a future month, use that month
		if (
			minDateObj.getFullYear() > today.getFullYear() ||
			(minDateObj.getFullYear() === today.getFullYear() && minDateObj.getMonth() > today.getMonth())
		) {
			return new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
		}

		// Otherwise use current month
		return new Date(today.getFullYear(), today.getMonth(), 1);
	};

	// State for the calendar
	const [currentMonth, setCurrentMonth] = useState<Date>(getInitialMonth());
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(
		value && value.trim() !== "" ? new Date(value) : null
	);
	const [maxDate] = useState<string>(getMaxDate());

	// Update the current month when the value changes
	useEffect(() => {
		if (value) {
			// Parse date safely from YYYY-MM-DD format to avoid timezone issues
			const [year, month, day] = value.split("-").map((num) => parseInt(num, 10));
			if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
				const date = new Date(year, month - 1, day);
				setSelectedDate(date);
				setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
			}
		}
	}, [value]);

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
				isSelectable: formatDate(date) >= minDate && formatDate(date) <= maxDate,
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
					isSelectable: formatDate(date) >= minDate && formatDate(date) <= maxDate,
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
					isSelectable: formatDate(date) >= minDate && formatDate(date) <= maxDate,
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

	// Check if current month is the current month (to disable previous month navigation)
	const isCurrentMonth = () => {
		const today = new Date();
		return currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();
	};

	// Check if current month is 4 months ahead (to disable next month navigation)
	const isFourMonthsAhead = () => {
		const today = new Date();
		const fourMonthsLater = new Date(today.getFullYear(), today.getMonth() + 4, 1);
		return (
			currentMonth.getFullYear() > fourMonthsLater.getFullYear() ||
			(currentMonth.getFullYear() === fourMonthsLater.getFullYear() &&
				currentMonth.getMonth() >= fourMonthsLater.getMonth())
		);
	};

	// Navigate to previous month (only if not current month)
	const goToPreviousMonth = () => {
		if (!isCurrentMonth()) {
			setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
		}
	};

	// Navigate to next month (only if not 4 months ahead)
	const goToNextMonth = () => {
		if (!isFourMonthsAhead()) {
			setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
		}
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
							disabled={isCurrentMonth()}
							className={`p-1 rounded-full ${
								isCurrentMonth()
									? "text-gray-300 cursor-not-allowed"
									: "hover:bg-gray-100 text-gray-700"
							}`}
						>
							&#9664;
						</button>
						<div className="font-medium">{getMonthYearDisplay()}</div>
						<button
							type="button"
							onClick={goToNextMonth}
							disabled={isFourMonthsAhead()}
							className={`p-1 rounded-full ${
								isFourMonthsAhead()
									? "text-gray-300 cursor-not-allowed"
									: "hover:bg-gray-100 text-gray-700"
							}`}
						>
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
								// Create a new date for minDate (today + 2 days)
								const minDateObj = new Date(minDate + "T00:00:00");

								// Use minDate instead of today
								setSelectedDate(minDateObj);
								onChange(formatDate(minDateObj));
								setIsOpen(false);
							}}
							className="text-sm text-blue-500 hover:text-blue-700"
						>
							Earliest Date
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default CustomDatePicker;
