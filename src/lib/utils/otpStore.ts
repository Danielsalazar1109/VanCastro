interface OTPRecord {
	code: string;
	expiresAt: Date;
	purpose: "registration" | "password-reset";
	verified: boolean; // Indica si el código ya ha sido verificado
}

// Almacenamiento en memoria para códigos OTP
const otpStore = new Map<string, OTPRecord>();

// Limpiar códigos expirados periódicamente
setInterval(() => {
	const now = new Date();
	// Usar Array.from para convertir las entradas del Map a un array compatible
	Array.from(otpStore.entries()).forEach(([key, record]) => {
		if (record.expiresAt < now) {
			otpStore.delete(key);
		}
	});
}, 60000); // Limpiar cada minuto

// Generar y almacenar un código OTP
export function generateOTP(email: string, purpose: "registration" | "password-reset"): string {
	// Generar un código de 6 dígitos
	const code = Math.floor(100000 + Math.random() * 900000).toString();

	// Establecer tiempo de expiración (10 minutos en lugar de 5)
	const expiresAt = new Date();
	expiresAt.setMinutes(expiresAt.getMinutes() + 10);

	// Crear clave única para este email y propósito
	const key = `${email}:${purpose}`;

	// Almacenar el código
	otpStore.set(key, { code, expiresAt, purpose, verified: false });

	console.log(`[OTP] Código generado para ${email} (${purpose}): ${code}, expira en: ${expiresAt}`);
	return code;
}

// Verificar un código OTP sin eliminarlo (para verificación inicial)
export function checkOTP(email: string, code: string, purpose: "registration" | "password-reset"): boolean {
	const key = `${email}:${purpose}`;
	const record = otpStore.get(key);

	console.log(`[OTP] Verificando código para ${email} (${purpose}): ${code}`);

	// Si no existe o ha expirado
	if (!record) {
		console.log(`[OTP] No se encontró registro para ${email} (${purpose})`);
		return false;
	}

	if (record.expiresAt < new Date()) {
		console.log(`[OTP] Código expirado para ${email} (${purpose}), expiró en: ${record.expiresAt}`);
		otpStore.delete(key); // Limpiar si ha expirado
		return false;
	}

	// Verificar el código sin eliminarlo
	const isValid = record.code === code;

	if (isValid) {
		console.log(`[OTP] Código válido para ${email} (${purpose}), marcando como verificado`);
		// Marcar como verificado y extender el tiempo de expiración
		record.verified = true;

		// Extender el tiempo de expiración por 10 minutos más
		const newExpiresAt = new Date();
		newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 10);
		record.expiresAt = newExpiresAt;

		otpStore.set(key, record);
		console.log(
			`[OTP] Tiempo de expiración extendido para ${email} (${purpose}), nueva expiración: ${newExpiresAt}`
		);
	} else {
		console.log(`[OTP] Código inválido para ${email} (${purpose}), esperado: ${record.code}, recibido: ${code}`);
	}

	return isValid;
}

// Verificar un código OTP para uso final
export function verifyOTP(email: string, code: string, purpose: "registration" | "password-reset"): boolean {
	const key = `${email}:${purpose}`;
	const record = otpStore.get(key);

	console.log(`[OTP] Verificación final para ${email} (${purpose}): ${code}`);

	// Si no existe
	if (!record) {
		console.log(`[OTP] No se encontró registro para ${email} (${purpose})`);
		return false;
	}

	// Si ha expirado
	if (record.expiresAt < new Date()) {
		console.log(`[OTP] Código expirado para ${email} (${purpose}), expiró en: ${record.expiresAt}`);
		otpStore.delete(key); // Limpiar si ha expirado
		return false;
	}

	// Si el código ya fue verificado previamente, aceptamos la solicitud
	if (record.verified) {
		console.log(`[OTP] Código ya verificado previamente para ${email} (${purpose})`);

		// Verificamos que sea el mismo código por seguridad
		const isValid = record.code === code;

		if (isValid) {
			console.log(`[OTP] Código válido y verificado para ${email} (${purpose}), eliminando registro`);
			otpStore.delete(key);
		} else {
			console.log(
				`[OTP] Código inválido para ${email} (${purpose}), esperado: ${record.code}, recibido: ${code}`
			);
		}

		return isValid;
	}

	// Si no ha sido verificado previamente, verificamos normalmente
	console.log(`[OTP] Código no verificado previamente para ${email} (${purpose})`);
	const isValid = record.code === code;

	if (isValid) {
		console.log(`[OTP] Código válido para ${email} (${purpose}), eliminando registro`);
		otpStore.delete(key);
	} else {
		console.log(`[OTP] Código inválido para ${email} (${purpose}), esperado: ${record.code}, recibido: ${code}`);
	}

	return isValid;
}
