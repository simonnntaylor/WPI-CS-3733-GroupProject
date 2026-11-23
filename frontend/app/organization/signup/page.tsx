"use client";
import type { FormEvent } from "react"
import { Amplify } from "aws-amplify"
import { signUp, confirmSignUp } from "aws-amplify/auth"
import "@/lib/amplify";

interface SignUpFormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement
  email: HTMLInputElement
  password: HTMLInputElement
}

interface SignUpForm extends HTMLFormElement {
  readonly elements: SignUpFormElements
}

export default function App() {
  async function handleSubmit(event: FormEvent<SignUpForm>) {
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
        },
      },
    })

    const code = prompt("Enter confirmation code:");

    if (code === null) return;

    const result = await confirmSignUp({
    username: form.elements.username.value,
    confirmationCode: code,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email:</label>
      <input type="text" id="email" name="email" />
      <label htmlFor="username">Username:</label>
      <input type="text" id="username" name="username" />
      <label htmlFor="password">Password:</label>
      <input type="password" id="password" name="password" />
      <input type="submit" />
    </form>
  )
}