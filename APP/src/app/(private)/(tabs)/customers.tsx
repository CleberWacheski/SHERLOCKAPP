import { CreateCustomerModal } from "@/components/CreateCustomerModal";
import { CustomerCard } from "@/components/CustomerCard";
import { CustomerFiltersModal } from "@/components/CustomerFiltersModal";
import { AppButton } from "@/components/ui/Button";
import { AppInput } from "@/components/ui/Input";
import { Layout } from "@/components/ui/Layout";
import { AppText } from "@/components/ui/Text";
import { useCustomers } from "@/hooks/useCustomers";
import { useUpdateCustomer } from "@/hooks/useUpdateCustomer";
import type { customerStatus } from "@/lib/constants";
import { customerStatus as customerStatusList } from "@/lib/constants";
import { getStatusColor } from "@/lib/get-status-color";
import { theme } from "@/lib/theme";
import { useLocalSearchParams } from "expo-router";
import { Filter, Plus, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDebounce } from "use-debounce";

export default function CustomersScreen() {
  const params = useLocalSearchParams<{ search?: string }>();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  // Update modal state
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    note: string | null;
    status: (typeof customerStatus)[number];
  } | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editStatus, setEditStatus] = useState<
    (typeof customerStatus)[number] | null
  >(null);
  const { mutate: updateCustomer, isPending: isUpdating } =
    useUpdateCustomer();

  useEffect(() => {
    if (params.search) {
      setSearch(params.search);
    }
  }, [params.search]);

  const handleCardPress = (customer: {
    id: number;
    name: string;
    note: string | null;
    status: (typeof customerStatus)[number];
  }) => {
    setSelectedCustomer(customer);
    setEditNote(customer.note || "");
    setEditStatus(customer.status);
    setUpdateModalVisible(true);
  };

  const handleUpdate = () => {
    if (!selectedCustomer || !editStatus) return;
    updateCustomer(
      {
        id: selectedCustomer.id,
        status: editStatus,
        note: editNote,
      },
      {
        onSuccess: () => {
          setUpdateModalVisible(false);
          refetch();
        },
      },
    );
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useCustomers({
    query: debouncedSearch,
    status: statusFilter,
  });

  const customers = data?.pages.flatMap((page) => page.customers) ?? [];

  return (
    <Layout style={styles.container}>
      <View style={styles.header}>
        <AppText weight="bold" size={24}>
          Clientes
        </AppText>
      </View>
      <AppButton
        style={styles.createButton}
        onPress={() => setIsCreateModalVisible(true)}
      >
        <Plus size={20} color="white" />
      </AppButton>

      <View style={styles.filters}>
        <View style={styles.searchContainer}>
          <AppInput
            placeholder="Buscar por nome, CPF/CNPJ..."
            value={search}
            onChangeText={setSearch}
            containerStyle={styles.searchInput}
          />
        </View>
        <AppButton
          style={styles.filterButton}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Filter
            size={20}
            color={
              statusFilter
                ? theme.colors.text.inverse
                : theme.colors.text.primary
            }
          />
        </AppButton>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={customers}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <CustomerCard
              customer={item}
              onPress={() => handleCardPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={styles.footerLoader}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText
                color={theme.colors.text.secondary}
                align="center"
                size={16}
              >
                Nenhum cliente encontrado
              </AppText>
            </View>
          }
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      )}
      <CustomerFiltersModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        selectedStatus={statusFilter}
        onSelectStatus={(status) => {
          setStatusFilter(status);
          setIsFilterModalVisible(false);
        }}
      />
      <CreateCustomerModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
      <Modal
        animationType="slide"
        transparent
        visible={updateModalVisible}
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableWithoutFeedback
            onPress={() => setUpdateModalVisible(false)}
          >
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle} weight="bold">
                {selectedCustomer?.name}
              </AppText>
              <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
                <X size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <AppText style={{ marginBottom: 8, fontWeight: "bold" }}>
                Status
              </AppText>
              <View style={styles.statusContainer}>
                {customerStatusList.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusButton,
                      editStatus === s && styles.statusButtonSelected,
                    ]}
                    onPress={() => setEditStatus(s)}
                  >
                    <View style={styles.statusButtonInner}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(s) },
                        ]}
                      />
                      <AppText
                        style={[
                          styles.statusButtonText,
                          editStatus === s && styles.statusButtonTextSelected,
                        ]}
                      >
                        {s}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <AppInput
                label="Notas"
                value={editNote}
                onChangeText={setEditNote}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                placeholder="Adicione uma nota..."
              />

              <AppButton
                onPress={handleUpdate}
                isLoading={isUpdating}
                style={{ marginTop: 16 }}
              >
                <AppText style={{ color: "white", fontWeight: "bold" }}>
                  Salvar Alterações
                </AppText>
              </AppButton>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  createButton: {
    height: 48,
    width: 48,
    position: "absolute",
    bottom: 60,
    left: 24,
    zIndex: 1000,
  },
  createButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    paddingHorizontal: 0, // Override default padding
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listContent: {
    paddingBottom: 20,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoader: {
    paddingVertical: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusButtonText: {
    fontSize: 12,
    color: theme.colors.text.primary,
  },
  statusButtonTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
});
