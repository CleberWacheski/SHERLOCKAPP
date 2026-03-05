import { CustomerCard } from "@/components/CustomerCard";
import { CustomerFiltersModal } from "@/components/CustomerFiltersModal";
import { AppButton } from "@/components/ui/Button";
import { AppInput } from "@/components/ui/Input";
import { Layout } from "@/components/ui/Layout";
import { AppText } from "@/components/ui/Text";
import { useCustomers } from "@/hooks/useCustomers";
import { theme } from "@/lib/theme";
import { Filter } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useDebounce } from "use-debounce";

export default function CustomersScreen() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

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
          renderItem={({ item }) => <CustomerCard customer={item} />}
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
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
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
});
