import { AppText } from "@/components/ui/Text";
import { useDeleteCustomer } from "@/hooks/useDeleteCustomer";
import type { customerStatus } from "@/lib/constants";
import { getStatusColor } from "@/lib/get-status-color";
import { theme } from "@/lib/theme";
import dayjs from "dayjs";
import {
  Clock,
  MapPin,
  PhoneCall,
  Target,
  UserCheck,
} from "lucide-react-native";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

interface CustomerCardProps {
  customer: {
    name: string;
    cpfCnpj: string;
    phone: string | null;
    status: (typeof customerStatus)[number];
    address: string | null;
    zipCode: string | null;
    city: string | null;
    state: string | null;
    note: string | null;
    id: number;
    createdAt: string | null;
    updatedAt: string;
  };
  onPress?: () => void;
}

export function CustomerCard({ customer, onPress }: CustomerCardProps) {
  const deleteCustomer = useDeleteCustomer();

  const handleLongPress = () => {
    Alert.alert(
      "Excluir Cliente",
      `Deseja realmente excluir o cliente ${customer.name}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            deleteCustomer.mutate(customer.id);
          },
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={handleLongPress}
      style={styles.card}
    >
      <View style={styles.header}>
        <AppText weight="bold" size={16} style={styles.name}>
          {customer.name}
        </AppText>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(customer.status) },
            ]}
          />
          <AppText
            size={10}
            color={theme.colors.text.secondary}
            style={styles.statusText}
          >
            {customer.status}
          </AppText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <MapPin size={14} color={theme.colors.text.secondary} />
          <AppText
            size={14}
            color={theme.colors.text.secondary}
            style={styles.address}
          >
            {customer.address}, {customer.city} - {customer.state}
          </AppText>
        </View>
        <View style={styles.row}>
          <Target size={14} color={theme.colors.text.secondary} />
          <AppText
            size={14}
            color={theme.colors.text.secondary}
            style={styles.address}
          >
            {customer.zipCode}
          </AppText>
        </View>

        <View style={styles.row}>
          <UserCheck size={14} color={theme.colors.text.secondary} />
          <AppText
            size={14}
            color={theme.colors.text.secondary}
            style={styles.address}
          >
            {customer.cpfCnpj}
          </AppText>
        </View>

        {customer.phone && (
          <View style={styles.row}>
            <PhoneCall size={14} color={theme.colors.text.secondary} />
            <AppText
              size={14}
              color={theme.colors.text.secondary}
              style={styles.address}
            >
              {customer.phone}
            </AppText>
          </View>
        )}

        <View style={[styles.row, styles.footerRow]}>
          <Clock size={14} color={theme.colors.text.secondary} />
          <AppText
            size={12}
            color={theme.colors.text.secondary}
            style={styles.address}
          >
            Atualizado em:{" "}
            {dayjs(customer.updatedAt)
              .subtract(3, "hour")
              .format("DD/MM/YYYY HH:mm")}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    color: theme.colors.text.secondary,
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  address: {
    color: theme.colors.text.secondary,
    flex: 1,
  },
  phone: {
    color: theme.colors.text.secondary,
    marginLeft: 24, // Align with address text (icon width + gap)
  },
  footerRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
