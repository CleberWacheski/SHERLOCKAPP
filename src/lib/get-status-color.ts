import type { customerStatus } from "./constants";
import { theme } from "./theme";

export const getStatusColor = (status: (typeof customerStatus)[number]) => {
  switch (status) {
    case "CONCLUÍDO COM SUCESSO":
      return theme.colors.status.success;
    case "AGUARDANDO VISITA":
      return theme.colors.status.info;
    case "CANCELADO":
      return theme.colors.status.error;
    default:
      return theme.colors.text.primary;
  }
};
