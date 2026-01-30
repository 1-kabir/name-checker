import fs from "node:fs";
import path from "node:path";

interface RateLimitData {
	perIP: Record<string, { count: number; resetTime: number }>;
	global: { count: number; resetDate: string };
}

const RATE_LIMIT_FILE = path.join(
	process.cwd(),
	"data",
	"ai-rate-limits.json",
);
const MAX_REQUESTS_PER_IP_PER_DAY = 50;
const MAX_GLOBAL_REQUESTS_PER_DAY = 1000; // Adjust as needed

// Ensure data directory exists
function ensureDataDir() {
	const dataDir = path.dirname(RATE_LIMIT_FILE);
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
}

// Load rate limit data from file
function loadRateLimitData(): RateLimitData {
	ensureDataDir();
	try {
		if (fs.existsSync(RATE_LIMIT_FILE)) {
			const data = fs.readFileSync(RATE_LIMIT_FILE, "utf-8");
			return JSON.parse(data);
		}
	} catch (error) {
		console.error("Error loading rate limit data:", error);
	}
	return {
		perIP: {},
		global: { count: 0, resetDate: getTodayDate() },
	};
}

// Save rate limit data to file
function saveRateLimitData(data: RateLimitData) {
	ensureDataDir();
	try {
		fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
	} catch (error) {
		console.error("Error saving rate limit data:", error);
	}
}

// Get today's date as string (YYYY-MM-DD)
function getTodayDate(): string {
	return new Date().toISOString().split("T")[0];
}

// Get end of day timestamp
function getEndOfDay(): number {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);
	return tomorrow.getTime();
}

// Extract IP from headers
export function getClientIP(headers: Headers): string {
	const forwarded = headers.get("x-forwarded-for");
	const realIp = headers.get("x-real-ip");

	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}

	if (realIp) {
		return realIp.trim();
	}

	return "unknown";
}

// Check and update rate limits
export function checkAIRateLimit(ip: string): {
	allowed: boolean;
	reason?: string;
	remaining?: number;
	resetTime?: number;
} {
	const data = loadRateLimitData();
	const today = getTodayDate();
	const now = Date.now();
	const endOfDay = getEndOfDay();

	// Reset global counter if new day
	if (data.global.resetDate !== today) {
		data.global = { count: 0, resetDate: today };
		data.perIP = {}; // Clear all IP records for new day
	}

	// Clean up expired IP records
	for (const [key, record] of Object.entries(data.perIP)) {
		if (record.resetTime < now) {
			delete data.perIP[key];
		}
	}

	// Check global limit
	if (data.global.count >= MAX_GLOBAL_REQUESTS_PER_DAY) {
		return {
			allowed: false,
			reason: "Daily global limit reached. Please try again tomorrow.",
			resetTime: endOfDay,
		};
	}

	// Check per-IP limit
	const ipRecord = data.perIP[ip];
	if (!ipRecord || ipRecord.resetTime < now) {
		// Create new record or reset expired one
		data.perIP[ip] = {
			count: 1,
			resetTime: endOfDay,
		};
		data.global.count += 1;
		saveRateLimitData(data);
		return {
			allowed: true,
			remaining: MAX_REQUESTS_PER_IP_PER_DAY - 1,
			resetTime: endOfDay,
		};
	}

	if (ipRecord.count >= MAX_REQUESTS_PER_IP_PER_DAY) {
		return {
			allowed: false,
			reason: `Daily limit of ${MAX_REQUESTS_PER_IP_PER_DAY} AI generations reached. Resets at midnight UTC.`,
			remaining: 0,
			resetTime: endOfDay,
		};
	}

	// Increment counters
	ipRecord.count += 1;
	data.global.count += 1;
	saveRateLimitData(data);

	return {
		allowed: true,
		remaining: MAX_REQUESTS_PER_IP_PER_DAY - ipRecord.count,
		resetTime: endOfDay,
	};
}

// Get current rate limit status (without incrementing)
export function getAIRateLimitStatus(ip: string): {
	remaining: number;
	total: number;
	resetTime: number;
} {
	const data = loadRateLimitData();
	const today = getTodayDate();
	const endOfDay = getEndOfDay();

	// Reset if new day
	if (data.global.resetDate !== today) {
		return {
			remaining: MAX_REQUESTS_PER_IP_PER_DAY,
			total: MAX_REQUESTS_PER_IP_PER_DAY,
			resetTime: endOfDay,
		};
	}

	const ipRecord = data.perIP[ip];
	if (!ipRecord || ipRecord.resetTime < Date.now()) {
		return {
			remaining: MAX_REQUESTS_PER_IP_PER_DAY,
			total: MAX_REQUESTS_PER_IP_PER_DAY,
			resetTime: endOfDay,
		};
	}

	return {
		remaining: Math.max(0, MAX_REQUESTS_PER_IP_PER_DAY - ipRecord.count),
		total: MAX_REQUESTS_PER_IP_PER_DAY,
		resetTime: endOfDay,
	};
}
