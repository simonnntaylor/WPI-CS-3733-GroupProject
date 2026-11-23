"use client"
//tells the bundler that the module and everything imported into it should be sent to and run in the user's browser
import "../../lib/amplify"
import "../../lib/auth"
import type { FormEvent } from "react"
import { signIn, confirmSignIn } from "aws-amplify/auth"
import { Amplify } from "aws-amplify"

//AWS requires a new passwrod when you first sign in. How I delt with it was found here: https://docs.amplify.aws/react/frontend/auth/multi-step-sign-in/?
export default function Login() {
  async function handleSubmit(event: FormEvent<SignInForm>) {
    event.preventDefault()
    const form = event.currentTarget
    // ... validate inputs
    const result = await signIn({
      username: form.elements.username.value,
      password: form.elements.password.value,
    
      
    });

    if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        const newPassword = prompt("Enter a new permanent password:");

        if (!newPassword) return;

        const confirmResult = await confirmSignIn({
            challengeResponse: newPassword,
        });

        console.log("Password change result:", confirmResult);
    } 
    else if (result.nextStep.signInStep === "DONE") {
        console.log("Login successful!");
        }
    }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="Username">Username:</label>
      <input type="text" id="username" name="username" />
      <label htmlFor="password">Password:</label>
      <input type="password" id="password" name="password" />
      <input type="submit" />
    </form>
  )
}


