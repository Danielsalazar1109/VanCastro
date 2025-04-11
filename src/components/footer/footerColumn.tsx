import React from "react";
import Link from "next/link";
import { Phone, Mail, Clock } from "lucide-react";

interface FooterColumnProps {
	title: string;
	items: { label: string; link?: string }[];
	className?: string;
}

const FooterColumn: React.FC<FooterColumnProps> = ({ title, items, className = "" }) => {
	return (
		<div className={`w-full ${className}`}>
			<h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{title}</h3>
			<ul className="space-y-2">
				{items.map((item, index) => (
					<li key={index} className="text-sm sm:text-base">
						{item.label.startsWith("Email:") ? (
							<a
								href={`mailto:${item.label.split(":")[1].trim()}`}
								className="flex items-center justify-center md:justify-start hover:text-yellow-400 transition-colors"
							>
								<Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
								<span>
									<strong className="font-medium">{item.label.split(":")[0]}:</strong>{" "}
									<span className="break-all">{item.label.split(":")[1]}</span>
								</span>
							</a>
						) : item.label.startsWith("Working hours:") ? (
							<div className="flex items-center justify-center md:justify-start">
								<Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
								<span>
									<strong className="font-medium">{item.label.split(":")[0]}:</strong>{" "}
									<span>{item.label.split(":")[1]}</span>
								</span>
							</div>
						) : item.label.includes("+1") ? (
							<a
								href={`tel:${item.label.replace(/\s/g, "")}`}
								className="flex items-center justify-center md:justify-start hover:text-yellow-400 transition-colors"
							>
								<Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
								<span>{item.label}</span>
							</a>
						) : item.label.includes("Phone") ? (
							<span className="font-medium">{item.label}</span>
						) : item.link ? (
							<Link href={item.link} className="hover:text-yellow-400 transition-colors">
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
