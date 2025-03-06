import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary-700 mb-4">
          Driving School Booking System
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Book your driving lessons online with our easy-to-use booking system.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-semibold mb-4">Learn to Drive with Confidence</h2>
          <p className="text-gray-600 mb-6">
            Our experienced instructors provide personalized lessons tailored to your needs.
            Whether you're a beginner or looking to improve your skills, we've got you covered.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary-100 p-2 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Flexible Scheduling</h3>
                <p className="text-gray-500">Choose from a variety of available time slots</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary-100 p-2 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Experienced Instructors</h3>
                <p className="text-gray-500">Learn from certified professionals</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary-100 p-2 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Secure Online Payment</h3>
                <p className="text-gray-500">Pay securely with our integrated payment system</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Link
              href="/booking"
              className="btn-primary inline-block"
            >
              Book a Lesson Now
            </Link>
          </div>
        </div>
        <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Driving Lesson Image Placeholder</p>
          </div>
        </div>
      </div>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-center mb-8">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Beginner Lessons',
              description:
                'Perfect for first-time drivers looking to build confidence and skills from scratch.',
              price: '$50',
            },
            {
              title: 'Refresher Courses',
              description:
                'For licensed drivers who want to improve their skills or overcome specific challenges.',
              price: '$45',
            },
            {
              title: 'Test Preparation',
              description:
                'Focused lessons to prepare you for your driving test with practice on test routes.',
              price: '$55',
            },
          ].map((service, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-primary-700 font-bold text-xl">{service.price}/hour</span>
                <Link
                  href="/booking"
                  className="text-primary-600 hover:text-primary-800 font-medium"
                >
                  Book Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: '1',
              title: 'Choose a Service',
              description: 'Select the type of driving lesson you need',
            },
            {
              step: '2',
              title: 'Pick a Time Slot',
              description: 'Browse available times and select one that works for you',
            },
            {
              step: '3',
              title: 'Complete Booking',
              description: 'Fill out your details and make a secure payment',
            },
            {
              step: '4',
              title: 'Get Confirmation',
              description: 'Receive booking confirmation and instructions via email',
            },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-700 font-bold">{item.step}</span>
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
