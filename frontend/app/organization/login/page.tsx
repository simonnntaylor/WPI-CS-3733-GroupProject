"use client";
//tells the bundler that the module and everything imported into it should be sent to and run in the user's browser
import "../../../lib/amplify";
import "../../../lib/auth";
import type { FormEvent } from "react";
import { signIn, confirmSignIn } from "aws-amplify/auth";
import { Amplify } from "aws-amplify";

//AWS requires a new passwrod when you first sign in. How I delt with it was found here: https://docs.amplify.aws/react/frontend/auth/multi-step-sign-in/?
export default function Login() {
  async function handleSubmit(event: FormEvent<SignInForm>) {
    event.preventDefault();
    const form = event.currentTarget;
    // ... validate inputs
    try {
      const result = await signIn({
        username: form.elements.username.value,
        password: form.elements.password.value,
      });
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
      } else if (result.nextStep.signInStep === "DONE") {
        console.log("Login successful!");
      }
    } catch (NoAuthorizationException) {
      alert("Invalid username or password. Please try again.");
    }
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
