import Link from 'next/link';

export default function PlansPage() {
  const plans = [
    {
      name: "Beginner Package",
      price: "$299",
      description: "Perfect for first-time drivers with no prior experience",
      features: [
        "5 hours of driving instruction",
        "Fundamentals of vehicle control",
        "Basic traffic rules and regulations",
        "Parking techniques",
        "Free theory test preparation materials"
      ],
      recommended: false,
      buttonText: "Choose Beginner Package"
    },
    {
      name: "Standard Package",
      price: "$499",
      description: "Our most popular option for learner drivers",
      features: [
        "10 hours of driving instruction",
        "Advanced maneuvers and techniques",
        "Highway and city driving practice",
        "Night driving session",
        "Mock driving test with feedback",
        "Free theory test preparation materials"
      ],
      recommended: true,
      buttonText: "Choose Standard Package"
    },
    {
      name: "Premium Package",
      price: "$799",
      description: "Comprehensive training for complete confidence",
      features: [
        "15 hours of driving instruction",
        "Personalized learning plan",
        "All driving conditions practice",
        "Advanced defensive driving techniques",
        "2 mock driving tests with detailed feedback",
        "Free theory test preparation materials",
        "Test day vehicle rental included"
      ],
      recommended: false,
      buttonText: "Choose Premium Package"
    },
    {
      name: "Refresher Course",
      price: "$199",
      description: "For licensed drivers who need to rebuild confidence",
      features: [
        "3 hours of driving instruction",
        "Focus on areas needing improvement",
        "Defensive driving techniques",
        "Update on current road rules",
        "Personalized feedback"
      ],
      recommended: false,
      buttonText: "Choose Refresher Course"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Driving Lesson Plans</h1>
      <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Choose the perfect driving lesson package to match your experience level and goals.
        All packages include instruction from our certified driving instructors.
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-lg shadow-lg overflow-hidden border ${
              plan.recommended ? 'border-primary-500' : 'border-gray-200'
            }`}
          >
            {plan.recommended && (
              <div className="bg-primary-500 text-white text-center py-2">
                Most Popular
              </div>
            )}
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-primary-600 mb-4">{plan.price}</div>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <ul className="space-y-2 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg 
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href={`/booking?plan=${encodeURIComponent(plan.name)}`}
                className={`block w-full text-center py-3 rounded-md ${
                  plan.recommended 
                    ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } transition-colors font-medium`}
              >
                {plan.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 max-w-3xl mx-auto bg-gray-100 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Custom Packages</h2>
        <p className="text-gray-600 mb-6">
          Need something more tailored to your specific needs? We offer custom packages 
          designed around your experience level, schedule, and goals.
        </p>
        <div className="flex justify-center">
          <Link href="/contact" className="btn-primary">
            Contact Us for Custom Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
