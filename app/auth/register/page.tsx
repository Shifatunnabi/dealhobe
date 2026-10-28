"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";
import AuthShell, { AuthField, authInputClass } from "@/components/content/AuthShell";
import PasswordInput from "@/components/content/PasswordInput";

const AUTH_TOKEN_KEY = "dealhobe_auth_token_v1";

type Area = "inside_dhaka" | "outside_dhaka";
const AREAS: { value: Area; label: string }[] = [
	{ value: "inside_dhaka", label: "Inside Dhaka" },
	{ value: "outside_dhaka", label: "Outside Dhaka" },
];

export default function AuthRegisterPage() {
	const router = useRouter();
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [area, setArea] = useState<Area>("inside_dhaka");
	const [address, setAddress] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	// Which field the current client-side error is about (presentation only).
	const [errorField, setErrorField] = useState<"" | "required" | "password" | "confirm">("");

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setErrorField("");

		if (!fullName || !phone || !address || !area) {
			setError("Please fill all required fields.");
			setErrorField("required");
			return;
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters.");
			setErrorField("password");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			setErrorField("confirm");
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
			window.dispatchEvent(new Event("dealhobe-auth-changed"));
			router.push("/profile");
		} catch (err) {
			setError((err instanceof Error && err.message) || "Registration failed.");
		} finally {
			setLoading(false);
		}
	};

	const missing = (v: string) => errorField === "required" && !v.trim();

	return (
		<AuthShell
			wide
			crumb="Create account"
			eyebrow="Join DealHobe"
			title="Create your account"
			subtitle="Takes under a minute. Save your delivery address once and check out faster every time."
			footer={
				<>
					Already have an account?{" "}
					<Link href="/auth/login" className="font-bold text-primary-pink hover:underline">
						Sign in
					</Link>
				</>
			}
		>
			<form onSubmit={handleRegister} noValidate className="flex flex-col gap-5">
				<AuthField id="fullName" label="Full name">
					<input
						id="fullName"
						type="text"
						autoComplete="name"
						placeholder="e.g. Maliha Rahman"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						aria-invalid={missing(fullName) || undefined}
						className={authInputClass}
					/>
				</AuthField>

				<div className="grid gap-5 sm:grid-cols-2">
					<AuthField id="phone" label="Mobile number">
						<input
							id="phone"
							type="tel"
							inputMode="tel"
							autoComplete="tel"
							placeholder="01XXXXXXXXX"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							aria-invalid={missing(phone) || undefined}
							className={authInputClass}
						/>
					</AuthField>
					<AuthField id="email" label="Email" hint="Optional">
						<input
							id="email"
							type="email"
							autoComplete="email"
							autoCapitalize="none"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className={authInputClass}
						/>
					</AuthField>
				</div>

				<fieldset className="flex flex-col gap-1.5">
					<legend className="mb-1.5 text-sm font-semibold text-text-dark">Delivery area</legend>
					<div className="grid grid-cols-2 gap-2 rounded-xl bg-plum/[0.04] p-1">
						{AREAS.map((a) => (
							<label
								key={a.value}
								className={`flex cursor-pointer items-center justify-center rounded-lg px-3 py-2.5 text-sm font-bold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary-pink ${
									area === a.value ? "bg-white text-primary-pink shadow-tile" : "text-text-muted hover:text-text-dark"
								}`}
							>
								<input
									type="radio"
									name="area"
									value={a.value}
									checked={area === a.value}
									onChange={() => setArea(a.value)}
									className="sr-only"
								/>
								{a.label}
							</label>
						))}
					</div>
				</fieldset>

				<AuthField id="address" label="Full address">
					<textarea
						id="address"
						rows={3}
						autoComplete="street-address"
						placeholder="House no., Road, Area, District"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						aria-invalid={missing(address) || undefined}
						className={`${authInputClass} resize-none`}
					/>
				</AuthField>

				<div className="grid gap-5 sm:grid-cols-2">
					<AuthField id="password" label="Password">
						<PasswordInput
							id="password"
							value={password}
							onChange={setPassword}
							placeholder="At least 6 characters"
							autoComplete="new-password"
							invalid={errorField === "password"}
						/>
					</AuthField>
					<AuthField id="confirmPassword" label="Confirm password">
						<PasswordInput
							id="confirmPassword"
							value={confirmPassword}
							onChange={setConfirmPassword}
							placeholder="Re-enter password"
							autoComplete="new-password"
							invalid={errorField === "confirm"}
						/>
					</AuthField>
				</div>

				{error && (
					<div role="alert" className="flex items-start gap-2.5 rounded-xl border border-primary-pink/20 bg-primary-pink/[0.05] px-4 py-3 text-sm font-medium text-primary-pink">
						<FiAlertCircle className="mt-0.5 shrink-0" aria-hidden />
						<span>{error}</span>
					</div>
				)}

				<button
					type="submit"
					disabled={loading}
					className="group mt-1 flex h-[52px] items-center justify-center gap-2 rounded-full bg-primary-pink text-[15px] font-bold text-white shadow-button transition-[transform,background-color,opacity] hover:bg-[#8E1712] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
				>
					{loading ? (
						<>
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
							Creating your account…
						</>
					) : (
						<>
							Create account
							<FiArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
						</>
					)}
				</button>
			</form>
		</AuthShell>
	);
}
