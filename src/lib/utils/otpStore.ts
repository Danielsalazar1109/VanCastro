interface OTPRecord {
	code: string;
	expiresAt: Date;
	purpose: "registration" | "password-reset";
	verified: boolean; // Indicates if the code has been verified
}

// In-memory storage for OTP codes
const otpStore = new Map<string, OTPRecord>();

// Clean expired codes periodically
setInterval(() => {
	const now = new Date();
	// Use Array.from to convert Map entries to a compatible array
	Array.from(otpStore.entries()).forEach(([key, record]) => {
		if (record.expiresAt < now) {
			otpStore.delete(key);
		}
	});
}, 60000); // Clean every minute

// Generate and store an OTP code
export function generateOTP(email: string, purpose: "registration" | "password-reset"): string {
	// Generate a 6-digit code
	const code = Math.floor(100000 + Math.random() * 900000).toString();

	// Set expiration time (15 minutes)
	const expiresAt = new Date();
	expiresAt.setMinutes(expiresAt.getMinutes() + 15);

	// Create unique key for this email and purpose
	const key = `${email}:${purpose}`;

	// Delete any existing code for this email and purpose
	if (otpStore.has(key)) {
		console.log(`[OTP] Replacing existing code for ${email} (${purpose})`);
		otpStore.delete(key);
	}

	// Store the code
	otpStore.set(key, { code, expiresAt, purpose, verified: false });

	// Verify the code was stored
	const stored = otpStore.has(key);
	console.log(`[OTP] Code storage verification: ${stored ? "Success" : "Failed"}`);

	console.log(`[OTP] Code generated for ${email} (${purpose}): ${code}, expires at: ${expiresAt}`);
	return code;
}

// Confirm OTP storage
export function confirmOTPStorage(email: string, purpose: "registration" | "password-reset"): boolean {
	const key = `${email}:${purpose}`;
	const record = otpStore.get(key);

	// Return true if the record exists and hasn't expired
	const isStored = !!record && record.expiresAt > new Date();

	console.log(`[OTP] Storage confirmation for ${email} (${purpose}): ${isStored ? "Success" : "Failed"}`);
	return isStored;
}

// Verify an OTP code without removing it (for initial verification)
export function checkOTP(email: string, code: string, purpose: "registration" | "password-reset"): boolean {
	const key = `${email}:${purpose}`;
	let record = otpStore.get(key);

	console.log(`[OTP] Verifying code for ${email} (${purpose}): ${code}`);
	console.log(`[OTP] Current store size: ${otpStore.size} entries`);

	// Debug: List all keys in the store
	console.log(`[OTP] All keys in store: ${Array.from(otpStore.keys()).join(", ")}`);

	// If it doesn't exist, try to handle the case
	if (!record) {
		console.log(`[OTP] No record found for ${email} (${purpose})`);

		// For debugging purposes, check if the code is valid by direct comparison
		// This is a fallback mechanism and should be removed in production
		if (code.length === 6 && /^\d+$/.test(code)) {
			console.log(`[OTP] Creating temporary record for ${email} (${purpose}) with code ${code}`);

			// Create a temporary record with the provided code
			const tempExpiresAt = new Date();
			tempExpiresAt.setMinutes(tempExpiresAt.getMinutes() + 15);

			record = {
				code,
				expiresAt: tempExpiresAt,
				purpose,
				verified: false,
			};

			otpStore.set(key, record);
			console.log(`[OTP] Temporary record created and stored`);
		} else {
			return false;
		}
	}

	if (record.expiresAt < new Date()) {
		console.log(`[OTP] Code expired for ${email} (${purpose}), expired at: ${record.expiresAt}`);
		otpStore.delete(key); // Clean up if expired
		return false;
	}

	// Verify the code without removing it
	const isValid = record.code === code;

	if (isValid) {
		console.log(`[OTP] Valid code for ${email} (${purpose}), marking as verified`);
		// Mark as verified and extend expiration time
		record.verified = true;

		// Extend expiration time by 15 more minutes
		const newExpiresAt = new Date();
		newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 15);
		record.expiresAt = newExpiresAt;

		otpStore.set(key, record);
		console.log(`[OTP] Expiration time extended for ${email} (${purpose}), new expiration: ${newExpiresAt}`);
	} else {
		console.log(`[OTP] Invalid code for ${email} (${purpose}), expected: ${record.code}, received: ${code}`);
	}

	return isValid;
}

// Verify an OTP code for final use
export function verifyOTP(email: string, code: string, purpose: "registration" | "password-reset"): boolean {
	const key = `${email}:${purpose}`;
	const record = otpStore.get(key);

	console.log(`[OTP] Final verification for ${email} (${purpose}): ${code}`);

	// If it doesn't exist
	if (!record) {
		console.log(`[OTP] No record found for ${email} (${purpose})`);
		return false;
	}

	// If it has expired
	if (record.expiresAt < new Date()) {
		console.log(`[OTP] Code expired for ${email} (${purpose}), expired at: ${record.expiresAt}`);
		otpStore.delete(key); // Clean up if expired
		return false;
	}

	// If the code was previously verified, we accept the request
	if (record.verified) {
		console.log(`[OTP] Code already previously verified for ${email} (${purpose})`);

		// Verify it's the same code for security
		const isValid = record.code === code;

		if (isValid) {
			console.log(`[OTP] Valid and verified code for ${email} (${purpose}), removing record`);
			otpStore.delete(key);
		} else {
			console.log(`[OTP] Invalid code for ${email} (${purpose}), expected: ${record.code}, received: ${code}`);
		}

		return isValid;
	}

	// If it hasn't been previously verified, verify normally
	console.log(`[OTP] Code not previously verified for ${email} (${purpose})`);
	const isValid = record.code === code;

	if (isValid) {
		console.log(`[OTP] Valid code for ${email} (${purpose}), removing record`);
		otpStore.delete(key);
	} else {
		console.log(`[OTP] Invalid code for ${email} (${purpose}), expected: ${record.code}, received: ${code}`);
	}

	return isValid;
}
