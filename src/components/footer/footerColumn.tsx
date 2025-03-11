import React from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';

interface FooterColumnProps {
  title: string;
  items: { label: string; link?: string }[];
  isMobile?: boolean;
}

const FooterColumn: React.FC<FooterColumnProps> = ({ title, items, isMobile = false }) => {
  return (
    <div className={`${isMobile ? "text-center" : "md:mb-0 mx-16 md:mx-0"} w-auto`}>
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
              <a href={`tel:${item.label.replace(/\s/g, '')}`} className={`${isMobile ? "justify-center" : ""} flex items-center`}>
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
};

export default FooterColumn;