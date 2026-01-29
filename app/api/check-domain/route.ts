import { NextResponse } from "next/server";

// Popular TLDs with approximate price data - organized by category
const POPULAR_TLDS = [
	// Generic top-level domains (most popular)
	{ tld: "com", price: 12.99, category: "generic" },
	{ tld: "net", price: 14.99, category: "generic" },
	{ tld: "org", price: 13.99, category: "generic" },
	{ tld: "info", price: 18.99, category: "generic" },
	{ tld: "biz", price: 17.99, category: "generic" },

	// Tech & Development TLDs
	{ tld: "io", price: 39.99, category: "tech" },
	{ tld: "ai", price: 89.99, category: "tech" },
	{ tld: "app", price: 14.99, category: "tech" },
	{ tld: "dev", price: 12.99, category: "tech" },
	{ tld: "tech", price: 49.99, category: "tech" },
	{ tld: "codes", price: 49.99, category: "tech" },
	{ tld: "digital", price: 34.99, category: "tech" },
	{ tld: "software", price: 29.99, category: "tech" },
	{ tld: "systems", price: 22.99, category: "tech" },
	{ tld: "tools", price: 29.99, category: "tech" },

	// Business & Professional TLDs
	{ tld: "co", price: 29.99, category: "business" },
	{ tld: "company", price: 19.99, category: "business" },
	{ tld: "business", price: 19.99, category: "business" },
	{ tld: "agency", price: 22.99, category: "business" },
	{ tld: "solutions", price: 22.99, category: "business" },
	{ tld: "services", price: 29.99, category: "business" },
	{ tld: "group", price: 19.99, category: "business" },
	{ tld: "consulting", price: 34.99, category: "business" },

	// Creative & Media TLDs
	{ tld: "design", price: 49.99, category: "creative" },
	{ tld: "studio", price: 24.99, category: "creative" },
	{ tld: "media", price: 34.99, category: "creative" },
	{ tld: "graphics", price: 19.99, category: "creative" },
	{ tld: "art", price: 14.99, category: "creative" },
	{ tld: "photography", price: 22.99, category: "creative" },

	// E-commerce & Shopping TLDs
	{ tld: "shop", price: 34.99, category: "ecommerce" },
	{ tld: "store", price: 59.99, category: "ecommerce" },
	{ tld: "online", price: 3.99, category: "ecommerce" },
	{ tld: "site", price: 29.99, category: "ecommerce" },
	{ tld: "market", price: 29.99, category: "ecommerce" },

	// Community & Social TLDs
	{ tld: "community", price: 34.99, category: "community" },
	{ tld: "social", price: 29.99, category: "community" },
	{ tld: "network", price: 22.99, category: "community" },
	{ tld: "club", price: 14.99, category: "community" },
	{ tld: "team", price: 29.99, category: "community" },

	// Geographic TLDs
	{ tld: "us", price: 11.99, category: "geographic" },
	{ tld: "uk", price: 8.99, category: "geographic" },
	{ tld: "ca", price: 19.99, category: "geographic" },
	{ tld: "de", price: 8.99, category: "geographic" },
	{ tld: "eu", price: 8.99, category: "geographic" },

	// Affordable & New TLDs
	{ tld: "xyz", price: 1.99, category: "affordable" },
	{ tld: "top", price: 2.99, category: "affordable" },
	{ tld: "pro", price: 17.99, category: "affordable" },
	{ tld: "life", price: 29.99, category: "affordable" },
	{ tld: "world", price: 29.99, category: "affordable" },
	{ tld: "today", price: 22.99, category: "affordable" },
	{ tld: "space", price: 2.99, category: "affordable" },
	{ tld: "website", price: 3.99, category: "affordable" },
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
