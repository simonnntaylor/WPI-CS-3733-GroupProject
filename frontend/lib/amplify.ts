//Import the Amplyify library that allows us to talk to AWS cognito specifically
import { Amplify } from "aws-amplify"

//This is how you configure the cognito via the Amplify documentation: https://docs.amplify.aws/react/build-a-backend/auth/use-existing-cognito-resources/
console.log("Configuring Amplify with Cognito settings...")
console.log(process.env.NEXT_PUBLIC_AMPLIFY_USER_POOL_ID)
console.log(process.env.NEXT_PUBLIC_AMPLIFY_USER_POOL_CLIENT_ID)
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AMPLIFY_USER_POOL_ID,
      userPoolClientId: process.env.NEXT_PUBLIC_AMPLIFY_USER_POOL_CLIENT_ID,
      loginWith: {
        username: true,
      },
      signUpVerificationMethod: "code",
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
})
