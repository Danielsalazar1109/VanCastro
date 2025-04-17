'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PrivacyPolicy() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: April 17, 2025
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Introduction</h2>
          <p className="mb-4">
            We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">The Data We Collect About You</h2>
          <p className="mb-4">
            Personal data, or personal information, means any information about an individual from which that person can be identified. We collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes email address, telephone numbers, and address.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Profile Data</strong> includes your username and password, bookings made by you, your interests, preferences, feedback, and survey responses.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website and services.</li>
            <li><strong>Driving License Information</strong> includes confirmation that you possess a valid learner's permit or driver's license.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">How We Use Your Personal Data</h2>
          <p className="mb-4">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>
          <p className="mb-4">
            Specifically, we use your data to:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Provide and manage your driving lessons</li>
            <li>Communicate with you about your bookings</li>
            <li>Process payments</li>
            <li>Improve our services</li>
            <li>Comply with legal requirements</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Data Security</h2>
          <p className="mb-4">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Data Retention</h2>
          <p className="mb-4">
            We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Your Legal Rights</h2>
          <p className="mb-4">
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Request access to your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request erasure of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of processing your personal data</li>
            <li>Request transfer of your personal data</li>
            <li>Right to withdraw consent</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Cancellation Policy</h2>
          <p className="mb-4">
            Students can cancel their bookings free of charge if the cancellation is made more than 24 hours before the scheduled lesson. However, if a cancellation is made less than 24 hours before the scheduled lesson, a cancellation fee of $30 CAD will be applied.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <p className="mb-4">
            Email: privacy@drivingschool.com<br />
            Phone: (123) 456-7890
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}