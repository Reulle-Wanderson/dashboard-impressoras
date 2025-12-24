export const isProd = () => {
  console.log(
    "APP_ENV:",
    process.env.NEXT_PUBLIC_APP_ENV,
    "NODE_ENV:",
    process.env.NODE_ENV
  );

  return process.env.NEXT_PUBLIC_APP_ENV === "production";
};
