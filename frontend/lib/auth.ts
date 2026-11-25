//This code was bascially found and edited from this documentation: https://docs.amplify.aws/react/frontend/auth/sign-in/

interface SignInFormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement
  password: HTMLInputElement
}

export interface SignInForm extends HTMLFormElement {
  readonly elements: SignInFormElements
}

interface ChangePasswordFormElements extends HTMLFormControlsCollection {
  oldPassword: HTMLInputElement
  newPassword: HTMLInputElement
}

export interface ChangePasswordForm extends HTMLFormElement {
  readonly elements: ChangePasswordFormElements
}
