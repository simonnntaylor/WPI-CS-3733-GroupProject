"use client";
import type { SubmitEvent } from "react"
import { Amplify } from "aws-amplify"
import { signUp, confirmSignUp, signIn } from "aws-amplify/auth"
import { apiPost } from "@/lib/api";
import "@/lib/amplify";

interface SignUpFormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement
  email: HTMLInputElement
  password: HTMLInputElement
  address: HTMLInputElement;
}

interface SignUpForm extends HTMLFormElement {
  readonly elements: SignUpFormElements
}

export default function App() {
  async function handleSubmit(event: SubmitEvent<SignUpForm>) {
    event.preventDefault()
    const form = event.currentTarget
    // ... validate inputs
  
  console.log(Amplify.getConfig().Auth?.Cognito);
    await signUp({
      username: form.elements.username.value,
      password: form.elements.password.value,
      options: {
        userAttributes: {
            email: form.elements.email.value,
            "custom:accountType": "DonationCenter",
        },
      },
    })

    const code = prompt("Enter confirmation code:");

    if (code === null) return;

    await confirmSignUp({
      username: form.elements.username.value,
      confirmationCode: code,
    });
    
    await signIn({
    username: form.elements.username.value,
    password: form.elements.password.value
    });

    await apiPost("donationCenter/register", {
        address: form.elements.address.value
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
          <label
            htmlFor="Email"
            className="text-zinc-900 dark:text-zinc-100 hover:animate-bounce font-bold"
          >
            Email:
          </label>
          <input
            type="text"
            id="email"
            name="email"
            className="text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 border border-zinc-400 dark:border-zinc-600 rounded px-2 py-1"
          />
        <label
            htmlFor="Address"
            className="text-zinc-900 dark:text-zinc-100 hover:animate-bounce font-bold"
          >
            Address:
          </label>
          <input
            type="text"
            id="address"
            name="address"
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

//   return (
//     <form onSubmit={handleSubmit}>
//       <label htmlFor="email">Email:</label>
//       <input type="text" id="email" name="email" />
//       <label htmlFor="username">Username:</label>
//       <input type="text" id="username" name="username" />
//       <label htmlFor="password">Password:</label>
//       <input type="password" id="password" name="password" />
//       <input type="submit" />
//     </form>
//   )
// }