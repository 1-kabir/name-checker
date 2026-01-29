"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Check,
	Globe,
	Loader2,
	Search,
	Sparkles,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";

interface DomainResult {
	domain: string;
	tld: string;
	available: boolean | null;
	price: number | null;
}

interface SocialResult {
	platform: string;
	url: string | null;
	available: boolean | null;
	status: string;
}

export default function NameChecker() {
	const [searchName, setSearchName] = useState("");
	const [isChecking, setIsChecking] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [domainResults, setDomainResults] = useState<DomainResult[]>([]);
	const [socialResults, setSocialResults] = useState<SocialResult[]>([]);
	const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
	const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
		new Set(),
	);
	const [activeTab, setActiveTab] = useState<"domains" | "social">("domains");

	const handleSearch = async () => {
		if (!searchName.trim()) return;

		setIsChecking(true);
		setDomainResults([]);
		setSocialResults([]);

		try {
			// Check domains
			const domainRes = await fetch("/api/check-domain", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: searchName }),
			});
			const domainData = await domainRes.json();
			setDomainResults(domainData.results || []);

			// Check social media
			const socialRes = await fetch("/api/check-social", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username: searchName }),
			});
			const socialData = await socialRes.json();
			setSocialResults(socialData.results || []);
		} catch (error) {
			console.error("Search error:", error);
		} finally {
			setIsChecking(false);
		}
	};

	const handleGenerateNames = async () => {
		if (!searchName.trim()) return;

		setIsGenerating(true);
		try {
			const res = await fetch("/api/generate-names", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: searchName, count: 12 }),
			});
			const data = await res.json();
			setAiSuggestions(data.suggestions || []);
			setSelectedSuggestions(new Set());
		} catch (error) {
			console.error("Generation error:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const toggleSuggestion = (name: string) => {
		const newSelected = new Set(selectedSuggestions);
		if (newSelected.has(name)) {
			newSelected.delete(name);
		} else {
			newSelected.add(name);
		}
		setSelectedSuggestions(newSelected);
	};

	const handleCheckSelected = async () => {
		if (selectedSuggestions.size === 0) return;

		setIsChecking(true);
		const names = Array.from(selectedSuggestions);

		try {
			const results = await Promise.all(
				names.map(async (name) => {
					const res = await fetch("/api/check-domain", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ name }),
					});
					return res.json();
				}),
			);

			const allDomains = results.flatMap((r) => r.results || []);
			setDomainResults(allDomains);
			setActiveTab("domains");
		} catch (error) {
			console.error("Bulk check error:", error);
		} finally {
			setIsChecking(false);
		}
	};

	const availableDomains = domainResults.filter((d) => d.available === true);
	const takenDomains = domainResults.filter((d) => d.available === false);
	const unknownDomains = domainResults.filter((d) => d.available === null);
	const availableSocial = socialResults.filter((s) => s.available === true);
	const takenSocial = socialResults.filter((s) => s.available === false);

	return (
		<div className="min-h-screen bg-white text-black p-4 md:p-8 flex flex-col">
			<div className="max-w-6xl mx-auto w-full flex-grow">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-12"
				>
					<h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
						Name Checker
					</h1>
					<p className="text-lg text-gray-600">
						Check domain availability, social media usernames, and generate
						AI-powered brand names
					</p>
				</motion.div>

				{/* Search Bar */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="mb-8"
				>
					<div className="relative max-w-2xl mx-auto">
						<input
							type="text"
							value={searchName}
							onChange={(e) => setSearchName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSearch()}
							placeholder="Enter a brand name..."
							className="w-full px-6 py-4 text-lg border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-black transition-all"
						/>
						<button
							type="button"
							onClick={handleSearch}
							disabled={isChecking || !searchName.trim()}
							className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors hover:bg-gray-800"
						>
							{isChecking ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<Search className="w-5 h-5" />
							)}
						</button>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-center gap-4 mt-4">
						<button
							type="button"
							onClick={handleGenerateNames}
							disabled={isGenerating || !searchName.trim()}
							className="flex items-center gap-2 px-6 py-2 border-2 border-black hover:bg-black hover:text-white disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed transition-all"
						>
							{isGenerating ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Sparkles className="w-4 h-4" />
							)}
							Generate Similar Names
						</button>
					</div>
				</motion.div>

				{/* AI Suggestions */}
				<AnimatePresence>
					{aiSuggestions.length > 0 && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="mb-8 border-2 border-black p-6"
						>
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-2xl font-bold">AI Suggestions</h2>
								{selectedSuggestions.size > 0 && (
									<button
										type="button"
										onClick={handleCheckSelected}
										disabled={isChecking}
										className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
									>
										Check Selected ({selectedSuggestions.size})
									</button>
								)}
							</div>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
								{aiSuggestions.map((name, index) => (
									<motion.button
										key={name}
										type="button"
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: index * 0.05 }}
										onClick={() => toggleSuggestion(name)}
										className={`px-4 py-3 border-2 border-black text-left transition-all ${
											selectedSuggestions.has(name)
												? "bg-black text-white"
												: "bg-white hover:bg-gray-100"
										}`}
									>
										{name}
									</motion.button>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Results */}
				{(domainResults.length > 0 || socialResults.length > 0) && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						{/* Tabs */}
						<div className="flex border-b-2 border-black mb-6">
							<button
								type="button"
								onClick={() => setActiveTab("domains")}
								className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
									activeTab === "domains"
										? "bg-black text-white"
										: "bg-white text-black hover:bg-gray-100"
								}`}
							>
								<Globe className="w-4 h-4" />
								Domains ({domainResults.length})
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("social")}
								className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
									activeTab === "social"
										? "bg-black text-white"
										: "bg-white text-black hover:bg-gray-100"
								}`}
							>
								<Users className="w-4 h-4" />
								Social Media ({socialResults.length})
							</button>
						</div>

						{/* Domain Results */}
						{activeTab === "domains" && (
							<div className="space-y-6">
								{availableDomains.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-3 flex items-center gap-2">
											<Check className="w-5 h-5" /> Available Domains
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{availableDomains.map((domain, index) => (
												<motion.div
													key={domain.domain}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="p-4 border-2 border-black bg-white"
												>
													<div className="flex justify-between items-start">
														<div>
															<p className="font-bold">{domain.domain}</p>
															{domain.price && (
																<p className="text-sm text-gray-600">
																	${domain.price}/year
																</p>
															)}
														</div>
														<Check className="w-5 h-5 text-green-600" />
													</div>
												</motion.div>
											))}
										</div>
									</div>
								)}

								{takenDomains.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-3 flex items-center gap-2">
											<X className="w-5 h-5" /> Taken Domains
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{takenDomains.map((domain, index) => (
												<motion.div
													key={domain.domain}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="p-4 border-2 border-gray-300 bg-gray-50 text-gray-500"
												>
													<div className="flex justify-between items-start">
														<div>
															<p className="font-bold line-through">
																{domain.domain}
															</p>
															{domain.price && (
																<p className="text-sm">${domain.price}/year</p>
															)}
														</div>
														<X className="w-5 h-5 text-red-600" />
													</div>
												</motion.div>
											))}
										</div>
									</div>
								)}

								{unknownDomains.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-3 flex items-center gap-2">
											Unknown Status
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{unknownDomains.map((domain, index) => (
												<motion.div
													key={domain.domain}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="p-4 border-2 border-gray-300 bg-white text-gray-700"
												>
													<div className="flex justify-between items-start">
														<div>
															<p className="font-bold">{domain.domain}</p>
															{domain.price && (
																<p className="text-sm text-gray-600">
																	${domain.price}/year
																</p>
															)}
														</div>
														<span className="text-sm text-gray-500">?</span>
													</div>
												</motion.div>
											))}
										</div>
									</div>
								)}
							</div>
						)}

						{/* Social Media Results */}
						{activeTab === "social" && (
							<div className="space-y-6">
								{availableSocial.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-3 flex items-center gap-2">
											<Check className="w-5 h-5" /> Available Usernames
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{availableSocial.map((social, index) => (
												<motion.a
													key={social.platform}
													href={social.url || "#"}
													target="_blank"
													rel="noopener noreferrer"
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="p-4 border-2 border-black bg-white hover:bg-gray-50 transition-colors"
												>
													<div className="flex justify-between items-center">
														<p className="font-bold">{social.platform}</p>
														<Check className="w-5 h-5 text-green-600" />
													</div>
												</motion.a>
											))}
										</div>
									</div>
								)}

								{takenSocial.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-3 flex items-center gap-2">
											<X className="w-5 h-5" /> Taken Usernames
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{takenSocial.map((social, index) => (
												<motion.a
													key={social.platform}
													href={social.url || "#"}
													target="_blank"
													rel="noopener noreferrer"
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="p-4 border-2 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
												>
													<div className="flex justify-between items-center">
														<p className="font-bold line-through">
															{social.platform}
														</p>
														<X className="w-5 h-5 text-red-600" />
													</div>
												</motion.a>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</motion.div>
				)}

				{/* Empty State */}
				{!isChecking &&
					domainResults.length === 0 &&
					socialResults.length === 0 && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-center py-20 text-gray-400"
						>
							<p className="text-lg">
								Enter a brand name to check availability
							</p>
						</motion.div>
					)}
			</div>

			{/* Footer */}
			<footer className="w-full max-w-6xl mx-auto mt-16 pt-8 border-t-2 border-gray-200">
				<div className="text-center text-gray-600">
					<p className="text-sm md:text-base">
						Made with{" "}
						<span className="text-red-500 animate-pulse inline-block">❤</span>{" "}
						by{" "}
						<a
							href="https://www.kabirstudios.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="font-semibold text-black hover:underline transition-all"
						>
							Kabir
						</a>
					</p>
				</div>
			</footer>
		</div>
	);
}
