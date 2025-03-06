import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    {
      question: "How long are the driving lessons?",
      answer: "Our standard driving lessons are 60 minutes long. We also offer extended 90-minute and 2-hour sessions for more intensive training."
    },
    {
      question: "What types of vehicles do you use for training?",
      answer: "We use modern, dual-control vehicles that are regularly maintained and equipped with safety features. Our fleet includes both manual and automatic transmission cars."
    },
    {
      question: "Do I need to have a learner's permit before booking lessons?",
      answer: "Yes, you must have a valid learner's permit or provisional license before taking practical driving lessons with us."
    },
    {
      question: "How many lessons will I need before taking my driving test?",
      answer: "This varies greatly depending on your prior experience and how quickly you learn. On average, new drivers typically need between 20-30 hours of professional instruction."
    },
    {
      question: "Can I use your car for my driving test?",
      answer: "Yes, you can book one of our vehicles for your driving test. This includes a pre-test warm-up lesson to help you prepare."
    },
    {
      question: "What happens if I need to cancel or reschedule a lesson?",
      answer: "We require at least 24 hours' notice for cancellations or rescheduling. Late cancellations may be subject to a fee."
    },
    {
      question: "Do you offer pick-up and drop-off services?",
      answer: "Yes, our instructors can pick you up and drop you off at your home, school, workplace, or another convenient location within our service area."
    },
    {
      question: "How do I pay for lessons?",
      answer: "Payment is made online through our secure booking system. We accept all major credit and debit cards."
    },
    {
      question: "Are your driving instructors certified?",
      answer: "Yes, all our instructors are fully licensed, certified, and have undergone background checks. They receive regular training to stay updated with the latest driving techniques and road regulations."
    },
    {
      question: "Do you offer specialized training for anxious drivers?",
      answer: "Yes, we have instructors who specialize in working with anxious or nervous drivers. Please mention this when booking so we can match you with the right instructor."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-primary-700 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-lg mb-4">Still have questions? We're here to help!</p>
          <Link href="/contact" className="btn-primary">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
