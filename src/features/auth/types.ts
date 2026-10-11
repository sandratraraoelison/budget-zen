import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  isDemo: z.boolean(),
  createdAt: z.string(),
});

export type AuthUser = z.infer<typeof userSchema>;
export type AuthMode = "login" | "register";
export const loginSchema = z.object({
  email: z.string().trim().email("Saisissez une adresse email valide.").max(254),
  password: z.string().min(12, "Le mot de passe doit contenir au moins 12 caractères.").max(128),
}).strict();
export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, "Saisissez votre nom.").max(100),
});
