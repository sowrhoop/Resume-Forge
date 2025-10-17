import { idSchema } from "@reactive-resume/schema";
import { z } from "zod";

export const secretsSchema = z.object({
  id: idSchema,
  password: z.string().nullable(),
  lastSignedIn: z.date().nullable(),
  refreshToken: z.string().nullable(),
  resetToken: z.string().nullable(),
  userId: idSchema,
});
