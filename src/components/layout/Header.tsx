import Link from "next/link";
import Image from "next/image";

export default function Header() {
	return (
		<header className="bg-stone-900 shadow-sm py-3">
			<div className="container mx-auto px-6 flex justify-between items-center h-20">
				<Link href="/">
					<Image
						src="https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png"
						alt="VanCastro Driving School Logo"
						width={130}
						height={40}
					/>
				</Link>

				<nav>
					<ul className="flex space-x-8 text-lg">
						<li>
							<Link href="/" className="text-white hover:text-yellow-500 transition-colors duration-200">
								Home
							</Link>
						</li>
						<li>
							<Link
								href="/plans"
								className="text-white hover:text-yellow-500 transition-colors duration-200"
							>
								Plans
							</Link>
						</li>
						<li>
							<Link
								href="/booking"
								className="text-white hover:text-yellow-500 transition-colors duration-200"
							>
								Booking
							</Link>
						</li>
						<li>
							<Link
								href="/tracking"
								className="text-white hover:text-yellow-500 transition-colors duration-200"
							>
								Track your booking
							</Link>
						</li>
						<li>
							<Link
								href="/faq"
								className="text-white hover:text-yellow-500 transition-colors duration-200"
							>
								FAQ
							</Link>
						</li>
						<li>
							<Link
								href="/contact"
								className="text-white hover:text-yellow-500 transition-colors duration-200"
							>
								Contact
							</Link>
						</li>
					</ul>
				</nav>
			</div>
		</header>
	);
}
