"use client";
//tells the bundler that the module and everything imported into it should be sent to and run in the user's browser
import "@/lib/amplify";
import "@/lib/auth";
import type { SubmitEvent } from "react";
import React, { useEffect } from "react";
import Link from "next/link";
import {
  updatePassword,
  getCurrentUser,
} from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import { ChangePasswordForm } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function ChangePassword() {
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  const [changedPassword, setChangedPassword] = React.useState(false);

  async function handleSubmit(event: SubmitEvent<ChangePasswordForm>) {
    event.preventDefault();
    const form = event.currentTarget;

    await updatePassword({
      oldPassword: form.elements.oldPassword.value,
      newPassword: form.elements.newPassword.value,
    })
      .then(() => {
        alert("Password changed successfully!");
        form.reset();
      })
      .catch((error) => {
        console.error("Error changing password:", error);
        alert("Error changing password: " + error.message);
      });
  }

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        console.log("Current user:", user);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    }

    fetchCurrentUser();
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col bg-zinc-600 items-center justify-center w-full max-w-2xl max-h-120 flex-1 px-20 text-center rounded-xl">
        {currentUser ? (
          "Currently logged in as: " + currentUser.username
        ) : (
          <>
            <h1>Not logged in</h1>
            <Link href="/login" className="text-blue-500 hover:underline">
              Go to Login Page
            </Link>
          </>
        )}
        {currentUser && (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label
                htmlFor="oldPassword"
                className="text-zinc-900 dark:text-zinc-100 hover:animate-bounce font-bold"
              >
                Old Password
              </label>
              <input
                type="password"
                name="oldPassword"
                id="oldPassword"
                className="text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 border border-zinc-400 dark:border-zinc-600 rounded px-2 py-1"
              />
              <label
                htmlFor="newPassword"
                className="text-zinc-900 dark:text-zinc-100 hover:animate-bounce font-bold"
              >
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                className="text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 border border-zinc-400 dark:border-zinc-600 rounded px-2 py-1"
              />
              <input
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
              />
            </form>
          </>
        )}
        {changedPassword && <span className="text-emerald-500">Password changed successfully!</span>}
      </main>
    </div>
  );
}
