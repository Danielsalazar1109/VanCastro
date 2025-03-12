import Link from 'next/link';
import Image from 'next/image';
import { Phone, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import FooterColumn from '../footer/footerColumn';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white pt-12 pb-4 px-4 md:px-32 w-full">
      <div className="container mx-auto">
        {/* Logo Mobile */}
        <div className="flex justify-center md:hidden mb-8">
          <div className="text-center">
            <div className="mb-4">
              <Image
                src="https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png"
                alt="VanCastro Driving School"
                width={200}
                height={100}
              />
            </div>
            
            {/* Social Media Icons */}
            <div className="flex justify-center space-x-4">
              <Link href="https://www.facebook.com/p/Vancastro-Driving-School-100088028419878/" target="_blank" rel="noopener noreferrer" className="bg-yellow-400 rounded-full p-2 hover:bg-yellow-500">
                <Facebook className="h-6 w-6 text-gray-900" />
              </Link>
              <Link href="https://www.instagram.com/vancastro_drivingschool/" target="_blank" rel="noopener noreferrer" className="bg-yellow-400 rounded-full p-2 hover:bg-yellow-500">
                <Instagram className="h-6 w-6 text-gray-900" />
              </Link>
              <Link href="https://www.youtube.com/@VanCastro_Driving_School" target="_blank" rel="noopener noreferrer" className="bg-yellow-400 rounded-full p-2 hover:bg-yellow-500">
                <Youtube className="h-6 w-6 text-gray-900" />
              </Link>
              <Link href="#" className="bg-yellow-400 rounded-full p-2 hover:bg-yellow-500">
                <MessageCircle className="h-6 w-6 text-gray-900" />
              </Link>
            </div>
          </div>
        </div>

        <div className="md:grid md:grid-cols-12 md:gap-16">
          {/* Contact mobile*/}
          <div className="mb-8 md:mb-0 md:col-span-4">
            <div className="md:hidden text-center">
              <FooterColumn
                title="Contact"
                items={[
                  { label: "Phone" },
                  { label: "+1 604-600-9173" },
                  { label: "+1 778-680-5613" },
                  { label: "Email: Vancastrodrivingschool@gmail.com" },
                  { label: "Working hours: Monday to Friday 8a.m. - 6p.m." },
                ]}
                isMobile={true}
              />
            </div>
            
            {/* Contact Desktop */}
            <div className="hidden md:block">
              <FooterColumn
                title="Contact"
                items={[
                  { label: "Phone" },
                  { label: "+1 604-600-9173" },
                  { label: "+1 778-680-5613" },
                  { label: "Email: Vancastrodrivingschool@gmail.com" },
                  { label: "Working hours: Monday to Friday 8a.m. - 6p.m." },
                ]}
              />
            </div>
          </div>
          
          {/* Location and Vancastro mobile */}
          <div className="flex flex-row justify-between md:block mb-8 md:mb-0 md:col-span-3">
            {/* Location */}
            <div className="w-1/2 pr-4 md:pr-0">
              <FooterColumn
                title="Location"
                items={[
                  { label: "Surrey" },
                  { label: "Burnaby" },
                  { label: "Vancouver" },
                  { label: "North Vancouver" },
                ]}
              />
            </div>
            
            {/* Vancastro*/}
            <div className="w-1/2 md:hidden">
              <FooterColumn
                title="Vancastro"
                items={[
                  { label: "Home", link: "/" },
                  { label: "Plans", link: "/plans" },
                  { label: "FAQ", link: "/faq" },
                  { label: "Contact", link: "/contact" },
                ]}
              />
            </div>
          </div>
          
          {/* Vancastro and Logo Desktop */}
          <div className="hidden md:flex md:justify-between md:col-span-5">
            <div>
              <FooterColumn
                title="Vancastro"
                items={[
                  { label: "Home", link: "/" },
                  { label: "Plans", link: "/plans" },
                  { label: "FAQ", link: "/faq" },
                  { label: "Contact", link: "/contact" },
                ]}
              />
            </div>
            
            {/* Logo Desktop */}
            <div>
              <div className="mb-8">
                <Image
                  src="https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png"
                  alt="VanCastro Driving School"
                  width={200}
                  height={100}
                />
              </div>
              
              {/* Social Media Icons */}
              <div className="flex space-x-4">
                <Link href="https://www.facebook.com/p/Vancastro-Driving-School-100088028419878/" target="_blank" rel="noopener noreferrer" className="bg-yellow-400 rounded-full p-2">
                  <Facebook className="h-6 w-6 text-gray-900" />
                </Link>
                <Link href="https://www.instagram.com/vancastro_drivingschool/" target="_blank" rel="noopener noreferrer" className="bg-yellow-400 rounded-full p-2">
                  <Instagram className="h-6 w-6 text-gray-900" />
                </Link>
                <Link href="https://www.youtube.com/@VanCastro_Driving_School" target="_blank" rel="noopener noreferrer" className="bg-yellow-400 rounded-full p-2">
                  <Youtube className="h-6 w-6 text-gray-900" />
                </Link>
                <Link href="#" className="bg-yellow-400 rounded-full p-2">
                  <MessageCircle className="h-6 w-6 text-gray-900" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t-2 border-gray-500 mt-8 pt-4 md:w-full w-full md:mx-0 mx-auto">
          <div className="flex flex-row md:justify-end justify-center space-y-0 md:space-x-4 space-x-3">
            <Link href="/faq" className="md:text-lg">Copyright Policy</Link>
            <span className="inline">|</span>
            <Link href="/faq" className="md:text-lg">Terms and Conditions</Link>
            <span className="inline">|</span>
            <Link href="/faq" className="md:text-lg">Site Map</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}