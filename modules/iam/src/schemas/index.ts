import { z } from "zod";

export const CreateUserSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters"),
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  avatarUrl: z.string().url("Invalid avatar file URL").optional(),
});

export const UpdateUserSchema = z.object({
  name:     z.string().min(2).optional(),
  email:    z.string().email().optional(),
  password: z.string().min(8).optional(),
  avatarUrl: z.string().url().optional(),
});

export const CreateRoleSchema = z.object({
  name:  z.string().min(2).regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores"),
  label: z.string().min(2, "Label must be at least 2 characters"),
});

export const UpdateRoleSchema = z.object({
  label: z.string().min(2).optional(),
});

export type CreateUserInput  = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput  = z.infer<typeof UpdateUserSchema>;
export type CreateRoleInput  = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput  = z.infer<typeof UpdateRoleSchema>;
