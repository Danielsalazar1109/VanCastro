"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();
  return (
    <header className="bg-stone-900 shadow-sm py-3">
      <div className="container mx-auto px-6 flex items-center justify-between h-20">
        <Link href="/">
          <Image
            src="https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png"
            alt="VanCastro Driving School Logo"
            width={130}
            height={40}
          />
        </Link>

        <nav>
          <ul className="flex items-center space-x-8 text-lg">
            <li>
              <Link href="/" className="text-white hover:text-yellow-500 transition-colors duration-200">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/plans"
                className="text-white hover:text-yellow-500 transition-colors duration-200"
              >
                Plans
              </Link>
            </li>
            <li>
              <Link
                href="/booking"
                className="text-white hover:text-yellow-500 transition-colors duration-200"
              >
                Booking
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="text-white hover:text-yellow-500 transition-colors duration-200"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-white hover:text-yellow-500 transition-colors duration-200"
              >
                Contact
              </Link>
            </li>
            <li>
              {status === "authenticated" ? (
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-red-500 px-4 py-2 rounded-md text-white hover:text-gray-400 transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-white hover:text-yellow-500 transition-colors duration-200"
                >
                  <button className="btn-primary">Login</button>
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}