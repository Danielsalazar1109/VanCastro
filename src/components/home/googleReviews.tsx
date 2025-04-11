"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Review {
	name: string;
	rating: number;
	message: string;
	profileImage: string;
	link: string;
	images?: string[];
	date: string;
}

const ReviewCard = ({ review, index, rowId }: { review: Review; index: number; rowId: string }) => {
	const renderStars = (rating: number) => {
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			if (i <= rating) {
				stars.push(
					<span key={i} className="text-yellow-500 text-lg">
						★
					</span>
				);
			} else {
				stars.push(
					<span key={i} className="text-gray-300 text-lg">
						★
					</span>
				);
			}
		}
		return stars;
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			const month = months[date.getMonth()];
			const day = date.getDate();
			const year = date.getFullYear();
			return `${month} ${day}, ${year}`;
		} catch (error) {
			console.error("Error formatting date:", error);
			return dateString;
		}
	};

	return (
		<div
			key={`${rowId}-${index}`}
			className="flex flex-col bg-white p-4 rounded-lg shadow-md min-w-[500px] max-w-[550px] h-auto justify-between hover:shadow-lg transition-shadow duration-200 cursor-pointer"
		>
			<div className="flex justify-between items-start">
				<div className="flex items-center space-x-2">
					<Image
						src={review.profileImage}
						alt={review.name}
						className="w-10 h-10 rounded-full border-2 border-gray-300 object-cover"
						width={10}
						height={10}
					/>
					<div>
						<p className="text-md font-semibold">{review.name}</p>
						<div className="flex">{renderStars(review.rating)}</div>
					</div>
				</div>
				<Link
					href={review.link}
					target="_blank"
					rel="noopener noreferrer"
					className="hover:opacity-80 transition-opacity"
				>
					<Image
						src="https://cdn.shapo.io/assets/icons/google.svg"
						alt="Google Reviews"
						width={20}
						height={20}
						className="w-8 h-8"
					/>
				</Link>
			</div>

			<p className="text-md text-black mt-2 line-clamp-3">{review.message}</p>

			{review.images && review.images.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-1">
					{review.images.map((image, imgIndex) => (
						<div key={`image-${imgIndex}`} className="rounded-lg overflow-hidden">
							<Image
								src={image}
								alt={`Image from ${review.name}`}
								width={50}
								height={25}
								className="object-cover"
							/>
						</div>
					))}
				</div>
			)}

			<div className="mt-1">
				<p className="text-sm text-gray-500">{formatDate(review.date)}</p>
			</div>
		</div>
	);
};

export default function GoogleReviews() {
	const [reviews, setReviews] = useState<Review[]>([]);

	useEffect(() => {
		fetch("/api/reviews")
			.then((res) => res.json())
			.then((data) => setReviews(Array.isArray(data) ? data : []))
			.catch((error) => console.error("Error loading reviews:", error));
	}, []);

	const half = Math.ceil(reviews.length / 2);
	const firstRow = [...reviews.slice(0, half), ...reviews.slice(0, half)];
	const secondRow = [...reviews.slice(half), ...reviews.slice(half)];

	return (
		<div className="relative overflow-hidden bg-gray-100 p-4 rounded-xl shadow-lg">
			<div className="relative py-2">
				<div className="flex w-max animate-marquee space-x-4 hover:animation-pause">
					{firstRow.map((review, index) => (
						<ReviewCard key={`row1-${index}`} review={review} index={index} rowId="row1" />
					))}
				</div>
				<div className="absolute left-[-2%] top-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 hidden md:block"></div>
				<div className="absolute right-[-2%] top-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 hidden md:block"></div>
			</div>

			<div className="relative py-2">
				<div className="flex w-max animate-marquee-reverse space-x-4 hover:animation-pause">
					{secondRow.map((review, index) => (
						<ReviewCard key={`row2-${index}`} review={review} index={index} rowId="row2" />
					))}
				</div>
				<div className="absolute left-[-2%] top-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 hidden md:block"></div>
				<div className="absolute right-[-2%] top-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 hidden md:block"></div>
			</div>

			<style>{`
               @keyframes marquee {
                   0% { transform: translateX(0); }
                   100% { transform: translateX(-50%); }
               }
               @keyframes marquee-reverse {
                   0% { transform: translateX(-50%); }
                   100% { transform: translateX(0); }
               }
               .animate-marquee {
                   display: flex;
                   animation: marquee 25s linear infinite;
               }
               .animate-marquee-reverse {
                   display: flex;
                   animation: marquee-reverse 25s linear infinite;
               }
               .hover\\:animation-pause:hover {
                   animation-play-state: paused;
               }
               .line-clamp-3 {
                   display: -webkit-box;
                   -webkit-line-clamp: 3;
                   -webkit-box-orient: vertical;
                   overflow: hidden;
                   text-overflow: ellipsis;
               }
               `}</style>
		</div>
	);
}
