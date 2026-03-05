import { db } from ".";
import type { customerStatus } from "../constants";
import { customer } from "./schema";

const customers = [
  {
    name: "Mercado do João",
    phone: "(11) 98765-4321",
    cpfCnpj: "22247982000153",
    status: "AGUARDANDO VISITA", // AGUARDANDO VISITA
    address: "Rua das Flores, 123",
    zipCode: "01234-567",
    city: "São Paulo",
    state: "SP",
    lat: "-23.550520",
    lon: "-46.633308",
    note: "Cliente interessado em produtos de limpeza.",
    userId: "6JRkRGeciB4MGZTFX1Ibyrzsy3qfElzI",
  },
  {
    name: "Padaria da Maria",
    phone: "(21) 91234-5678",
    cpfCnpj: "83351220000197",
    status: "AGUARDANDO RESPOSTA", // AGUARDANDO RESPOSTA
    address: "Av. Atlântica, 456",
    zipCode: "22070-000",
    city: "Rio de Janeiro",
    state: "RJ",
    lat: "-22.969440",
    lon: "-43.187220",
    note: "Precisa de renovação de estoque semanal.",
    userId: "6JRkRGeciB4MGZTFX1Ibyrzsy3qfElzI",
  },
  {
    name: "Restaurante Sabor Caseiro",
    phone: "(31) 99888-7777",
    cpfCnpj: "20045720000180",
    status: "REALIZAR REUNIÃO", // REALIZAR REUNIÃO
    address: "Rua da Bahia, 789",
    zipCode: "30160-011",
    city: "Belo Horizonte",
    state: "MG",
    lat: "-19.916681",
    lon: "-43.934493",
    note: "Agendar visita para apresentar novos produtos.",
    userId: "6JRkRGeciB4MGZTFX1Ibyrzsy3qfElzI",
  },
  {
    name: "Tech Solutions Ltda",
    phone: "(41) 97777-6666",
    cpfCnpj: "73368124000106",
    status: "CONCLUÍDO COM SUCESSO", // CONCLUÍDO COM SUCESSO
    address: "Rua XV de Novembro, 1000",
    zipCode: "80020-310",
    city: "Curitiba",
    state: "PR",
    lat: "-25.4284",
    lon: "-49.2733",
    note: "Contrato fechado por 12 meses.",
    userId: "6JRkRGeciB4MGZTFX1Ibyrzsy3qfElzI",
  },
  {
    name: "Loja de Conveniência Express",
    phone: "(51) 96666-5555",
    status: "CANCELADO", // CANCELADO
    cpfCnpj: "47243178000127",
    address: "Av. Ipiranga, 2000",
    zipCode: "90160-090",
    city: "Porto Alegre",
    state: "RS",
    lat: "-30.0346",
    lon: "-51.2177",
    note: "Cliente optou pelo concorrente.",
    userId: "6JRkRGeciB4MGZTFX1Ibyrzsy3qfElzI",
  },
];

export async function seed() {
  console.log("🌱 Starting seed...");
  try {
    await db.insert(customer).values(
      customers.map((c, i) => ({
        ...c,
        status: c.status as (typeof customerStatus)[number],
      })),
    );
    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  }
}

seed();
