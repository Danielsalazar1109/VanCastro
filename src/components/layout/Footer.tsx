import Link from 'next/link';
import Image from 'next/image';
import { Phone, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';

export default function Footer() {
  interface FooterColumnProps {
    title: string;
    items: { label: string; link?: string }[]; 
  }

  const FooterColumn = ({ title, items }: FooterColumnProps) => (
    <div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={index} className="mb-2">
            {item.label.startsWith("Email:") || item.label.startsWith("Working hours:") ? (
              <span>
                <strong className="font-bold">{item.label.split(":")[0]}:</strong>{" "}
                <span>{item.label.split(":")[1]}</span>
              </span>
            ) : item.label.includes("+1") ? (
              <a href={item.link} className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                {item.label}
              </a>
            ) : item.label.includes("Phone") ? (
              <span className="font-bold">{item.label}</span>
            ) : item.link && title === "Vancastro" ? (
              <Link href={item.link} className='hover:text-yellow-400'>
                {item.label}
              </Link>
            ) : (
              <p>{item.label}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-stone-900 text-white py-16 px-32 w-full">
      <div className="container mx-auto">
      <div className="grid grid-cols-[auto_auto_1fr] gap-40">
          {/* Contact */}
          <FooterColumn
            title="Contact"
            items={[
              { label: "Phone" },
              { label: "+1 604-600-9173" },
              { label: "+1 778-680-5613"},
              { label: "Email: Vancastrodrivingschool@gmail.com"},
              { label: "Working hours: Monday to Friday 8a.m. - 6p.m." },
            ]}
          />
          
          {/* Location */}
          <FooterColumn
            title="Location"
            items={[
              { label: "Surrey"},
              { label: "Burnaby"},
              { label: "Vancouver"},
              { label: "North Vancouver"},
            ]}
          />
          
          {/* Vancastro and Logo Section */}
          <div className="flex flex-row justify-between">
            <FooterColumn
              title="Vancastro"
              items={[
                { label: "Home", link: "/" },
                { label: "Plans", link: "/plans" },
                { label: "FAQ", link: "/faq" },
                { label: "Contact", link: "/contact" },
              ]}
            />
            
            <div>
              {/* Logo */}
              <div className="mb-4">
                <Image
                  src="https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png"
                  alt="VanCastro Driving School"
                  width={200}
                  height={100}
                />
              </div>
              
              {/* Social Media Icons */}
              <div className="flex space-x-4">
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
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t-2 border-gray-500 mt-8 pt-4">
          <div className="flex flex-col md:flex-row md:justify-end items-center space-y-2 md:space-y-0 md:space-x-4">
              <Link href="/faq" className="text-lg">Copyright Policy</Link>
            <span className="hidden md:inline">|</span>
            <Link href="/faq" className="text-lg">Terms and Conditions</Link>
            <span className="hidden md:inline">|</span>
            <Link href="/faq" className="text-lg">Site Map</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
