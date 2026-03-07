import { AppButton } from "@/components/ui/Button";
import { AppText } from "@/components/ui/Text";
import { customerStatus } from "@/lib/constants";
import { theme } from "@/lib/theme";
import { X } from "lucide-react-native";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomerFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  selectedStatus: string | undefined;
  onSelectStatus: (status: string | undefined) => void;
}

export function CustomerFiltersModal({
  visible,
  onClose,
  selectedStatus,
  onSelectStatus,
}: CustomerFiltersModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <AppText weight="bold" size={18}>
              Filtrar Clientes
            </AppText>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <AppText weight="medium" size={16} style={styles.sectionTitle}>
              Status
            </AppText>
            <View style={styles.options}>
              <TouchableOpacity
                style={[
                  styles.option,
                  selectedStatus === undefined && styles.optionSelected,
                ]}
                onPress={() => onSelectStatus(undefined)}
              >
                <AppText
                  color={
                    selectedStatus === undefined
                      ? theme.colors.text.inverse
                      : theme.colors.text.primary
                  }
                >
                  TODOS
                </AppText>
              </TouchableOpacity>
              {customerStatus.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.option,
                    selectedStatus === status && styles.optionSelected,
                  ]}
                  onPress={() => onSelectStatus(status)}
                >
                  <AppText
                    color={
                      selectedStatus === status
                        ? theme.colors.text.inverse
                        : theme.colors.text.primary
                    }
                  >
                    {status}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <AppButton onPress={onClose}>
              <AppText color={theme.colors.text.inverse} weight="bold">
                Aplicar Filtros
              </AppText>
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
