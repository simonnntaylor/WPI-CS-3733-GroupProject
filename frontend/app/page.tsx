"use client";
import Link from "next/link";
import "../lib/auth";
import "../lib/amplify";

import { useState, useEffect } from "react";
import {
  getCurrentUser,
  signOut,
  GetCurrentUserOutput,
} from "aws-amplify/auth";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<GetCurrentUserOutput | null>(
    null,
  );

  useEffect(() => {
    async function fetchCurrentUser() {
      await getCurrentUser()
        .catch((error) => {
          if (error.name === "NotAuthorizedException") {
            console.log("Not logged in");
          } else {
            console.error("Error fetching current user:", error);
          }
        })
        .then((user) => {
          if (user) setCurrentUser(user);
        });
    }

    fetchCurrentUser();
  }, []);

  const logout = async () => {
    try {
      await signOut();
      console.log("User signed out successfully.");
      setCurrentUser(null); // Clear the current user state
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col bg-zinc-600 items-center justify-center w-full max-w-2xl max-h-120 flex-1 px-20 text-center rounded-xl">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome to Donazion!
        </h1>
        {currentUser ? (
          <>
            <p className="text-zinc-900 dark:text-zinc-100 mt-4">
              Currently logged in as: {currentUser.username}
            </p>
            <button
              onClick={logout}
              className="bg-red-500 rounded w-40 h-12 flex items-center justify-center hover:bg-red-600 transition hover:scale-105 mt-4"
            >
              <span className="text-white text-lg font-semibold">Logout</span>
            </button>
            <div className="bg-slate-500 rounded w-40 h-12 flex items-center justify-center hover:bg-red-900 transition hover:scale-105">
              <Link
                href="/change-password"
                className="text-white text-lg font-semibold"
              >
                Change Password
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-zinc-900 dark:text-zinc-100 mt-4">
              You are not logged in.
            </p>
            <div className="bg-purple-500 rounded w-40 h-12 flex items-center justify-center hover:bg-purple-600 transition hover:scale-105">
              <Link href="/login" className="text-white text-lg font-semibold">
                Login
              </Link>
            </div>
          </>
        )}

        <div className="flex flex-row items-center justify-center gap-3 mt-10">
          <div className="bg-red-500 rounded w-40 h-12 flex items-center justify-center hover:bg-red-600 transition hover:scale-105">
            <Link
              href="/organization"
              className="text-white text-lg font-semibold"
            >
              Organization
            </Link>
          </div>
          <div className="bg-blue-500 rounded w-40 h-12 flex items-center justify-center hover:bg-blue-600 transition hover:scale-105">
            <Link href="/center" className="text-white text-lg font-semibold">
              Donation Center
            </Link>
          </div>
          <div className="bg-green-500 rounded w-40 h-12 flex items-center justify-center hover:bg-green-600 transition hover:scale-105">
            <Link href="/donate" className="text-white text-lg font-semibold">
              Donate
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
