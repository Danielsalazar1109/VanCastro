'use client';

import Image from "next/image";
import Link from "next/link";
import PlansGrid from "@/components/plans/PlansGrid";
import LeftCharacter from "../../../public/plans/LeftCharacter.png";
import RightCharacter from "../../../public/plans/RightCharacter.png";
import ComputerMan from "../../../public/plans/ComputerMan.png";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, MessageCircle, Car, Globe, Clock} from "lucide-react";
import ContactForm from "@/components/contact/contactForm";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useEffect, useState, useRef } from "react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

export default function PlansPage() {
  const [isMobile, setIsMobile] = useState(false);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const paginationOptions = {
    clickable: true,
    renderBullet: function (index: number, className: string) {
      return `<span class="${className} swiper-pagination-bullet-custom"></span>`;
    }
  };

  interface Instructor {
    name: string;
    image: string;
    experience: string;
    languages: string;
    schedule: string;
  }

  const instructors = [
    {
      name: "Anderson",
      image: "https://framerusercontent.com/images/FLvYf83Xh4QeQmPkGlT1J5BCeg.png?scale-down-to=512", 
      experience: "25 years experience",
      languages: "English, Portuguese, Spanish",
      schedule: "Monday - Friday, 8a.m.-6p.m."
    },
    {
      name: "Andresa",
      image: "https://framerusercontent.com/images/Cucs1Au8fUHTABGitQoXRjuGEA.png?scale-down-to=512",
      experience: "25 years experience",
      languages: "English, Portuguese, Spanish",
      schedule: "Monday - Friday, 8a.m.-6p.m."
    }
  ];

  const InstructorCard = ({ instructor }: { instructor: Instructor }) => (
    <div className="border border-yellow-400 border-4 rounded-lg p-6 flex flex-col items-center md:w-2/3 mx-auto mb-16">
      <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden mb-4">
        <Image 
          src={instructor.image} 
          alt={instructor.name} 
          width={400} 
          height={400}
          className="object-cover"
        />
      </div>
      <h3 className="text-2xl font-bold mb-4">{instructor.name}</h3>
      <div className="space-y-3 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-black text-yellow-400 rounded-full p-1">
            <Car className="h-5 w-5" />
          </div>
          <span>{instructor.experience}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-black text-yellow-400 rounded-full p-1">
            <Globe className="h-5 w-5" />
          </div>
          <span>{instructor.languages}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-black text-yellow-400 rounded-full p-1">
            <Clock className="h-5 w-5" />
          </div>
          <span>{instructor.schedule}</span>
        </div>
      </div>
      <Link href="/contact" className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg w-full transition duration-300 text-center">
        Contact Us
      </Link>
    </div>
  );

  const scrollToContact = () => {
    if (contactSectionRef.current) {
      contactSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto">
      <style jsx>{`
        :global(.swiper-pagination-bullet) {
          background-color:rgb(101, 99, 99) !important;
          opacity: 0.5;
        }
        
        :global(.swiper-pagination-bullet-active) {
          background-color: #FFDD00 !important;
          opacity: 1;
        }
        
        :global(.swiper-pagination-bullet-custom) {
          width: 12px;
          height: 12px;
          margin: 0 5px;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative w-full md:h-screen mb-12">
        <div className="absolute inset-0 bg-bannerImg bg-repeat bg-cover bg-center opacity-60 md:opacity-100"></div>
        <div className="absolute inset-0 bg-blackOverlay"></div>
        <div className="relative w-full h-full flex flex-col justify-center py-16 md:py-0 z-10">
          <div className="md:w-1/2 md:ml-16 mx-auto">
            <h1 className="text-4xl md:text-7xl text-center md:text-left font-bold mb-6 text-white leading-tight">
              Find the right course for your journey!
            </h1>
            <p className="md:text-3xl text-xl text-center md:text-left text-gray-100 mb-8 w-4/6 md:w-full mx-auto md:mx-0">
              From beginner to advanced, we're here to guide you to confident driving, every step of the way.
            </p>
            <Link href="/booking" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-8 rounded-lg text-xl transition duration-300 md:w-1/3 mx-32 md:mx-0 inline-block text-center">
              Booking Now
            </Link>
          </div>
        </div>
      </section>
      
      {/* Plans */}
      <div className="w-full max-w-6xl mx-auto">
      <PlansGrid onSelectPackage={(link) => {
        window.location.href = `/booking?package=${encodeURIComponent(link)}`;
      }} />
      </div>
      
      {/* Contact Partner */}
      <div className="w-full bg-gray-50 py-12 px-4 my-8 rounded-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
          <div className="hidden md:block md:w-48">
            <Image
              src={LeftCharacter}
              alt="Character with phone"
              width={120}
              height={240}
              priority
            />
          </div>

          <div className="text-center flex-1 flex flex-col items-center">
            <p className="text-xl mb-2">
              <span className="text-yellow-500 font-semibold">Check out</span> our partner for
            </p>
            <h2 className="text-3xl md:text-4xl font-bold md:mb-8 mb-4"> 
              <span className="hidden md:inline">Taking the </span> <span className="text-blue-400">ICBC Knowledge Test</span>
              <br />Before Applying for a Class
            </h2>
            
            {/* Characters-mobile */}
            <div className="flex justify-center space-x-8 md:hidden my-6">
              <div className="w-20">
                <Image
                  src={LeftCharacter}
                  alt="Character with phone"
                  width={80}
                  height={160}
                  priority
                />
              </div>
              <div className="w-20">
                <Image
                  src={RightCharacter}
                  alt="Character with phone"
                  width={80}
                  height={160}
                  priority
                />
              </div>
            </div>
            
            <Link href="/contact" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition duration-300 md:w-1/3 w-full inline-block text-center">
              Contact Partner
            </Link>
          </div>

          <div className="hidden md:block md:w-48">
            <Image
              src={RightCharacter}
              alt="Character with phone"
              width={120}
              height={240}
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Instructor */}
      <div className="my-16 px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Expert Tutors Ready to Guide You!</h2>
        
        {isMobile ? (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={paginationOptions}
            autoplay={{ delay: 4000 }}
            className="mySwiper w-4/5 mx-auto"
          >
            {instructors.map((instructor, index) => (
              <SwiperSlide key={index}>
                <InstructorCard instructor={instructor} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 w-4/5 mx-auto">
            {instructors.map((instructor, index) => (
              <InstructorCard key={index} instructor={instructor} />
            ))}
          </div>
        )}
      </div>
      
      {/* Help */}
      <div className="w-full bg-yellow-400 py-12 px-4 my-12 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between">
          <div className="md:w-1/3 mb-8 md:mb-0">
            <Image
              src={ComputerMan}
              alt="Person at computer"
              width={350}
              height={350}
              className="object-contain"
            />
          </div>
          
          <div className="md:w-2/3 md:pl-12 md:ml-40 md:space-y-16">
            <h2 className="text-3xl text-center md:text-left md:text-4xl md:font-bold mb-4 text-gray-800">
              We're Here to Help<br />
              <span className="font-bold text-5xl md:text-4xl">Let's Customize Your Driving Plan! </span>
            </h2>
            <div className="flex flex-col items-center space-y-0">
              <span className="text-9xl text-white mx-48 md:hidden h-16"> " </span>
              <p className="text-2xl md:text-2xl md:mb-8 text-gray-800 px-6 md:px-0 md:text-left text-center ">
                Our courses are designed to fit the experience and 
                ability level of each individual learner.
              </p>
              <span className="text-9xl text-white mx-48 md:hidden"> " </span>
            </div>
            <Link href="/contact" className="hidden md:block bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-lg transition duration-300 w-full md:w-1/2 md:text-xl text-center">
              Contact Us
            </Link>
          </div>
        </div>
        
        {/* ContactButton-mobile */}
        <div className="block md:hidden mt-6 text-center">
          <Link href="/contact" className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-lg transition duration-300 w-full md:w-1/2 md:text-xl inline-block">
            Contact Us
          </Link>
        </div>
      </div>
      
      {/* Contact */}
      <div ref={contactSectionRef} className="flex flex-col md:flex-row bg-yellow-50 p-6 md:py-12 md:px-32 md:gap-16 rounded-lg">
        <div className="w-full md:w-1/2 pr-0 md:pr-8 mb-8 md:mb-0">
          <h1 className="text-5xl font-bold mb-2">Contact Us</h1>
          <p className="text-xl mb-8">Monday to Friday from 8a.m.-6p.m.</p>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="bg-black rounded-full p-3 mr-4">
                <Phone className="h-8 w-8 text-yellow-400" />
              </div>
              <span className="text-2xl">+1 604-600-9173</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-black rounded-full p-3 mr-4">
                <Phone className="h-8 w-8 text-yellow-400" />
              </div>
              <span className="text-2xl">+1 778-680-5613</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-black rounded-full p-3 mr-4">
                <Mail className="h-8 w-8 text-yellow-400" />
              </div>
              <span className="text-2xl">Vancastrodrivingschool@gmail.com</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-black rounded-full p-3 mr-4">
                <MapPin className="h-8 w-8 text-yellow-400" />
              </div>
              <span className="text-2xl">Vancouver, North Vancouver, Surrey, Burnaby</span>
            </div>
          </div>
          
          <div className="mt-12 mx-16 md:mx-0">
            <h2 className="text-2xl font-bold mb-6">Visit Our Social media</h2>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/p/Vancastro-Driving-School-100088028419878/#" className="bg-black rounded-full p-3">
                <Facebook className="h-8 w-8 text-yellow-400" />
              </a>
              
              <a href="https://www.instagram.com/vancastro_drivingschool/" className="bg-black rounded-full p-3">
                <Instagram className="h-8 w-8 text-yellow-400" />
              </a>
              
              <a href="https://www.youtube.com/@VanCastro_Driving_School" className="bg-black rounded-full p-3">
                <Youtube className="h-8 w-8 text-yellow-400" />
              </a>
              
              <a href="#" className="bg-black rounded-full p-3">
                <MessageCircle className="h-8 w-8 text-yellow-400" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/3 rounded-lg md:py-20">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}