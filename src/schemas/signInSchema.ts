import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string(), // identifier == username
  password: z.string(), // password
});
