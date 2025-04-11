"use client";

import AlumniReview from "@/components/home/alumniReview";

const TestimonialsSection = () => {
	const testimonials = [
		{
			name: "João Victor",
			location: "Vancouver",
			timeAgo: "a month ago",
			courseType: "Switch licence",
			lessonDuration: "8 hours lesson",
			testimonialText:
				"I took lessons with Anderson, and he is an excellent instructor. He gave me all the tips I needed to pass on the first attempt. I highly recommend Vancastro to everyone.",
			studentImage: "https://framerusercontent.com/images/Cly5aCWN5Ww0138GkXyIrRAL5Q.jpg?scale-down-to=1024",
			rating: 5,
		},
		{
			name: "Najla Angeline",
			location: "Vancouver",
			timeAgo: "a month ago",
			courseType: "Switch licence",
			lessonDuration: "3 hours lesson",
			testimonialText:
				"O Anderson foi extremamente paciente atencioso desde o primeiro dia! Corrigiu perfeitamente todos os meus erros e me ensinou cada detalhe! Consegui minha driver's license na primeira tentativa! Super recomendo o trabalho dele",
			studentImage: "https://framerusercontent.com/images/BLkXveQUob3CPx2PerOrmEVAc.jpg?scale-down-to=1024",
			rating: 5,
		},
		{
			name: "Gabriel",
			location: "North Vancouver",
			timeAgo: "a month ago",
			courseType: "Beginner",
			lessonDuration: "10 hours lesson",
			testimonialText:
				"Vancastro driving school is the reason I passed my driver's test. Andresa is an amazing teacher and is so supportive. I would 100% recommend Vancastro Driving School to everyone!",
			studentImage: "https://framerusercontent.com/images/0eeZj07HWCLyeA74jr1NRRNrY80.jpg?scale-down-to=1024",
			rating: 5,
		},
	];

	const repeatedTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

	return (
		<div className="testimonials-section py-10 overflow-hidden bg-gray-100 p-4 rounded-xl shadow-lg">
			<div className="relative py-2">
				<div className="flex w-max animate-marquee space-x-4 hover:animation-pause">
					{repeatedTestimonials.map((testimonial, index) => (
						<AlumniReview key={`testimonial-${index}`} testimonial={testimonial} />
					))}
				</div>
				<div className="absolute left-[-2%] top-0 w-32 h-full bg-gradient-to-r from-gray-100 to-transparent z-10 hidden md:block"></div>
				<div className="absolute right-[-2%] top-0 w-32 h-full bg-gradient-to-l from-gray-100 to-transparent z-10 hidden md:block"></div>
			</div>

			<style jsx>{`
				@keyframes marquee {
					0% {
						transform: translateX(0);
					}
					100% {
						transform: translateX(calc(-100% / 4));
					}
				}
				.animate-marquee {
					animation: marquee 30s linear infinite;
				}
				.hover\\:animation-pause:hover {
					animation-play-state: paused;
				}
			`}</style>
		</div>
	);
};

export default TestimonialsSection;
