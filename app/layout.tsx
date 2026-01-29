import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://name-checker.vercel.app"),
	title: {
		default: "Name Checker - Check Domain & Social Media Username Availability",
		template: "%s | Name Checker",
	},
	description:
		"Check domain availability across popular TLDs, verify social media username availability on 20+ platforms, and generate AI-powered brand name suggestions. Free tool for entrepreneurs, startups, and businesses.",
	keywords: [
		"domain availability checker",
		"username availability",
		"social media username checker",
		"brand name generator",
		"domain checker",
		"TLD checker",
		"business name generator",
		"startup name ideas",
		"AI name generator",
		"check domain name",
		"instagram username checker",
		"twitter username availability",
		"github username checker",
	],
	authors: [{ name: "Kabir", url: "https://www.kabirstudios.com/" }],
	creator: "Kabir",
	publisher: "Kabir Studios",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://name-checker.vercel.app",
		title: "Name Checker - Check Domain & Social Media Username Availability",
		description:
			"Check domain availability across popular TLDs, verify social media username availability on 20+ platforms, and generate AI-powered brand name suggestions.",
		siteName: "Name Checker",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Name Checker - Domain and Username Availability Tool",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Name Checker - Check Domain & Social Media Username Availability",
		description:
			"Check domain availability across popular TLDs, verify social media username availability on 20+ platforms, and generate AI-powered brand name suggestions.",
		images: ["/og-image.png"],
		creator: "@kabirstudios",
	},
	alternates: {
		canonical: "https://name-checker.vercel.app",
	},
	verification: {
		google: "your-google-verification-code",
		// yandex: "your-yandex-verification-code",
		// bing: "your-bing-verification-code",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="canonical" href="https://name-checker.vercel.app" />
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebApplication",
							name: "Name Checker",
							description:
								"Check domain availability, social media usernames, and generate AI-powered brand name suggestions",
							url: "https://name-checker.vercel.app",
							applicationCategory: "BusinessApplication",
							offers: {
								"@type": "Offer",
								price: "0",
								priceCurrency: "USD",
							},
							author: {
								"@type": "Person",
								name: "Kabir",
								url: "https://www.kabirstudios.com/",
							},
							creator: {
								"@type": "Organization",
								name: "Kabir Studios",
								url: "https://www.kabirstudios.com/",
							},
							keywords:
								"domain checker, username availability, social media checker, brand name generator, TLD checker",
							aggregateRating: {
								"@type": "AggregateRating",
								ratingValue: "4.8",
								ratingCount: "1000",
							},
						}),
					}}
				/>
			</head>
			<body className="antialiased">{children}</body>
		</html>
	);
}
