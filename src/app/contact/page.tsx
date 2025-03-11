import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, MessageCircle, Phone} from 'lucide-react';
import ContactForm from '../../components/contact/contactForm';

const Contact = () => {
  return (
    <div className="w-full bg-gray-50 py-16 px-4 md:px-8 lg:px-16 space-y-24">
      <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Contact Information Card */}
        <div className="w-full md:w-1/2 max-w-lg">
          <div className="border border-yellow-400 border-2 rounded-lg p-8 bg-white shadow-md">
            <div className="mb-6 flex flex-row space-x-4">
              <p className="font-bold text-lg">Phone</p>
              <div className="flex flex-col">
                <div className="flex items-center mt-2">
                  <Phone /> <p className="ml-2 hover:text-yellow-600"> +1 (604)-600-9173</p>
                </div>
                <div className="flex items-center mt-2">
                  <Phone /> <p className="ml-2 hover:text-yellow-600"> +1 (778)-680-5613</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6 flex flex-row space-x-1">
              <p className="font-bold text-lg">Email</p>
              <span className="inline font-extrabold mt-1">|</span>
              <a href="mailto:Vancastrodrivingschool@gmail.com" className="hover:text-yellow-600 mt-1" >
                Vancastrodrivingschool@gmail.com
              </a>
            </div>
            
            <div className="mb-6">
              <p className="font-bold text-lg">Working hours</p>
              <p>Monday to Friday 8a.m. - 6p.m.</p>
            </div>
            
            <div className="mb-6">
              <p className="font-bold text-lg">Service location</p>
              <ul className="mt-1">
                <li>Surrey</li>
                <li>Burnaby</li>
                <li>Vancouver</li>
                <li>North Vancouver</li>
              </ul>
            </div>
            
            <div>
              <p className="font-bold text-lg mb-2">Social media</p>
              <div className="flex space-x-3">
                <Link href="https://www.facebook.com/p/Vancastro-Driving-School-100088028419878/" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2 hover:bg-yellow-400 transition-colors">
                  <Facebook className="h-5 w-5 text-yellow-300" />
                </Link>
                <Link href="https://www.instagram.com/vancastro_drivingschool/" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2 hover:bg-yellow-400 transition-colors">
                  <Instagram className="h-5 w-5 text-yellow-300" />
                </Link>
                <Link href="https://www.youtube.com/@VanCastro_Driving_School" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2 hover:bg-yellow-400 transition-colors">
                  <Youtube className="h-5 w-5 text-yellow-300" />
                </Link>
                <Link href="#" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2 hover:bg-yellow-400 transition-colors">
                  <MessageCircle className="h-5 w-5 text-yellow-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Image Section */}
        <div className="w-full md:w-1/2 relative">
          <div className="relative">
            {/* Instructors image */}
            <Image
              src="https://framerusercontent.com/images/LzrGRfUSpTkXyzYfisvdvL2yvA.png?scale-down-to=1024"
              alt="VanCastro Driving School Instructors"
              width={545}
              height={545}
            />
            
            {/* Logo overlay circle - positioned at bottom right */}
            <div className="absolute -bottom-10 right-28 bg-stone-800 rounded-full w-56 h-56 flex items-center justify-center z-10">
              <Image
                src="https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png"
                alt="VanCastro Driving School Logo"
                width={150}
                height={80}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Need help with the</h2>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">ICBC Knowledge Test?</h2>
          <p className="text-lg mb-8">Connect with Our Partner!</p>
          
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-16">
            <div className="mb-4">
              <p className="font-bold text-lg">Phone</p>
              <div className="flex items-center justify-center mt-2">
                <Phone size={18} />
                <p className="ml-2">+1 (236)-515-2741</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="font-bold text-lg">Email</p>
              <a href="mailto:icbcknowledgetestmaterial@gmail.com" className="hover:underline">
                icbcknowledgetestmaterial@gmail.com
              </a>
            </div>
            
            <div>
              <p className="font-bold text-lg mb-2">Social media</p>
              <div className="flex justify-center space-x-4">
                <Link href="#" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2 hover:bg-yellow-400 transition-colors">
                  <Facebook className="h-5 w-5 text-yellow-300" />
                </Link>
                <Link href="#" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2 hover:bg-yellow-400 transition-colors">
                  <Instagram className="h-5 w-5 text-yellow-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Form Section */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-1">Question ?</h2>
          <p className="text-2xl md:text-3xl font-bold mb-8">Let us know !</p>
          
          {/* Usamos el componente ContactForm con el email específico para ICBC */}
          <ContactForm recipientEmail="vancastroadmi@gmail.com" />
        </div>
      </div>
  );
};

export default Contact;