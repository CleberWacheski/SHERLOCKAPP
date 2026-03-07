import { customerStatus } from "./constants.js";
import { z } from "./zod.js";

export const CreateCustomerSchema = z.object({
  name: z.string("Campo obrigatório").min(1, "Nome é obrigatório"),
  cpfCnpj: z.string("Campo obrigatório").min(1, "CPF/CNPJ é obrigatório"),
  phone: z.string().nullish(),
  status: z.enum(customerStatus),
  address: z.string().nullish(),
  zipCode: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  note: z.string().nullish(),
  lat: z.coerce.number().nullish(),
  lon: z.coerce.number().nullish(),
});

export type CreateCustomerType = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = z.object({
  id: z.coerce.number(),
  status: z.enum(customerStatus),
  note: z.string().nullish(),
});

export type UpdateCustomerType = z.infer<typeof UpdateCustomerSchema>;
