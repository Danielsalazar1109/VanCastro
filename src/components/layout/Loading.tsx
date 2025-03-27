import React from 'react';

const LoadingComponent = ({ 
  gifUrl = "https://media.tenor.com/75ffA59OV-sAAAAM/broke-down-red-car.gif", 
  showText = true 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <div className="w-full h-96 flex items-center justify-center overflow-hidden">
        <img 
          src={gifUrl}
          alt="Loading"
          className="object-contain max-w-full max-h-full"
          style={{ 
            imageRendering: 'crisp-edges', 
            transform: 'scale(1.5)' 
          }}
        />
      </div>
      
      {showText && (
        <p className="mt-8 text-gray-600 text-4xl font-bold">
          Loading
        </p>
      )}
    </div>
  );
};

export default LoadingComponent;