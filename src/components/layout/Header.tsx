import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary-700">
          Driving School
        </Link>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-gray-600 hover:text-primary-600">
                Home
              </Link>
            </li>
            <li>
              <Link href="/plans" className="text-gray-600 hover:text-primary-600">
                Plans
              </Link>
            </li>
            <li>
              <Link href="/booking" className="text-gray-600 hover:text-primary-600">
                Book a Lesson
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-gray-600 hover:text-primary-600">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-600 hover:text-primary-600">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
