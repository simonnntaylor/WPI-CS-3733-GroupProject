"use client";
// tells the bundler that the module and everything imported into it should be
// sent to and run in the user's browser
import "../../lib/amplify";
import "../../lib/auth";
import { useEffect, useState, type SubmitEvent } from "react";
import {
  signIn,
  confirmSignIn,
  GetCurrentUserOutput,
  getCurrentUser,
} from "aws-amplify/auth";
import { SignInForm } from "../../lib/auth";
import { redirect } from "next/navigation";

// AWS requires a new passwrod when you first sign in. How I delt with it was
// found here: https://docs.amplify.aws/react/frontend/auth/multi-step-sign-in/?
export default function Login() {
  const [currentUser, setCurrentUser] = useState<GetCurrentUserOutput | null>(
    null,
  );

  useEffect(() => {
    async function fetchCurrentUser() {
      await getCurrentUser()
        .catch((_) => {
          // expecting user to be logged out
        })
        .then((user) => {
          if (user) {
            alert("You are already signed in");
            redirect("/");
          }
        });
    }

    fetchCurrentUser();
  }, []);
  async function handleSubmit(event: SubmitEvent<SignInForm>) {
    event.preventDefault();
    const form = event.currentTarget;
    // ... validate inputs
    await signIn({
      username: form.elements.username.value,
      password: form.elements.password.value,
    })
      .catch((error) => {
        if (error.name === "UserNotFoundException") {
          alert("User not found. Please check your username.");
        } else if (error.name === "NotAuthorizedException") {
          alert("Incorrect password. Please try again.");
        } else {
          console.error("Error signing in:", error);
        }
      })
      .then(async (result) => {
        if (!result) return;
        if (
          result.nextStep.signInStep ===
          "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
        ) {
          const newPassword = prompt("Enter a new permanent password:");

          if (!newPassword) return;

          const confirmResult = await confirmSignIn({
            challengeResponse: newPassword,
          });

          console.log("Password change result:", confirmResult);
        } else if (
          result.nextStep.signInStep === "CONTINUE_SIGN_IN_WITH_EMAIL_SETUP"
        ) {
          // Handle email setup step if needed
          // You can prompt the user to set up their email or perform any
          // necessary actions here
        } else if (result.nextStep.signInStep === "DONE") {
          console.log("Login successful!");
          redirect("/");
        }
      });
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col bg-zinc-600 items-center justify-center w-full max-w-2xl max-h-120 flex-1 px-20 text-center rounded-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label
            htmlFor="Username"
            className="text-zinc-900 dark:text-zinc-100 hover:animate-bounce font-bold"
          >
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 border border-zinc-400 dark:border-zinc-600 rounded px-2 py-1"
          />
          <label
            htmlFor="password"
            className="text-zinc-900 dark:text-zinc-100 hover:animate-bounce font-bold"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 border border-zinc-400 dark:border-zinc-600 rounded px-2 py-1"
          />
          <input
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          />
        </form>
      </main>
    </div>
  );
}
