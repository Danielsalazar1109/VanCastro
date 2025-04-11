import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Youtube, MessageCircle, Phone, Mail, MapPin } from "lucide-react";

const Contact = () => {
	const socialLinks = [
		{
			icon: <Facebook className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />,
			href: "https://www.facebook.com/p/Vancastro-Driving-School-100088028419878/",
			label: "Facebook",
		},
		{
			icon: <Instagram className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />,
			href: "https://www.instagram.com/vancastro_drivingschool/",
			label: "Instagram",
		},
		{
			icon: <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />,
			href: "https://www.youtube.com/@VanCastro_Driving_School",
			label: "YouTube",
		},
	];

	return (
		<div className="w-full bg-gray-50 py-8 sm:py-12 md:py-16">
			<div className="container mx-auto max-w-7xl px-4">
				{/* Main Contact Section */}
				<div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16">
					{/* Contact Info Card */}
					<div className="w-full md:w-1/2">
						<div className="bg-white rounded-lg shadow-md overflow-hidden p-6 sm:p-8 h-full">
							<h2 className="text-2xl sm:text-3xl font-bold mb-4">Contact us</h2>
							<p className="text-lg sm:text-xl mb-6">Monday to Friday from 8a.m.-6p.m.</p>

							{/* Phone */}
							<div className="flex items-center mb-4">
								<div className="bg-black rounded-full p-1.5 mr-3 flex-shrink-0">
									<Phone className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
								</div>
								<div>
									<p className="text-base sm:text-lg">+1 604-600-9173</p>
									<p className="text-base sm:text-lg">+1 778-680-5613</p>
								</div>
							</div>

							{/* Email */}
							<div className="flex items-center mb-4">
								<div className="bg-black rounded-full p-1.5 mr-3 flex-shrink-0">
									<Mail className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
								</div>
								<div className="w-full">
									<a
										href="mailto:Vancastrodrivingschool@gmail.com"
										className="text-base sm:text-lg hover:text-yellow-600 transition-colors break-words"
									>
										Vancastrodrivingschool@gmail.com
									</a>
								</div>
							</div>

							{/* Locations */}
							<div className="flex items-start mb-6">
								<div className="bg-black rounded-full p-1.5 mr-3 mt-1 flex-shrink-0">
									<MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
								</div>
								<div>
									<p className="text-base sm:text-lg">
										<span className="block">Burnaby</span>
										<span className="block">Vancouver</span>
										<span className="block">North Vancouver</span>
									</p>
								</div>
							</div>

							{/* Social Media */}
							<div className="mt-6">
								<h3 className="text-center font-semibold mb-4 text-lg sm:text-xl">
									Visit Our Social Media
								</h3>
								<div className="flex justify-center space-x-4">
									{socialLinks.map((link, index) => (
										<Link
											key={index}
											href={link.href}
											target="_blank"
											rel="noopener noreferrer"
											className="bg-black rounded-full p-1.5 hover:bg-yellow-500 transition-colors"
											aria-label={link.label}
										>
											{link.icon}
										</Link>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Image Section - Hidden on mobile */}
					<div className="hidden md:block md:w-1/2 relative">
						<div className="relative">
							<Image
								src="https://framerusercontent.com/images/LzrGRfUSpTkXyzYfisvdvL2yvA.png?scale-down-to=1024"
								alt="VanCastro Driving School Instructors"
								width={545}
								height={545}
								className="rounded-full"
							/>
							<div className="absolute -bottom-8 right-12 bg-stone-800 rounded-full w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 flex items-center justify-center z-10">
								<Image
									src="https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png"
									alt="VanCastro Driving School Logo"
									width={120}
									height={60}
									className="w-3/4 h-auto"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* ICBC Knowledge Test Section */}
				<div className="mb-16">
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-center">Need help with the</h2>
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">
						ICBC Knowledge Test?
					</h2>
					<p className="text-xl sm:text-2xl mb-8 text-center">Connect with Our Partner!</p>

					<div className="max-w-3xl mx-auto bg-white p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Phone */}
							<div>
								<p className="font-bold text-lg sm:text-xl mb-2">Phone</p>
								<div className="flex items-center">
									<Phone className="h-4 w-4 mr-2 text-yellow-600" />
									<a
										href="tel:+12365152741"
										className="text-base sm:text-lg hover:text-yellow-600 transition-colors"
									>
										+1 (236) 515-2741
									</a>
								</div>
							</div>

							{/* Email */}
							<div>
								<p className="font-bold text-lg sm:text-xl mb-2">Email</p>
								<div className="flex items-start">
									<Mail className="h-4 w-4 mr-2 text-yellow-600 flex-shrink-0 mt-1.5" />
									<a
										href="mailto:icbcknowledgetestmaterial@gmail.com"
										className="text-base sm:text-lg hover:text-yellow-600 transition-colors break-all"
									>
										icbcknowledgetestmaterial@gmail.com
									</a>
								</div>
							</div>
						</div>

						{/* Social Media */}
						<div className="mt-6">
							<p className="font-bold text-lg sm:text-xl mb-2 text-center">Social Media</p>
							<div className="flex justify-center space-x-4">
								<Link
									href="https://www.facebook.com/ICBCKnowledgeTestMaterial/"
									target="_blank"
									rel="noopener noreferrer"
									className="bg-black rounded-full p-1.5 hover:bg-yellow-500 transition-colors"
								>
									<Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Contact;
