'use client';

import { useEffect, useState } from "react";
import Image from "next/image";

interface Review {
    name: string;
    rating: number;
    message: string;
    profileImage: string;
    link: string;
    images?: string[]; // Cambiado a un array de strings
}

export default function GoogleReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        fetch("/api/reviews")
            .then((res) => res.json())
            .then((data) => setReviews(Array.isArray(data) ? data : []))
            .catch((error) => console.error("Error al cargar reseñas:", error));
    }, []);

    // Dividimos las reseñas en 2 filas
    const half = Math.ceil(reviews.length / 2);
    const firstRow = [...reviews.slice(0, half), ...reviews.slice(0, half)]; // Duplica para loop infinito
    const secondRow = [...reviews.slice(half), ...reviews.slice(half)]; // Duplica para loop infinito

    return (
        <div className="relative overflow-hidden bg-gray-100 p-6 rounded-xl shadow-lg space-y-6">
            {/* Primera fila */}
            <div className="flex w-max animate-marquee space-x-6">
                {firstRow.map((review, index) => (
                    <div key={`row1-${index}`} className="flex flex-col bg-white p-6 rounded-lg shadow-md min-w-[350px] max-w-[400px] h-[350px]">
                        <div className="flex items-center space-x-4">
                            <img
                                src={review.profileImage}
                                alt={review.name}
                                className="w-14 h-14 rounded-full border-2 border-gray-300 object-cover"
                            />
                            <div>
                                <p className="text-lg font-semibold">{review.name}</p>
                                <p className="text-sm text-yellow-500">⭐ {review.rating} / 5</p>
                            </div>
                        </div>
                        {/* Limitar a 4 líneas de texto */}
                        <p className="text-sm text-black mt-2 line-clamp-4">{review.message}</p>

                        {/* Imágenes debajo del texto */}
                        <div className="mt-4 space-y-2">
                            {review.images && review.images.map((image, imgIndex) => (
                                <div key={`image-${imgIndex}`} className="rounded-lg overflow-hidden w-full max-w-xl">
                                    <Image
                                        src={image}
                                        alt={`Imagen de ${review.name}`}
                                        width={0.1}
                                        height={0.1}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Segunda fila (en sentido contrario) */}
            <div className="flex w-max animate-marquee-reverse space-x-6">
                {secondRow.map((review, index) => (
                    <div key={`row2-${index}`} className="flex flex-col bg-white p-6 rounded-lg shadow-md min-w-[350px] max-w-[400px] h-[350px]">
                        <div className="flex items-center space-x-4">
                            <img
                                src={review.profileImage}
                                alt={review.name}
                                className="w-14 h-14 rounded-full border-2 border-gray-300 object-cover"
                            />
                            <div>
                                <p className="text-lg font-semibold">{review.name}</p>
                                <p className="text-sm text-yellow-500">⭐ {review.rating} / 5</p>
                            </div>
                        </div>
                        {/* Limitar a 4 líneas de texto */}
                        <p className="text-sm text-black mt-2 line-clamp-4">{review.message}</p>

                        {/* Imágenes debajo del texto */}
                        <div className="mt-4 flex flex-row">
                            {review.images && review.images.map((image, imgIndex) => (
                                <div key={`image-${imgIndex}`} className="flex flex-row w-full rounded-lg overflow-hidden ">
                                    <Image
                                        src={image}
                                        alt={`Imagen de ${review.name}`}
                                        width={40}
                                        height={40}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Animaciones de Tailwind */}
            <style>{
                `
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
                /* Limitar el texto a 4 líneas */
                .line-clamp-4 {
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                `
            }</style>
        </div>
    );
}