import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Simple in-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute

function getRateLimitKey(request: NextRequest): string {
	// Use IP address or a combination of IP and user agent for identification
	const forwarded = request.headers.get("x-forwarded-for");
	const ip = forwarded ? forwarded.split(",")[0] : "unknown";
	return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
	const now = Date.now();
	const record = rateLimitStore.get(key);

	// Clean up old entries periodically (simple cleanup)
	if (rateLimitStore.size > 10000) {
		for (const [k, v] of rateLimitStore.entries()) {
			if (v.resetTime < now) {
				rateLimitStore.delete(k);
			}
		}
	}

	if (!record || record.resetTime < now) {
		// Create new record or reset expired one
		rateLimitStore.set(key, {
			count: 1,
			resetTime: now + RATE_LIMIT_WINDOW,
		});
		return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
	}

	if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
		return { allowed: false, remaining: 0 };
	}

	record.count += 1;
	return {
		allowed: true,
		remaining: RATE_LIMIT_MAX_REQUESTS - record.count,
	};
}

export function middleware(request: NextRequest) {
	// Only apply rate limiting to API routes
	if (request.nextUrl.pathname.startsWith("/api/")) {
		const key = getRateLimitKey(request);
		const { allowed, remaining } = checkRateLimit(key);

		if (!allowed) {
			return NextResponse.json(
				{
					error: "Too many requests. Please try again later.",
					retryAfter: RATE_LIMIT_WINDOW / 1000,
				},
				{
					status: 429,
					headers: {
						"Retry-After": String(RATE_LIMIT_WINDOW / 1000),
						"X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
						"X-RateLimit-Remaining": String(0),
					},
				},
			);
		}

		const response = NextResponse.next();
		response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
		response.headers.set("X-RateLimit-Remaining", String(remaining));
		return response;
	}

	return NextResponse.next();
}

export const config = {
	matcher: "/api/:path*",
};
