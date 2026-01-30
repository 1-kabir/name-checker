import { NextResponse } from "next/server";
import { checkCooldown, getClientIP } from "@/lib/rateLimit";

export async function GET(request: Request) {
	const ip = getClientIP(new Headers(request.headers));
	const cooldownResult = checkCooldown(ip);

	if (!cooldownResult.allowed) {
		return NextResponse.json({
			onCooldown: true,
			remainingMs: cooldownResult.remainingMs,
			remainingSeconds: Math.ceil((cooldownResult.remainingMs || 0) / 1000),
		});
	}

	return NextResponse.json({
		onCooldown: false,
	});
}
