// Server entry for TanStack Start on Vercel.
// The Nitro Vercel preset handles the serverless function output.
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start";

export default createStartHandler(defaultStreamHandler);