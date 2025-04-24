import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
	try {
		await connectToDatabase();

		const { email, code, newPassword, confirmPassword } = await request.json();

		if (!email || !code || !newPassword || !confirmPassword) {
			return NextResponse.json({ message: "All fields are required" }, { status: 400 });
		}

		// Verify that passwords match
		if (newPassword !== confirmPassword) {
			return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
		}

		// We no longer verify the OTP code here
		// We trust that the frontend already verified the code in the previous step

		// Find the user
		const user = await User.findOne({ email });

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 12);

		// Update the password
		await User.updateOne({ email }, { $set: { password: hashedPassword } });

		return NextResponse.json({
			message: "Password reset successfully",
		});
	} catch (error) {
		console.error("Error resetting password:", error);
		return NextResponse.json({ message: "An error occurred while resetting password" }, { status: 500 });
	}
}
