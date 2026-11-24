//This code was bascially found and edited from this documentation: https://docs.amplify.aws/react/frontend/auth/sign-in/

interface SignInFormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement
  password: HTMLInputElement
}

export interface SignInForm extends HTMLFormElement {
  readonly elements: SignInFormElements
}
