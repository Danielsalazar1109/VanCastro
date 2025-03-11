import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video/Image placeholder - gradient background for now */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-stone-800">
        {/* This div will be replaced with a video or image later */}
        <div className="absolute inset-0 flex items-center justify-center text-white opacity-20">
          <p className="text-9xl font-bold">VIDEO</p>
        </div>
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
