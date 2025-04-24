import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import { generateOTP, confirmOTPStorage } from "@/lib/utils/otpStore";
import { sendEmail } from "@/lib/utils/emailService";

export async function POST(request: NextRequest) {
	try {
		await connectToDatabase();

		const { email } = await request.json();

		if (!email) {
			return NextResponse.json({ message: "Email is required" }, { status: 400 });
		}

		// Check if the user exists
		const user = await User.findOne({ email });

		if (!user) {
			// Don't reveal if the user exists or not for security reasons
			return NextResponse.json({ message: "If the email exists, a reset code has been sent" }, { status: 200 });
		}

		// Generate OTP code
		const code = generateOTP(email, "password-reset");

		// Confirm the code was stored successfully
		const isStored = confirmOTPStorage(email, "password-reset");

		if (isStored) {
			// Only send email if code is successfully stored
			await sendEmail(email, "otpVerification", {
				userName: user.firstName,
				code,
				purpose: "password-reset",
			});

			return NextResponse.json({
				message: "Reset code sent successfully",
			});
		} else {
			return NextResponse.json(
				{
					message: "Failed to generate reset code",
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Error requesting password reset:", error);
		return NextResponse.json({ message: "An error occurred while sending reset code" }, { status: 500 });
	}
}
