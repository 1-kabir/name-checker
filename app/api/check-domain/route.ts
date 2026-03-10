import { NextResponse } from "next/server";

// Popular TLDs with 2026 pricing — organized by category
const POPULAR_TLDS = [
	// ─── Generic ───
	{ tld: "com", price: 12.99, category: "generic" },
	{ tld: "net", price: 14.99, category: "generic" },
	{ tld: "org", price: 13.99, category: "generic" },
	{ tld: "info", price: 18.99, category: "generic" },
	{ tld: "biz", price: 17.99, category: "generic" },
	{ tld: "me", price: 19.99, category: "generic" },
	{ tld: "name", price: 9.99, category: "generic" },

	// ─── Tech & Development ───
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
	{ tld: "build", price: 14.99, category: "tech" },
	{ tld: "run", price: 14.99, category: "tech" },
	{ tld: "cloud", price: 29.99, category: "tech" },
	{ tld: "page", price: 14.99, category: "tech" },
	{ tld: "so", price: 39.99, category: "tech" },
	{ tld: "bot", price: 49.99, category: "tech" },

	// ─── Business & Professional ───
	{ tld: "co", price: 29.99, category: "business" },
	{ tld: "company", price: 19.99, category: "business" },
	{ tld: "business", price: 19.99, category: "business" },
	{ tld: "agency", price: 22.99, category: "business" },
	{ tld: "solutions", price: 22.99, category: "business" },
	{ tld: "services", price: 29.99, category: "business" },
	{ tld: "group", price: 19.99, category: "business" },
	{ tld: "consulting", price: 34.99, category: "business" },
	{ tld: "ventures", price: 39.99, category: "business" },
	{ tld: "capital", price: 49.99, category: "business" },
	{ tld: "finance", price: 49.99, category: "business" },
	{ tld: "money", price: 29.99, category: "business" },
	{ tld: "fund", price: 49.99, category: "business" },
	{ tld: "vc", price: 79.99, category: "business" },
	{ tld: "expert", price: 39.99, category: "business" },

	// ─── Creative & Media ───
	{ tld: "design", price: 49.99, category: "creative" },
	{ tld: "studio", price: 24.99, category: "creative" },
	{ tld: "media", price: 34.99, category: "creative" },
	{ tld: "art", price: 14.99, category: "creative" },
	{ tld: "photography", price: 22.99, category: "creative" },
	{ tld: "video", price: 29.99, category: "creative" },
	{ tld: "film", price: 29.99, category: "creative" },
	{ tld: "music", price: 29.99, category: "creative" },
	{ tld: "blog", price: 14.99, category: "creative" },
	{ tld: "ink", price: 34.99, category: "creative" },

	// ─── E-commerce & Shopping ───
	{ tld: "shop", price: 34.99, category: "ecommerce" },
	{ tld: "store", price: 59.99, category: "ecommerce" },
	{ tld: "online", price: 3.99, category: "ecommerce" },
	{ tld: "site", price: 29.99, category: "ecommerce" },
	{ tld: "market", price: 29.99, category: "ecommerce" },
	{ tld: "buy", price: 39.99, category: "ecommerce" },
	{ tld: "sale", price: 29.99, category: "ecommerce" },

	// ─── Community & Social ───
	{ tld: "community", price: 34.99, category: "community" },
	{ tld: "social", price: 29.99, category: "community" },
	{ tld: "network", price: 22.99, category: "community" },
	{ tld: "club", price: 14.99, category: "community" },
	{ tld: "team", price: 29.99, category: "community" },
	{ tld: "fan", price: 24.99, category: "community" },
	{ tld: "live", price: 24.99, category: "community" },
	{ tld: "game", price: 34.99, category: "community" },
	{ tld: "gg", price: 39.99, category: "community" },

	// ─── Geographic ───
	{ tld: "us", price: 11.99, category: "geographic" },
	{ tld: "uk", price: 8.99, category: "geographic" },
	{ tld: "ca", price: 19.99, category: "geographic" },
	{ tld: "de", price: 8.99, category: "geographic" },
	{ tld: "eu", price: 8.99, category: "geographic" },
	{ tld: "au", price: 19.99, category: "geographic" },
	{ tld: "fr", price: 9.99, category: "geographic" },
	{ tld: "in", price: 14.99, category: "geographic" },
	{ tld: "br", price: 14.99, category: "geographic" },
	{ tld: "mx", price: 19.99, category: "geographic" },
	{ tld: "nl", price: 9.99, category: "geographic" },

	// ─── Affordable & Trending ───
	{ tld: "xyz", price: 1.99, category: "affordable" },
	{ tld: "top", price: 2.99, category: "affordable" },
	{ tld: "pro", price: 17.99, category: "affordable" },
	{ tld: "life", price: 29.99, category: "affordable" },
	{ tld: "world", price: 29.99, category: "affordable" },
	{ tld: "today", price: 22.99, category: "affordable" },
	{ tld: "space", price: 2.99, category: "affordable" },
	{ tld: "website", price: 3.99, category: "affordable" },
	{ tld: "one", price: 4.99, category: "affordable" },
	{ tld: "link", price: 9.99, category: "affordable" },
	{ tld: "click", price: 4.99, category: "affordable" },
	{ tld: "email", price: 9.99, category: "affordable" },
	{ tld: "id", price: 14.99, category: "affordable" },
	{ tld: "lol", price: 9.99, category: "affordable" },
	{ tld: "fun", price: 9.99, category: "affordable" },
	{ tld: "rocks", price: 9.99, category: "affordable" },
	{ tld: "ninja", price: 14.99, category: "affordable" },
	{ tld: "guru", price: 29.99, category: "affordable" },
	{ tld: "works", price: 22.99, category: "affordable" },
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

		const trimmed = name.trim().toLowerCase();

		// Detect if the user typed a full domain like "example.com" or "my-app.io"
		// Split on the first dot: everything before is the SLD, everything after is the TLD
		const dotIndex = trimmed.indexOf(".");
		const hasTldInInput = dotIndex > 0 && dotIndex < trimmed.length - 1;

		let sld: string;
		let requestedTld: string | null = null;

		if (hasTldInInput) {
			sld = trimmed.slice(0, dotIndex).replace(/[^a-z0-9-]/g, "");
			// Support multi-part TLDs like .co.uk by taking everything after first dot
			requestedTld = trimmed.slice(dotIndex + 1).replace(/[^a-z0-9.-]/g, "");
		} else {
			sld = trimmed.replace(/[^a-z0-9-]/g, "");
		}

		if (!sld) {
			return NextResponse.json({ error: "Invalid domain name" }, { status: 400 });
		}

		// If specific TLD is requested (legacy single-TLD API path)
		if (tld && !hasTldInInput) {
			const availability = await checkDomainAvailability(sld, tld);
			const tldInfo = POPULAR_TLDS.find((t) => t.tld === tld) || {
				tld,
				price: null,
				category: "unknown",
			};

			return NextResponse.json({
				domain: `${sld}.${tld}`,
				available: availability.available,
				price: tldInfo.price,
				tld: tld,
				category: tldInfo.category,
			});
		}

		// If user typed a full domain, pin-check that specific one first
		let pinnedDomain = null;
		if (requestedTld) {
			const availability = await checkDomainAvailability(sld, requestedTld);
			const tldInfo = POPULAR_TLDS.find((t) => t.tld === requestedTld) || {
				tld: requestedTld,
				price: null,
				category: "generic",
			};
			pinnedDomain = {
				domain: `${sld}.${requestedTld}`,
				tld: requestedTld,
				available: availability.available,
				price: tldInfo.price,
				category: tldInfo.category,
				pinned: true,
			};
		}

		// Check all popular TLDs for the base SLD (exclude the pinned one to avoid duplicate)
		const results = await Promise.all(
			POPULAR_TLDS.filter((t) => t.tld !== requestedTld).map(async (tldInfo) => {
				const availability = await checkDomainAvailability(sld, tldInfo.tld);
				return {
					domain: `${sld}.${tldInfo.tld}`,
					tld: tldInfo.tld,
					available: availability.available,
					price: tldInfo.price,
					category: tldInfo.category,
					pinned: false,
				};
			}),
		);

		return NextResponse.json({ results, pinnedDomain });
	} catch (error) {
		console.error("Domain check error:", error);
		return NextResponse.json(
			{ error: "Failed to check domain availability" },
			{ status: 500 },
		);
	}
}
