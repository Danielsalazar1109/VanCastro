import React from 'react';
import PricingCard from './PricingCard';

interface PricingCardsProps {
  title?: string;
  showTitle?: boolean;
}

const PlansGrid: React.FC<PricingCardsProps> = ({ 
  title = "Our Driving Packages",
  showTitle = true 
}) => {
  const locations: string[] = ['Vancouver', 'North Vancouver', 'Surrey', 'Burnaby'];
  
  return (
    <div className="w-full">
      {showTitle && (
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* 1-Hour Package */}
        <PricingCard
          title="Hourly lesson"
          subtitle="1 Hour"
          price="75"
          durationPerLesson="60 mins/lesson"
          includesCar={true}
          includesPickupDropoff={true}
          licenseType="Class 5 or Class 7 license"
          locations={locations}
          isPopular={false}
          onBookingClick={() => console.log("Booking 1-hour package")}
        />
        
        {/* 10-Lesson Package */}

        <PricingCard
          title="Best for Beginner"
          subtitle="10 lessons"
          price="850"
          durationPerLesson="60 mins/lesson"
          includesCar={true}
          includesPickupDropoff={true}
          licenseType="Class 5 or Class 7 license"
          locations={locations}
          isPopular={true}
          onBookingClick={() => console.log("Booking 10-lesson package")}
        />
        
        {/* 3-Lesson Package */}

        <PricingCard
          title="90 mins class"
          subtitle="3 lessons"
          price="250"
          durationPerLesson="90 mins/lesson"
          includesCar={true}
          includesPickupDropoff={true}
          licenseType="Class 5 or Class 7 license"
          locations={locations}
          isPopular={false}
          onBookingClick={() => console.log("Booking 3-lesson package")}
        />
      </div>
    </div>
  );
};

export default PlansGrid;