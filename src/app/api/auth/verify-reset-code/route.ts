import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import { checkOTP } from "@/lib/utils/otpStore";

export async function POST(request: NextRequest) {
	try {
		await connectToDatabase();

		const { email, code } = await request.json();

		if (!email || !code) {
			return NextResponse.json({ message: "Email and code are required" }, { status: 400 });
		}

		// Check if the user exists
		const user = await User.findOne({ email });

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		// Verify the OTP code without removing it
		console.log(`[API] Attempting to verify code for ${email}: ${code}`);
		const isValid = checkOTP(email, code, "password-reset");

		if (!isValid) {
			console.log(`[API] Code verification failed for ${email}`);
			return NextResponse.json(
				{
					message: "Invalid or expired verification code",
					details: "The code may have expired or been entered incorrectly. Please try requesting a new code.",
				},
				{ status: 400 }
			);
		}

		console.log(`[API] Code verification successful for ${email}`);

		return NextResponse.json({
			message: "Code verified successfully",
			verified: true,
		});
	} catch (error) {
		console.error("Error verifying reset code:", error);
		return NextResponse.json({ message: "An error occurred while verifying code" }, { status: 500 });
	}
}
