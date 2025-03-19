import Image from "next/image";

interface Testimonial {
    name: string;
    location: string;
    timeAgo: string;
    courseType: string;
    lessonDuration: string;
    testimonialText: string;
    studentImage: string;
    rating: number;
}

const AlumniReview = ({ testimonial }: { testimonial: Testimonial }) => {
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<span key={i} className="text-yellow-400 text-2xl">★</span>);
            } else {
                stars.push(<span key={i} className="text-gray-300 text-2xl">★</span>);
            }
        }
        return stars;
    };
    
    return (
        <div className="flex-shrink-0 w-80 rounded-xl overflow-hidden bg-white shadow-md border border-yellow-400">
            <div className="p-4">
                <h3 className="text-xl font-bold">{testimonial.name}</h3>
                <p className="text-gray-600">{testimonial.location}, {testimonial.timeAgo}</p>
                
                <div className="flex space-x-2 mt-2">
                    <span className="bg-yellow-300 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {testimonial.courseType}
                    </span>
                    <span className="bg-yellow-300 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {testimonial.lessonDuration}
                    </span>
                </div>
                
                <div className="mt-4">
                    <Image 
                        src={testimonial.studentImage}
                        alt={testimonial.name}
                        width={300}
                        height={300}
                        className="rounded-lg w-full h-60 object-cover"
                    />
                </div>
                
                <div className="mt-3 flex">
                    {renderStars(testimonial.rating)}
                </div>
                
                <p className="mt-3 text-gray-800">
                    {testimonial.testimonialText}
                </p>
            </div>
        </div>
    );
};

export default AlumniReview;