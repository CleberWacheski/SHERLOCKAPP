import { customerStatus } from "./constants";
import { z } from "./zod";

export const SignInSchema = z.object({
  email: z.email("Digite um email válido"),
  password: z.string().min(1, "Campo obrigatório"),
});

export type SignInType = z.infer<typeof SignInSchema>;

export const SignUpSchema = z
  .object({
    name: z
      .string("Campo obrigatório")
      .refine(
        (name) => name.split(" ").length >= 2,
        "Digite seu nome e sobrenome",
      ),
    email: z.email("Digite um email válido"),
    password: z
      .string("Campo obrigatório")
      .min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string("Campo obrigatório").min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export type SignUpType = z.infer<typeof SignUpSchema>;

export const CreateCustomerSchema = z.object({
  name: z.string("Campo obrigatório").min(1, "Nome é obrigatório"),
  cpfCnpj: z.string("Campo obrigatório").min(1, "CPF/CNPJ é obrigatório"),
  phone: z.string().nullish(),
  status: z.union(
    customerStatus.map((c) => z.literal(c, { message: "Status inválido" })),
  ),
  address: z.string().nullish(),
  zipCode: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  note: z.string().nullish(),
  lat: z.coerce.number().nullish(),
  lon: z.coerce.number().nullish(),
});

export type CreateCustomerType = z.infer<typeof CreateCustomerSchema>;

export const PostLocationSchema = z.object({
  lat: z.coerce.number(),
  log: z.coerce.number(),
});

export type PostLocationType = z.infer<typeof PostLocationSchema>;

export const UpdateCustomerSchema = z.object({
  id: z.coerce.number(),
  status: z.enum(customerStatus),
  note: z.string().nullish(),
});

export type UpdateCustomerType = z.infer<typeof UpdateCustomerSchema>;
