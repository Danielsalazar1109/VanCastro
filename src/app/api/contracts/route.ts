import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Contract from "@/models/Contract";

export async function GET(req: NextRequest) {
	try {
		await connectToDatabase();

		// Get all active contracts
		const contracts = await Contract.find({ isActive: true });

		return NextResponse.json({ contracts }, { status: 200 });
	} catch (error) {
		console.error("Error fetching contracts:", error);
		return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 });
	}
}
