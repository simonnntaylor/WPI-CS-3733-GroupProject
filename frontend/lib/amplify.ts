//Import the Amplyify library that allows us to talk to AWS cognito specifically
import { Amplify } from "aws-amplify"

//This is how you configure the cognito via the Amplify documentation: https://docs.amplify.aws/react/build-a-backend/auth/use-existing-cognito-resources/
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_pu2srHftk",
      userPoolClientId: "2g6o0gd8kfipknvuqkh7fd942m",
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