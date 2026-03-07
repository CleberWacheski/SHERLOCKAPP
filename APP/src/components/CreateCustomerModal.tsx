import { AppButton } from "@/components/ui/Button";
import { AppInput } from "@/components/ui/Input";
import { AppText } from "@/components/ui/Text";
import { useCreateCustomer } from "@/hooks/useCreateCustomer";
import { CreateCustomerSchema, type CreateCustomerType } from "@/lib/schemas";
import { theme } from "@/lib/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface CreateCustomerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateCustomerModal({
  visible,
  onClose,
}: CreateCustomerModalProps) {
  const { mutate, isPending } = useCreateCustomer();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: {
      status: "AGUARDANDO VISITA",
      lat: null,
      lon: null,
      note: null,
    },
  });

  const onSubmit = (data: CreateCustomerType) => {
    mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>Novo Cliente</AppText>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Nome"
                    placeholder="Nome do cliente"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={errors.name?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="cpfCnpj"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="CPF/CNPJ"
                    placeholder="000.000.000-00"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={errors.cpfCnpj?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                    value={value ?? ""}
                    onChangeText={onChange}
                    errorMessage={errors.phone?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="zipCode"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="CEP"
                    placeholder="00000-000"
                    value={value ?? ""}
                    onChangeText={onChange}
                    errorMessage={errors.zipCode?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Endereço"
                    placeholder="Rua, número, bairro"
                    value={value ?? ""}
                    onChangeText={onChange}
                    errorMessage={errors.address?.message}
                  />
                )}
              />

              <View style={styles.row}>
                <View style={styles.half}>
                  <Controller
                    control={control}
                    name="city"
                    render={({ field: { onChange, value } }) => (
                      <AppInput
                        label="Cidade"
                        placeholder="Cidade"
                        value={value ?? ""}
                        onChangeText={onChange}
                        errorMessage={errors.city?.message}
                      />
                    )}
                  />
                </View>
                <View style={styles.half}>
                  <Controller
                    control={control}
                    name="state"
                    render={({ field: { onChange, value } }) => (
                      <AppInput
                        label="Estado"
                        placeholder="UF"
                        value={value ?? ""}
                        onChangeText={onChange}
                        errorMessage={errors.state?.message}
                      />
                    )}
                  />
                </View>
              </View>

              <AppButton
                onPress={handleSubmit(onSubmit)}
                isLoading={isPending}
                style={styles.submitButton}
              >
                <AppText style={styles.submitButtonText}>
                  Salvar Cliente
                </AppText>
              </AppButton>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: "90%",
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
