"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PlansGrid from "@/components/plans/PlansGrid";

export default function BookingPage() {
  const searchParams = useSearchParams();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  
  useEffect(() => {
    const packageParam = searchParams.get('package');
    if (packageParam) {
      setSelectedPackage(packageParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedPackage) return;
    
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script && script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [selectedPackage]);

  const handleSelectPackage = (link: string) => {
    setSelectedPackage(link);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white py-10">
      {!selectedPackage && (
        <PlansGrid onSelectPackage={handleSelectPackage} />
      )}

      {selectedPackage && (
        <div className="my-12 w-full flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-8">Schedule Your Lesson</h2>
          <div className="w-full max-w-6xl h-[700px]">
            <div
              key={selectedPackage}
              className="calendly-inline-widget"
              data-url={selectedPackage}
              style={{ minWidth: '320px', height: '700px' }}
            ></div>
          </div>
          <button 
            onClick={() => setSelectedPackage(null)} 
            className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            Choose Another Package
          </button>
        </div>
      )}
    </div>
  );
}