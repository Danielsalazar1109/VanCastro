'use client';

import React, { useEffect, useState } from 'react';
import PricingCard from './PricingCard';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Importar estilos de Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";



interface PricingCardsProps {
  title?: string;
  showTitle?: boolean;
}

const PlansGrid: React.FC<PricingCardsProps> = ({
  title = "Pick What Fits You Best",
  showTitle = true
}) => {
  const locations: string[] = ['Vancouver', 'North Vancouver', 'Surrey', 'Burnaby'];
  const [isMobile, setIsMobile] = useState(false);

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

  const pricingPlans = [
    {
      title: "Hourly lesson",
      subtitle: "1 Hour",
      price: "75",
      durationPerLesson: "60 mins/lesson",
      includesCar: true,
      includesPickupDropoff: true,
      licenseType: "Class 5 or Class 7 license",
      locations: locations,
      isPopular: false
    },
    {
      title: "Best for Beginner",
      subtitle: "10 lessons",
      price: "850",
      durationPerLesson: "60 mins/lesson",
      includesCar: true,
      includesPickupDropoff: true,
      licenseType: "Class 5 or Class 7 license",
      locations: locations,
      isPopular: true
    },
    {
      title: "90 mins class",
      subtitle: "3 lessons",
      price: "250",
      durationPerLesson: "90 mins/lesson",
      includesCar: true,
      includesPickupDropoff: true,
      licenseType: "Class 5 or Class 7 license",
      locations: locations,
      isPopular: false
    }
  ];
  
  return (
    <div className="w-full">
      <style jsx>{`
        :global(.swiper-pagination-bullet) {
          background-color:rgb(101, 99, 99) !important; /* Color amarillo */
          opacity: 0.5;
        }
        
        :global(.swiper-pagination-bullet-active) {
          background-color: #FFDD00 !important; /* Color amarillo */
          opacity: 1;
        }
        
        :global(.swiper-pagination-bullet-custom) {
          width: 12px;
          height: 12px;
          margin: 0 5px;
        }
      `}</style>

      {showTitle && (
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">{title}</h2>
      )}
      
      {isMobile ? (
        <div>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={paginationOptions}
            autoplay={{ delay: 4000 }}
            className={`mySwiper w-4/5 mx-auto`}
          >
            {pricingPlans.map((plan, index) => (
              <SwiperSlide key={index} className="py-4 px-2">
                <PricingCard
                  title={plan.title}
                  subtitle={plan.subtitle}
                  price={plan.price}
                  durationPerLesson={plan.durationPerLesson}
                  includesCar={plan.includesCar}
                  includesPickupDropoff={plan.includesPickupDropoff}
                  licenseType={plan.licenseType}
                  locations={plan.locations}
                  isPopular={plan.isPopular}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className={`swiper-pagination`}></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-2/3 mx-auto">

          {/* Refresher Course */}
          <PricingCard
            title="Refresher Course"
            subtitle="1 Hour"
            price="0"
            durationPerLesson="60 mins/lesson"
            includesCar={true}
            includesPickupDropoff={true}
            licenseType="Class 5 or Class 7 license"
            locations={locations}
            isPopular={false}
          />
          
          {/* Beginner Lesson */}
          <PricingCard
            title="Beginner Lesson"
            subtitle="1 Hour"
            price="0"
            durationPerLesson="60 mins/lesson"
            includesCar={true}
            includesPickupDropoff={true}
            licenseType="Class 5 or Class 7 license"
            locations={locations}
            isPopular={true}
          />
          
          {/* Driving Lesson */}
          <PricingCard
            title="Driving lesson"
            subtitle="1 hour"
            price="0"
            durationPerLesson="60 mins/lesson"
            includesCar={true}
            includesPickupDropoff={true}
            licenseType="Class 5 or Class 7 license"
            locations={locations}
            isPopular={false}
          />
        </div>
      )}
    </div>
  );
};

export default PlansGrid;