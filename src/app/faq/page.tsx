import React from 'react';
import {FAQContainerData } from '../../components/faq/faqSection';
import FAQSection from '../../components/faq/faqSection';
import Link from 'next/link';

const FAQPage: React.FC = () => {
  const PolicyFAQData = {
    //Policy FAQ
    title: "Policy",
    description: "The following policies apply to all services provided by VanCastro Driving School. Please review them carefully to understand your responsibilities and our commitments.",
    containers: [
      {
        title: 'General Policies',
        items: [
          {
            question: 'General Policies',
            answer: (
              <ul className="list-disc pl-5 space-y-1">
                <li>Student must provide a valid BC Learners Driver's License before any lesson.</li>
                <li>Student must be dressed appropriately and wear proper footwear (no heels).</li>
                <li>All students have to be registered and paid in advance and no later than the first lesson.</li>
                <li>Vancastro Driving School, may cancel your scheduled appointment for any unforeseen circumstances. For example, instructor being sick, car breaking down, or poor road conditions. Students will be notified as soon as possible. The lesson will be rescheduled.</li>
                <li>Vancastro Driving School can cancel your lesson with NO refunds if the student is suspected of being under the influence of alcohol, drugs, or using foul, abusive, or aggressive language.</li>
                <li>If a student causes a crash and found at fault by ICBC then deductible amount as per Insurance Policy will have to be paid by the student.</li>
                <li>If students are being disrespectful, threatening, or posing any danger the lesson will be cancelled with no refund and will be banned from returning to the school.</li>
              </ul>
            )
          },
          {
            question: 'Late',
            answer: "If you are late beyond 15 Minutes, the instructor will leave and you will be considered as a 'NO SHOW' lesson (no refund or reschedule for that lesson)."
          }
        ]
      },
      {
        title: 'Cancellation & Refund Policies',
        items: [
          {
            question: 'Cancellations',
            answer: (
              <div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>To cancel the lesson, please give us a notice within 48 hours, otherwise, a cancellation fee of $30 will be assessed. Same day or last minute cancellation will cost full lesson fee or you will lose the lesson.</li>
                  <li>Class 5 - Automatic 30 min. lesson & car rental for road test – $ ___</li>
                </ul>
              </div>
            ),
            note: "For canceling a road test appointment made by VanCastro Driving School, We require 72 hours of notice, as we must notify ICBC. Failure to give Vancastro Driving School sufficient notice may result in the student being charged a $25 road test cancellation fee to ICBC."
          },
          {
            question: 'Refund',
            answer: (
              <ul className="list-disc pl-5 space-y-1">
                <li>There will be no refund for driving lessons regardless of the outcome of the road test, all lessons purchased are final sale and non-transferable.</li>
                <li>Refunds will be paid for unused lessons provided notice is received by Vancastro driving School, 48 hours prior to the scheduled lesson(s). The cancellation fee will apply to refunds requested within 48 hours of a scheduled lesson.</li>
              </ul>
            )
          },
          {
            question: 'Fees',
            answer: (
              <ul className="list-disc pl-5 space-y-1">
                <li>Class 5 - Automatic, 90 minutes driving lesson – $__</li>
                <li>Class 5 - Automatic 30 min. lesson & car rental for road test – $ ___</li>
              </ul>
            ),
            note: "ICBC Road test and licensing fees are not included. Prices are subject to change without notice."
          }
        ]
      },
      {
        title: 'Roles & Expectations',
        items: [
          {
            question: 'Instructor Responsibilities',
            answer: (
              <ul className="list-disc pl-5 space-y-1">
                <li>Instructors will behave courteously towards all persons with whom he/she comes in contact when providing services.</li>
                <li>When providing lessons driver instructors shall apply themselves solely to the task and not engage in other activities such as cell phone use, eating or any other activities that are inappropriate or distracting to the learner driver.</li>
                <li>Instructors will comply with the Motor Vehicle Act and its regulation and any other relevant applicable law.</li>
                <li>Instructors will treat all persons equally and with dignity and respect.</li>
                <li>Instructors will conduct themselves professionally and will strive to strengthen and uphold public confidence in the driver training industry.</li>
                <li>Instructors will support road safety and the provision of driver licensing services to British Columbians.</li>
                <li>Instructors will protect the privacy of customers and safeguard any customer records they possess or control in accordance with the Personal Information Protection Act (PIPA).</li>
                <li>Instructors will act with honesty and integrity recognizing they are in a position of trust and authority. Instructors are aware of all road rules and regulations and licenses are all current.</li>
              </ul>
            )
          },
          {
            question: 'Student Expectations',
            answer: (
              <ul className="list-disc pl-5 space-y-1">
                <li>Student must provide a valid BC Learners Driver's License before any lesson.</li>
                <li>Student must be dressed appropriately and wear proper footwear (no heels).</li>
                <li>All students have to be registered and paid in advance and no later than the first lesson.</li>
                <li>Vancastro Driving School, may cancel your scheduled appointment for any unforeseen circumstances. For example, instructor being sick, car breaking down, or poor road conditions. Students will be notified as soon as possible. The lesson will be rescheduled.</li>
                <li>Vancastro Driving School can cancel your lesson with NO refunds if the student is suspected of being under the influence of alcohol, drugs, or using foul, abusive, or aggressive language.</li>
                <li>If a student causes a crash and found at fault by ICBC then deductible amount as per Insurance Policy will have to be paid by the student.</li>
                <li>Student must be dressed appropriately and wear proper footwear (no heels).</li>
                <li>If students are being disrespectful, threatening, or posing any danger the lesson will be cancelled with no refund and will be banned from returning to the school.</li>
              </ul>
            )
          }
        ]
      },
      {
        title: 'Covid 19 Policies',
        items: [
          {
            question: 'Health and Safety Protocols',
            answer: (
              <ul className="list-disc pl-5 space-y-1">
                <li>Vancastro Driving School will ensure all touch surfaces have been disinfected before and after each lesson.</li>
                <li>Mask or face coverings are not required however students are free to use them and also request the instructor to wear one if they so desire.</li>
                <li>Students will be asked general health questions before the lesson and the instructors reserves the right to cancel the lesson if they deem the student to not be fit to do the lesson.</li>
                <li>The instructor reserves the right and discretion to cancel a lesson for any health or suspected health reason or concern.</li>
                <li>If a student has been diagnosed with COVID-19, suspected of having it, or been ordered to self-isolate or quarantine by a public health authority they must inform the school as soon as possible</li>
                <li>In the event of local/community outbreaks Vancastro driving school reserves the right to cancel/postpone lessons which will be rescheduled for a later date.</li>
              </ul>
            )
          }
        ]
      }
    ] as FAQContainerData[]
  };

  // Second FAQ Section
  const FAQData = {
    title: "FAQ",
    description: "Common questions from the students",
    containers: [
      {
        title: 'Knowledge test',
        items: [
          {
            question: 'Booking & Preparation',
            answer: (
              <ul className="list-disc pl-5 space-y-1">
                <li>Where can I book my knowledge test? Book Knowledge Test by ICBC. Click <Link href="https://www.icbc.com/zh-Hans/driver-licensing/driving-guides/Learn-to-Drive-Smart" className="text-yellow-400 hover:underline" target="_blank" rel="noopener noreferrer">here</Link></li>
                <li>How can I study for my knowledge test? Book download PDF <Link href="https://www.icbc.com/zh-Hans/driver-licensing/driving-guides/Learn-to-Drive-Smart" className="text-yellow-400 hover:underline" target="_blank" rel="noopener noreferrer">here</Link></li>
                <li>Practice questions download PDF <Link href="https://www.icbc.com/zh-Hans/driver-licensing/new-drivers/practice-knowledge-test" className="text-yellow-400 hover:underline" target="_blank" rel="noopener noreferrer">here</Link></li>
                <li>Can I have a translator with me? Yes. Find more professional approvedICBC Translators in this list. Click <Link href="https://www.icbc.com/zh-Hans/driver-licensing/new-drivers/practice-knowledge-test" className="text-yellow-400 hover:underline" target="_blank" rel="noopener noreferrer">here</Link></li>
              </ul>
            )
          },
          {
            question: 'Test Details',
            answer: (
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Knowledge Test Time</strong>: The test takes around 35 minutes for Class 5 and Class 7 licenses.</li>
                <li><strong>Number of Questions</strong>: There are 50 questions, and you need to answer at least 40 correctly to pass.</li>
                <li><strong>Retesting After Failure</strong>: You can retake the test after 7 days if needed, with no limits on attempts.</li>
                <li><strong>Cost</strong>: The test costs $15.00 (subject to change).</li>
                <li><strong>Required Documents</strong>: Bring your permit (work/study) or PR card, passport or BCID, and any prior driver's license you hold.</li>
                <li><strong>Surrendering Previous License</strong>: You must hand over your old license, as holding two is not permitted in Canada.</li>
              </ul>
            )
          }
        ]
      },
      {
        title: 'Road test',
        items: [
          {
            question: 'Road Test Information',
           answer: (
           <ul className="list-disc pl-5 space-y-1">
           <li><strong>Road Test Booking</strong>: Schedule your road test <a href="https://onlinebusiness.icbc.com/webdeas-ui/home" className="text-yellow-400 hover:underline" target="_blank" rel="noopener noreferrer">here</a>.</li>
           <li><strong>Test Duration</strong>: 35 minutes total (5 min pre-trip, 25 min driving, 5 min feedback).</li>
           <li><strong>Recommended ICBC Locations</strong>: North Vancouver/Marine Drive, Vancouver/Kingsway, Burnaby/Lougheed.</li>
           <li><strong>Translator</strong>: Translators are not allowed; only the examiner and driver are in the car.</li>
           <li><strong>Use own car</strong>: Allowed if all lights, controls, and tires are in good condition.</li>
           <li><strong>Fees</strong>: $35.00 for Class 7 / $50.00 for Class 5</li>
           <li><strong>Required Documents</strong>: Bring permit (work/study) or PR card, passport or BCID, and any previous licenses.</li>
           </ul>
           )
          },
          {
            question: 'What happens if I miss my lesson?',
            answer: 'If you are more than 15 minutes late, it will be considered a "no-show" and you will be charged the full lesson fee.'
          }
        ]
      },
      {
        title: 'I have a driver license from other country, can I use it?',
        items: [
          {
            answer: "You can drive for up to 90 days with a driver's license from another country. To do so, you must have a valid license from your home country, and if it's not in English, you'll need a certified translation provided by an ICBC-approved translator.",
            alwaysExpanded: true
          },
        ]
      },
      {
        title: 'Where will I be picked up for my driving lessons?',
        items: [
          {
            answer: "Our instructors can pick you up from your bus or SkyTrain station. If you have other requests, please discuss them with your instructor—they may be able to accommodate you. Additional charges may apply for locations outside the city boundaries.",
            alwaysExpanded: true
          },
        ]
      },
      {
        title: 'Method of payment',
        items: [
          {
            answer: 'Online payment, cash or E-transfer at School',
            alwaysExpanded: true
          },
        ]
      },
      {
        title: 'What lessons do we provide?',
        items: [
          {
            answer: <p>We offer driving lessons for<strong>Class 5, Class 7</strong> and <strong>Road Testing</strong>.</p>,
            alwaysExpanded: true
          },
        ]
      }
    ] as FAQContainerData[]
  };

  return (
    <div className="space-y-12 py-8">
      {/* First FAQ Section */}
      <FAQSection {...PolicyFAQData} />
      
      {/* Second FAQ Section */}
      <FAQSection {...FAQData} />
    </div>
  );
};

export default FAQPage;