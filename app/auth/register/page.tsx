"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiChevronRight, FiUserPlus, FiAlertCircle } from "react-icons/fi";
import { ColorfulTitle } from "@/components/ui";

const AUTH_TOKEN_KEY = "joytoy_auth_token_v1";

export default function AuthRegisterPage() {
	const router = useRouter();
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [area, setArea] = useState<"inside_dhaka" | "outside_dhaka">("inside_dhaka");
	const [address, setAddress] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!fullName || !phone || !address || !area) {
			setError("Please fill all required fields.");
			return;
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters.");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fullName,
					phone,
					email: email || undefined,
					area,
					address,
					password,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Registration failed.");
			if (data?.authToken) {
				window.localStorage.setItem(AUTH_TOKEN_KEY, data.authToken);
			}
			window.dispatchEvent(new Event("joytoy-auth-changed"));
			router.push("/profile");
		} catch (err: any) {
			setError(err?.message || "Registration failed.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-soft-bg pt-34 pb-24">
			<div className="mx-auto max-w-md px-section md:max-w-xl">
				<motion.div
					className="mb-8 text-center"
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<nav className="mb-4 flex items-center justify-center gap-2 text-small text-text-muted">
						<Link href="/" className="transition-colors hover:text-primary-pink">Home</Link>
						<FiChevronRight size={12} />
						<span className="font-semibold text-text-dark">Register</span>
					</nav>
					<ColorfulTitle title="Register" as="h1" className="text-primary-pink" />
					<p className="mt-2 font-inter text-sm text-text-muted">
						Register to manage orders and delivery addresses.
					</p>
				</motion.div>

				<form onSubmit={handleRegister} className="rounded-3xl bg-white p-6 shadow-card">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<label className="font-inter text-sm font-medium text-text-dark">Full Name</label>
							<input
								type="text"
								placeholder="e.g. Maliha Rahman"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								className="w-full rounded-2xl border border-gray-200 bg-soft-bg px-4 py-3 font-inter text-sm text-text-dark placeholder:text-text-muted/60 focus:border-primary-pink focus:bg-white focus:outline-none"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="font-inter text-sm font-medium text-text-dark">Mobile</label>
							<input
								type="tel"
								placeholder="01XXXXXXXXX"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className="w-full rounded-2xl border border-gray-200 bg-soft-bg px-4 py-3 font-inter text-sm text-text-dark placeholder:text-text-muted/60 focus:border-primary-pink focus:bg-white focus:outline-none"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="font-inter text-sm font-medium text-text-dark">Email Address (Optional)</label>
							<input
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full rounded-2xl border border-gray-200 bg-soft-bg px-4 py-3 font-inter text-sm text-text-dark placeholder:text-text-muted/60 focus:border-primary-pink focus:bg-white focus:outline-none"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="font-inter text-sm font-medium text-text-dark">Delivery Area</label>
							<select
								value={area}
								onChange={(e) => setArea(e.target.value as "inside_dhaka" | "outside_dhaka")}
								className="w-full rounded-2xl border border-gray-200 bg-soft-bg px-4 py-3 font-inter text-sm text-text-dark focus:border-primary-pink focus:bg-white focus:outline-none"
							>
								<option value="inside_dhaka">Inside Dhaka</option>
								<option value="outside_dhaka">Outside Dhaka</option>
							</select>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="font-inter text-sm font-medium text-text-dark">Full Address</label>
							<textarea
								rows={3}
								placeholder="House no., Road, Area, District"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								className="w-full resize-none rounded-2xl border border-gray-200 bg-soft-bg px-4 py-3 font-inter text-sm text-text-dark placeholder:text-text-muted/60 focus:border-primary-pink focus:bg-white focus:outline-none"
							/>
						</div>

						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-1.5">
								<label className="font-inter text-sm font-medium text-text-dark">Password</label>
								<input
									type="password"
									placeholder="At least 6 characters"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full rounded-2xl border border-gray-200 bg-soft-bg px-4 py-3 font-inter text-sm text-text-dark placeholder:text-text-muted/60 focus:border-primary-pink focus:bg-white focus:outline-none"
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="font-inter text-sm font-medium text-text-dark">Confirm Password</label>
								<input
									type="password"
									placeholder="Re-enter password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="w-full rounded-2xl border border-gray-200 bg-soft-bg px-4 py-3 font-inter text-sm text-text-dark placeholder:text-text-muted/60 focus:border-primary-pink focus:bg-white focus:outline-none"
								/>
							</div>
						</div>

						{error && (
							<div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
								<FiAlertCircle className="mt-0.5" />
								<span>{error}</span>
							</div>
						)}

						<motion.button
							type="submit"
							whileHover={{ y: -2 }}
							whileTap={{ scale: 0.97 }}
							disabled={loading}
							className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3 font-inter font-semibold text-white shadow-button transition-all"
						>
							<FiUserPlus size={16} />
							{loading ? "Creating account..." : "Create Account"}
						</motion.button>

						<p className="text-center font-inter text-sm text-text-muted">
							Already have an account?{" "}
							<Link href="/auth/login" className="font-semibold text-primary-pink hover:underline">
								Login
							</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}
