import { NextResponse } from "next/server";

// Popular TLDs with approximate price data
const POPULAR_TLDS = [
	{ tld: "com", price: 12.99 },
	{ tld: "net", price: 14.99 },
	{ tld: "org", price: 13.99 },
	{ tld: "io", price: 39.99 },
	{ tld: "co", price: 29.99 },
	{ tld: "ai", price: 89.99 },
	{ tld: "app", price: 14.99 },
	{ tld: "dev", price: 12.99 },
	{ tld: "xyz", price: 1.99 },
	{ tld: "online", price: 3.99 },
];

// Simple domain availability check
async function checkDomainAvailability(domain: string, tld: string) {
	try {
		// Try to resolve the domain - if it resolves, it's likely taken
		const response = await fetch(
			`https://dns.google/resolve?name=${domain}.${tld}&type=A`,
		);
		const data = await response.json();

		// If we get an answer, domain exists (taken)
		// If Status is 3 (NXDOMAIN), domain doesn't exist (available)
		const available = data.Status === 3;

		return { available, status: data.Status };
	} catch (_error) {
		// If there's an error, assume we can't determine
		return { available: null, status: null };
	}
}

export async function POST(request: Request) {
	try {
		const { name, tld } = await request.json();

		if (!name || !name.trim()) {
			return NextResponse.json({ error: "Name is required" }, { status: 400 });
		}

		// Clean the name
		const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, "");

		// If specific TLD is requested
		if (tld) {
			const availability = await checkDomainAvailability(cleanName, tld);
			const tldInfo = POPULAR_TLDS.find((t) => t.tld === tld) || {
				tld,
				price: null,
			};

			return NextResponse.json({
				domain: `${cleanName}.${tld}`,
				available: availability.available,
				price: tldInfo.price,
				tld: tld,
			});
		}

		// Check all popular TLDs
		const results = await Promise.all(
			POPULAR_TLDS.map(async (tldInfo) => {
				const availability = await checkDomainAvailability(
					cleanName,
					tldInfo.tld,
				);
				return {
					domain: `${cleanName}.${tldInfo.tld}`,
					tld: tldInfo.tld,
					available: availability.available,
					price: tldInfo.price,
				};
			}),
		);

		return NextResponse.json({ results });
	} catch (error) {
		console.error("Domain check error:", error);
		return NextResponse.json(
			{ error: "Failed to check domain availability" },
			{ status: 500 },
		);
	}
}
