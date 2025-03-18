import Image from 'next/image';

interface WhyCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

function WhyCard({ title, description, imageSrc, imageAlt }: WhyCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <div className="flex justify-center mb-4">
        <div className="relative w-16 h-16">
          <Image 
            src={imageSrc} 
            alt={imageAlt} 
            fill 
            className="object-contain"
          />
        </div>
      </div>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
}

export default function WhySection() {
  const whyItems = [
    {
      title: "Flexible Scheduling",
      description: "Choose times and locations that suit you with a plan.",
      imageSrc: "/WhySection/img1.png",
      imageAlt: "Flexible Scheduling icon"
    },
    {
      title: "Bilingual Support",
      description: "Learn in Portuguese or English with our bilingual coaches.",
      imageSrc: "/WhySection/img2.png",
      imageAlt: "Bilingual Support icon"
    },
    {
      title: "Mock Test & Scheduling",
      description: "Build confidence with a mock test and Road Test support.",
      imageSrc: "/WhySection/img3.png",
      imageAlt: "Mock Test & Scheduling icon"
    },
    {
      title: "High Success Rate",
      description: "Our experienced instructors prepare you for the test.",
      imageSrc: "/WhySection/img4.png",
      imageAlt: "High Success Rate icon"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center mb-12">Why Choose us?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyItems.map((item, index) => (
            <WhyCard
              key={index}
              title={item.title}
              description={item.description}
              imageSrc={item.imageSrc}
              imageAlt={item.imageAlt}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
