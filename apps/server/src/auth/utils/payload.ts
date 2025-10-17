import { idSchema } from "@reactive-resume/schema";
import { z } from "zod";

export const payloadSchema = z.object({
  id: idSchema,
});

export type Payload = z.infer<typeof payloadSchema>;
