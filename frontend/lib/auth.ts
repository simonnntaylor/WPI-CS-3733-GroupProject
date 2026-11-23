import { Amplify } from "aws-amplify"
import { signIn } from "aws-amplify/auth"
import type { FormEvent } from "react"

//This code was bascially found and edited from this documentation: https://docs.amplify.aws/react/frontend/auth/sign-in/

interface SignInFormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement
  password: HTMLInputElement
}

interface SignInForm extends HTMLFormElement {
  readonly elements: SignInFormElements
}