import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import FooterColumn from "../footer/footerColumn";

export default function Footer() {
	const socialLinks = [
		{
			icon: <Facebook className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />,
			href: "https://www.facebook.com/p/Vancastro-Driving-School-100088028419878/",
			label: "Facebook",
		},
		{
			icon: <Instagram className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />,
			href: "https://www.instagram.com/vancastro_drivingschool/",
			label: "Instagram",
		},
		{
			icon: <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />,
			href: "https://www.youtube.com/@VanCastro_Driving_School",
			label: "YouTube",
		},
		{ icon: <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />, href: "#", label: "Message" },
	];

	return (
		<footer className="bg-stone-900 text-white pt-8 sm:pt-12 pb-4 px-4 sm:px-6 lg:px-8 w-full">
			<div className="container mx-auto max-w-7xl">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-8">
					{/* Logo and Social Media for Mobile (top) */}
					<div className="md:hidden col-span-full flex flex-col items-center">
						<div className="mb-4">
							<Image
								src="https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png"
								alt="VanCastro Driving School"
								width={180}
								height={90}
								className="h-auto"
							/>
						</div>

						{/* Social Media Icons */}
						<div className="flex justify-center space-x-3">
							{socialLinks.map((link, index) => (
								<Link
									key={index}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="bg-brand-yellow rounded-full p-2 hover:bg-brand-yellow-hover transition-colors"
									aria-label={link.label}
								>
									{link.icon}
								</Link>
							))}
						</div>
					</div>

					{/* Contact Information */}
					<div className="md:col-span-5 lg:col-span-4">
						<FooterColumn
							title="Contact"
							items={[
								{ label: "Phone" },
								{ label: "+1 604-600-9173" },
								{ label: "+1 778-680-5613" },
								{ label: "Email: Vancastrodrivingschool@gmail.com" },
								{ label: "Working hours: Monday to Friday 8a.m. - 6p.m." },
							]}
							className="text-center flex flex-col items-center md:items-start md:text-left"
						/>
					</div>

					{/* Locations and Links */}
					<div className="md:col-span-7 lg:col-span-8">
						<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
							{/* Location */}
							<div className="col-span-1">
								<FooterColumn
									title="Location"
									items={[{ label: "Burnaby" }, { label: "Vancouver" }, { label: "North Vancouver" }]}
									className="text-center md:text-left"
								/>
							</div>

							{/* Vancastro Links */}
							<div className="col-span-1">
								<FooterColumn
									title="Vancastro"
									items={[
										{ label: "Home", link: "/" },
										{ label: "Plans", link: "/plans" },
										{ label: "FAQ", link: "/faq" },
										{ label: "Contact", link: "/contact" },
									]}
									className="text-center md:text-left"
								/>
							</div>

							{/* Logo and Social Media for Desktop */}
							<div className="hidden md:block col-span-1">
								<div className="flex flex-col items-center md:items-end">
									<div className="mb-4">
										<Image
											src="https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png"
											alt="VanCastro Driving School"
											width={160}
											height={80}
											className="h-auto"
										/>
									</div>

									{/* Social Media Icons */}
									<div className="flex space-x-3">
										{socialLinks.map((link, index) => (
											<Link
												key={index}
												href={link.href}
												target="_blank"
												rel="noopener noreferrer"
												className="bg-brand-yellow rounded-full p-2 hover:bg-brand-yellow-hover transition-colors"
												aria-label={link.label}
											>
												{link.icon}
											</Link>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Footer Bottom */}
				<div className="border-t border-gray-700 mt-8 pt-4 w-full">
					<div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center space-y-2 sm:space-y-0">
						<div className="flex flex-wrap justify-center sm:justify-end">
							<Link
								href="/faq"
								className="text-sm sm:text-base hover:text-yellow-400 transition-colors px-2 py-1"
							>
								Copyright Policy
							</Link>
							<span className="hidden sm:inline text-gray-500 mx-1">|</span>
							<Link
								href="/faq"
								className="text-sm sm:text-base hover:text-yellow-400 transition-colors px-2 py-1"
							>
								Terms and Conditions
							</Link>
							<span className="hidden sm:inline text-gray-500 mx-1">|</span>
							<Link
								href="/faq"
								className="text-sm sm:text-base hover:text-yellow-400 transition-colors px-2 py-1"
							>
								Site Map
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
