import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0">
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/heropage/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 max-w-4xl">
        Join us on the road
        </h1>
        <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl">
          We're here to support you every step of the way
        </p>
        <Link
          href="/booking"
          className="btn-primary text-lg px-8 py-3"
        >
          Book a Lesson Now
        </Link>
      </div>
    </div>
  );
}
