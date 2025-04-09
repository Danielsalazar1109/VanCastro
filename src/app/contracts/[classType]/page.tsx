"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Map of class types to file names and display names
const contractsMap = {
	class4: {
		fileName: "StudentContractClass4.pdf",
		displayName: "Class 4 Student Contract",
	},
	class5: {
		fileName: "StudentContractClass5.pdf",
		displayName: "Class 5 Student Contract",
	},
	class7: {
		fileName: "StudentContractClass7.pdf",
		displayName: "Class 7 Student Contract",
	},
};

export default function ContractPage() {
	const params = useParams();
	const { data: session } = useSession();
	const [error, setError] = useState<string | null>(null);

	const classType = ((params.classType as string) || "").toLowerCase();
	const contractInfo = contractsMap[classType as keyof typeof contractsMap];

	useEffect(() => {
		if (!contractInfo) {
			setError("Contract not found");
		}
	}, [contractInfo]);

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-red-500">Error</h2>
					<p className="text-gray-700">{error}</p>
					<Link href="/" className="mt-4 inline-block text-blue-500 hover:underline">
						Return to Home
					</Link>
				</div>
			</div>
		);
	}

	if (!contractInfo) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold">Contract Not Found</h2>
					<p className="text-gray-500">The requested contract could not be found</p>
					<Link href="/" className="mt-4 inline-block text-blue-500 hover:underline">
						Return to Home
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-white shadow rounded-lg overflow-hidden">
					<div className="bg-brand-yellow px-6 py-4">
						<h1 className="text-2xl font-bold text-brand-dark">{contractInfo.displayName}</h1>
						<p className="text-brand-dark">Please review the contract details below</p>
					</div>

					<div className="p-6">
						<div className="aspect-auto w-full h-screen">
							<iframe
								src={`/contracts/${contractInfo.fileName}`}
								className="w-full h-full border-0"
								title={contractInfo.displayName}
							/>
						</div>

						<div className="mt-6 flex justify-between">
							<Link href="/" className="text-blue-500 hover:underline">
								Return to Home
							</Link>

							{session && (
								<Link href="/student" className="text-blue-500 hover:underline">
									Return to Dashboard
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
