import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, MessageCircle, Phone, Mail , MapPin} from 'lucide-react';
import ContactForm from '../../components/contact/contactForm';

const Contact = () => {
  return (
    <div className="w-full bg-gray-50 py-8">
    {/* Mobile Contact Card */}
    <div className="md:hidden">
    <div className="w-full max-w-md mx-auto px-4 mb-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-4">Contact us</h2>
          <p className="text-sm text-center text-gray-600 mb-6">Monday to Friday from 8a.m.-6p.m.</p>
          
          {/* Phone Numbers */}
          <div className="flex items-center mb-4 bg-yellow-50 p-3 rounded-lg">
            <div className="bg-black rounded-full p-2 mr-3">
              <Phone className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm">+1 604-600-9173</p>
              <p className="text-sm">+1 778-680-5613</p>
            </div>
          </div>
          
          {/* Email */}
          <div className="flex items-center mb-4 bg-yellow-50 p-3 rounded-lg">
            <div className="bg-black rounded-full p-2 mr-3">
              <Mail className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm break-all">vancastrodrivingschool@gmail.com</p>
            </div>
          </div>
          
          {/* Locations */}
          <div className="flex items-start mb-4 bg-yellow-50 p-3 rounded-lg">
            <div className="bg-black rounded-full p-2 mr-3 mt-1">
              <MapPin className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm">Vancouver, North Vancouver, Surrey, Burnaby</p>
            </div>
          </div>
          
          {/* Social Media */}
          <div className="mt-6">
            <h3 className="text-center font-semibold mb-4">Visit Our Social media</h3>
            <div className="flex justify-center space-x-3">
              <Link href="https://www.facebook.com/p/Vancastro-Driving-School-100088028419878/" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2">
                <Facebook className="h-5 w-5 text-yellow-400" />
              </Link>
              <Link href="https://www.instagram.com/vancastro_drivingschool/" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2">
                <Instagram className="h-5 w-5 text-yellow-400" />
              </Link>
              <Link href="https://www.youtube.com/@VanCastro_Driving_School" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2">
                <Youtube className="h-5 w-5 text-yellow-400" />
              </Link>
              <Link href="#" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2">
                <MessageCircle className="h-5 w-5 text-yellow-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ICBC Knowledge Test Partner Card */}
    <div className="w-full max-w-md mx-auto px-4 mb-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-blue-200 border-dashed">
        <div className="p-6">
          <h2 className="text-lg font-bold text-center mb-1">Need help with the</h2>
          <h2 className="text-lg font-bold text-center mb-2">ICBC Knowledge Test?</h2>
          <p className="text-center mb-6 text-sm">Connect with Our Partner!</p>
          
          {/* Phone Number */}
          <div className="flex items-center mb-4">
            <div className="bg-black rounded-full p-2 mr-3">
              <Phone className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm">+1 (236) 515-2741</p>
            </div>
          </div>
          
          {/* Email */}
          <div className="flex items-center mb-6">
            <div className="bg-black rounded-full p-2 mr-3">
              <Mail className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm break-all">icbcknowledgetestmaterial@gmail.com</p>
            </div>
          </div>
          
          {/* Social Media */}
          <div>
            <h3 className="text-center font-semibold mb-3">Social media</h3>
            <div className="flex justify-center space-x-3">
              <Link href="#" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2">
                <Facebook className="h-5 w-5 text-yellow-400" />
              </Link>
              <Link href="#" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2">
                <Instagram className="h-5 w-5 text-yellow-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Contact Form */}
    <div className="w-full max-w-md mx-auto px-4">
    <ContactForm />
    </div>
    </div>

    <div className="w-full bg-gray-50 py-16 space-y-24 hidden md:block">
      <div className="w-full mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
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
                <a href="mailto:Vancastroadmi@gmail.com" className="hover:text-yellow-600 mt-1" >
                Vancastrodrivingschool@gmail.com
                </a>
              </div>
              
              <div className="mb-6 flex flex-row space-x-1">
               <p className="font-bold text-lg">Working hours</p>
               <span className="inline font-extrabold mt-1">|</span>
               <p className="hover:text-yellow-600 mt-1">Monday to Friday 8a.m. - 6p.m.</p>
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
              <Image
                src="https://framerusercontent.com/images/LzrGRfUSpTkXyzYfisvdvL2yvA.png?scale-down-to=1024"
                alt="VanCastro Driving School Instructors"
                width={545}
                height={545}
              />
              <div className="absolute -bottom-8 right-12 bg-stone-800 rounded-full w-56 h-56 flex items-center justify-center z-10">
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

      {/* ICBC Knowledge Test Partner Section - Now with full width */}
      <div className="w-full px-4 mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-2 text-center">Need help with the</h2>
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center">ICBC Knowledge Test?</h2>
        <p className="text-3xl mb-8 text-center">Connect with Our Partner!</p>
        
        <div className="w-full max-w-xl mx-auto bg-white rounded-lg shadow-md p-6 mb-16">
          <div className="grid grid-cols-1 gap-8">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-2xl">Phone</p>
              <div className="flex items-center mt-2">
                <Phone size={24} />
                <p className="ml-2 text-xl">+1 (236)-515-2741</p>
              </div>
            </div>
            
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-2xl">Email</p>
              <a href="mailto:icbcknowledgetestmaterial@gmail.com" className="hover:underline text-xl">
                icbcknowledgetestmaterial@gmail.com
              </a>
            </div>
            
            <div>
              <p className="font-bold text-2xl mb-2 ">Social media</p>
              <div className="flex space-x-4">
                <Link href="#" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2 hover:bg-yellow-400 transition-colors">
                  <Facebook className="h-8 w-8 text-yellow-300" />
                </Link>
                <Link href="#" target="_blank" rel="noopener noreferrer" className="bg-black rounded-full p-2 hover:bg-yellow-400 transition-colors">
                  <Instagram className="h-8 w-8 text-yellow-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Form Section */}
      <div className="w-full">
        <h2 className="text-2xl md:text-5xl font-bold mb-1 text-center">Question ?</h2>
        <p className="text-2xl md:text-5xl font-bold mb-8 text-center">Let us know !</p>

        {/* Contact Form */}
        <div className="w-full max-w-7xl mx-auto">
          <ContactForm recipientEmail="vancastroadmi@gmail.com" />
        </div>
      </div>
    </div>
    </div>
  );
};

export default Contact;