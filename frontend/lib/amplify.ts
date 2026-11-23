//Import the Amplyify library that allows us to talk to AWS cognito specifically
import { Amplify } from "aws-amplify";

//This is how you configure the cognito via the Amplify documentation: https://docs.amplify.aws/react/build-a-backend/auth/use-existing-cognito-resources/
console.log("Configuring Amplify with Cognito settings...");
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AMPLIFY_USER_POOL_ID as string,
      userPoolClientId: process.env
        .NEXT_PUBLIC_AMPLIFY_USER_POOL_CLIENT_ID as string,
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
});
