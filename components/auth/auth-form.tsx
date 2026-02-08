"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSignIn = type === "sign-in";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For now, we'll just handle Google/Apple sign in as per auth.ts
      // NextAuth v5 credentials provider would need more setup
      console.log(`Submitting ${type} for ${email}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    setIsLoading(true);
    try {
      await signIn(provider, { redirectTo: "/dashboard" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md p-8 rounded-xl bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {isSignIn ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {isSignIn
            ? "Enter your email below to sign in to your account"
            : "Enter your email below to create your account"}
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSocialSignIn("google")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-md primary-gradient px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Google
          </button>
          <button
            onClick={() => handleSocialSignIn("apple")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-md primary-gradient px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Apple
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300 transition-colors"
          >
            {isLoading ? "Loading..." : isSignIn ? "Sign In" : "Sign Up"}
          </button>
        </form>
      </div>

      <div className="text-center text-sm">
        {isSignIn ? (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-zinc-900 dark:text-zinc-50 underline underline-offset-4"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-zinc-900 dark:text-zinc-50 underline underline-offset-4"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
