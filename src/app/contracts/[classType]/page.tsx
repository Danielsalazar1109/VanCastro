"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.js';

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
	const [numPages, setNumPages] = useState<number | null>(null);
	const [pageNumber, setPageNumber] = useState<number>(1);
	const [scale, setScale] = useState<number>(1.0);
	const [rotation, setRotation] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [fallbackToIframe, setFallbackToIframe] = useState<boolean>(false);

	const classType = ((params.classType as string) || "").toLowerCase();
	const contractInfo = contractsMap[classType as keyof typeof contractsMap];

	// Load the PDF when the component mounts
	useEffect(() => {
		if (contractInfo) {
			// Set the PDF URL to the API endpoint
			setPdfUrl(`/api/contracts/files/${contractInfo.fileName}`);
			console.log("Loading PDF from:", `/api/contracts/files/${contractInfo.fileName}`);
		}
	}, [contractInfo]);

	// Set scale based on screen size when component mounts
	useEffect(() => {
		const handleResize = () => {
			// Use smaller scale on mobile devices
			if (window.innerWidth < 640) { // sm breakpoint in Tailwind
				setScale(0.8);
			} else {
				setScale(1.0);
			}
		};
		
		// Set initial scale
		handleResize();
		
		// Update scale when window is resized
		window.addEventListener('resize', handleResize);
		
		// Cleanup
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	useEffect(() => {
		if (!contractInfo) {
			setError("Contract not found");
		}
	}, [contractInfo]);

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
		console.log("PDF loaded successfully with", numPages, "pages");
		setNumPages(numPages);
		setIsLoading(false);
	};

	const onDocumentLoadError = (error: Error) => {
		console.error('Error loading PDF:', error);
		setError("Failed to load contract PDF");
		setIsLoading(false);
		// Fallback to iframe if PDF.js fails
		setFallbackToIframe(true);
	};

	const previousPage = () => {
		setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
	};

	const nextPage = () => {
		setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
	};

	const zoomIn = () => {
		setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
	};

	const zoomOut = () => {
		setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
	};

	const rotate = () => {
		setRotation(prevRotation => (prevRotation + 90) % 360);
	};

	if (error && !fallbackToIframe) {
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
						{fallbackToIframe ? (
							// Fallback to iframe if PDF.js fails
							<div className="aspect-auto w-full h-screen">
								<iframe
									src={`/contracts/${contractInfo.fileName}`}
									className="w-full h-full border-0"
									title={contractInfo.displayName}
								/>
							</div>
						) : (
							<div className="aspect-auto w-full h-screen flex flex-col items-center">
								{isLoading && (
									<div className="flex justify-center items-center h-[300px]">
										<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
									</div>
								)}
								
								{pdfUrl && (
									<>
										{/* PDF Controls - Top */}
										<div className="flex flex-row justify-between items-center w-full mb-4 px-2 border-b pb-4">
											<div className="flex space-x-2">
												<button 
													onClick={zoomOut} 
													className="p-1 rounded hover:bg-gray-100"
													disabled={scale <= 0.5}
												>
													<ZoomOut size={20} className={scale <= 0.5 ? "text-gray-400" : "text-gray-700"} />
												</button>
												<button 
													onClick={zoomIn} 
													className="p-1 rounded hover:bg-gray-100"
													disabled={scale >= 3.0}
												>
													<ZoomIn size={20} className={scale >= 3.0 ? "text-gray-400" : "text-gray-700"} />
												</button>
												<button 
													onClick={rotate} 
													className="p-1 rounded hover:bg-gray-100"
												>
													<RotateCw size={20} className="text-gray-700" />
												</button>
											</div>
											
											<div className="flex items-center space-x-4">
												<button 
													onClick={previousPage} 
													className="p-1 rounded hover:bg-gray-100"
													disabled={pageNumber <= 1}
												>
													<ChevronLeft size={20} className={pageNumber <= 1 ? "text-gray-400" : "text-gray-700"} />
												</button>
												
												<span className="text-sm font-medium">
													Page {pageNumber} of {numPages || 1}
												</span>
												
												<button 
													onClick={nextPage} 
													className="p-1 rounded hover:bg-gray-100"
													disabled={pageNumber >= (numPages || 1)}
												>
													<ChevronRight size={20} className={pageNumber >= (numPages || 1) ? "text-gray-400" : "text-gray-700"} />
												</button>
											</div>
										</div>

										<Document
											file={pdfUrl}
											onLoadSuccess={onDocumentLoadSuccess}
											onLoadError={onDocumentLoadError}
											loading={
												<div className="flex justify-center items-center h-[300px]">
													<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
												</div>
											}
											error={
												<div className="p-4 bg-red-50 border border-red-200 rounded text-center">
													<p>Failed to load contract PDF. Please try again later.</p>
												</div>
											}
										>
											<Page 
												pageNumber={pageNumber} 
												scale={scale}
												rotate={rotation}
												className="shadow-lg"
												renderTextLayer={true}
												renderAnnotationLayer={true}
											/>
										</Document>
										
										{/* PDF Controls - Bottom (duplicated for convenience) */}
										<div className="flex flex-row justify-between items-center w-full mt-4 px-2 border-t pt-4 hidden">
											<div className="flex space-x-2">
												<button 
													onClick={zoomOut} 
													className="p-1 rounded hover:bg-gray-100"
													disabled={scale <= 0.5}
												>
													<ZoomOut size={20} className={scale <= 0.5 ? "text-gray-400" : "text-gray-700"} />
												</button>
												<button 
													onClick={zoomIn} 
													className="p-1 rounded hover:bg-gray-100"
													disabled={scale >= 3.0}
												>
													<ZoomIn size={20} className={scale >= 3.0 ? "text-gray-400" : "text-gray-700"} />
												</button>
												<button 
													onClick={rotate} 
													className="p-1 rounded hover:bg-gray-100"
												>
													<RotateCw size={20} className="text-gray-700" />
												</button>
											</div>
											
											<div className="flex items-center space-x-4">
												<button 
													onClick={previousPage} 
													className="p-1 rounded hover:bg-gray-100"
													disabled={pageNumber <= 1}
												>
													<ChevronLeft size={20} className={pageNumber <= 1 ? "text-gray-400" : "text-gray-700"} />
												</button>
												
												<span className="text-sm font-medium hidden">
													Page {pageNumber} of {numPages || 1}
												</span>
												
												<button 
													onClick={nextPage} 
													className="p-1 rounded hover:bg-gray-100"
													disabled={pageNumber >= (numPages || 1)}
												>
													<ChevronRight size={20} className={pageNumber >= (numPages || 1) ? "text-gray-400" : "text-gray-700"} />
												</button>
											</div>
										</div>
									</>
								)}
							</div>
						)}

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
