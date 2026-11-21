export const handler = async (event: any) => {
  // 1. Read the request.
  //    event.body is a STRING of JSON, like '{"token":"abc123"}'
  //    TODO: turn it into an object with JSON.parse, and get the token out

  // 2. Check the token.
  //    TODO: if there's no token, or it doesn't match a donation center,
  //          return statusCode 400 with { error: "Invalid or expired token" }

  // 3. Look up the donation center's info (name, address, etc.)
  //    TODO

  // 4. Look up that center's inventory items
  //    TODO

  // 5. Calculate the summary numbers
  //    TODO: total number of items, total value, whatever your Figma shows

  // 6. Send it back
  //    TODO: return statusCode 200 with everything in the body
};
