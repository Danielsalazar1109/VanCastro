import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">Booking Cancelled</h1>
        <p className="text-gray-600 mb-8">
          Your booking process has been cancelled and no payment has been processed.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/booking" className="btn-primary">
            Try Again
          </Link>
          <Link href="/" className="btn-secondary">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
