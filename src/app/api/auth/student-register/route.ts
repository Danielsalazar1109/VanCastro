import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import { generateOTP } from "@/lib/utils/otpStore";
import { sendEmail } from "@/lib/utils/emailService";

export async function POST(request: NextRequest) {
	try {
		// Connect to the database
		await connectToDatabase();

		const { firstName, lastName, email, password, phone } = await request.json();

		// Validate input
		if (!firstName || !lastName || !email || !password || !phone) {
			return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create user in the database
		const newUser = await User.create({
			firstName,
			lastName,
			email,
			phone,
			password: hashedPassword,
			role: "user",
			emailVerified: false, // Inicialmente no verificado
		});

		// Generar y enviar código OTP para verificación
		const code = generateOTP(email, "registration");
		await sendEmail(email, "otpVerification", {
			userName: firstName,
			code,
			purpose: "registration",
		});

		// Check if user was created successfully
		if (!newUser) {
			return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
		}

		// Return user data (excluding password)
		const userResponse = {
			id: newUser._id,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			email: newUser.email,
			phone: newUser.phone,
			role: newUser.role,
		};

		return NextResponse.json(userResponse);
	} catch (error) {
		console.error("Student registration error:", error);
		return NextResponse.json({ message: "An error occurred during registration" }, { status: 500 });
	}
}
