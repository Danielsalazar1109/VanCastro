import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Contract from "@/models/Contract";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
	try {
		// Check if user is authenticated and is an admin
		const session = await getServerSession();
		if (!session || (session.user as any)?.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectToDatabase();

		// Clear existing contracts
		await Contract.deleteMany({});

		// Seed contracts data
		const contractsData = [
			{
				classType: "Class4",
				fileName: "StudentContractClass4.pdf",
				displayName: "Class 4 Student Contract",
				isActive: true,
			},
			{
				classType: "Class5",
				fileName: "StudentContractClass5.pdf",
				displayName: "Class 5 Student Contract",
				isActive: true,
			},
			{
				classType: "Class7",
				fileName: "StudentContractClass7.pdf",
				displayName: "Class 7 Student Contract",
				isActive: true,
			},
		];

		await Contract.insertMany(contractsData);

		return NextResponse.json(
			{ message: "Contracts seeded successfully", count: contractsData.length },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error seeding contracts:", error);
		return NextResponse.json({ error: "Failed to seed contracts" }, { status: 500 });
	}
}
