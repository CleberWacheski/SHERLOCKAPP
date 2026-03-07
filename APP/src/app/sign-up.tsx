import { AppButton } from "@/components/ui/Button";
import { AppInput } from "@/components/ui/Input";
import { AppInputLabel } from "@/components/ui/InputLabel";
import { Layout } from "@/components/ui/Layout";
import { AppText } from "@/components/ui/Text";
import { authClient } from "@/lib/auth-client";
import { SignUpSchema, type SignUpType } from "@/lib/schemas";
import { theme } from "@/lib/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { UserPlusIcon } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function SignUp() {
  const form = useForm<SignUpType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSignUp = form.handleSubmit(async (formData) => {
    try {
      const response = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      if (response.error) {
        throw new Error("Erro ao cadastrar");
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return Alert.alert("Erro", error.message || "Erro ao cadastrar");
      }
      return Alert.alert("Erro", "Erro ao cadastrar");
    }
  });

  return (
    <Layout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <AppText weight="bold" size={28} style={styles.title}>
            Criar conta
          </AppText>
          <AppText muted size={16} style={styles.subtitle} align="center">
            Junte-se ao SherlockCRM e organize suas vendas.
          </AppText>
        </View>

        <View style={styles.form}>
          <AppInputLabel>Nome</AppInputLabel>
          <Controller
            name="name"
            control={form.control}
            render={({ field: { onChange, value }, fieldState }) => (
              <AppInput
                value={value}
                onChangeText={onChange}
                placeholder="Seu nome e sobrenome"
                keyboardType="default"
                autoCapitalize="words"
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <AppInputLabel>Email</AppInputLabel>
          <Controller
            name="email"
            control={form.control}
            render={({ field: { onChange, value }, fieldState }) => (
              <AppInput
                value={value}
                onChangeText={onChange}
                placeholder="seuemail@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <AppInputLabel style={styles.labelSpacing}>Senha</AppInputLabel>
          <Controller
            name="password"
            control={form.control}
            render={({ field: { onChange, value }, fieldState }) => (
              <AppInput
                value={value}
                onChangeText={onChange}
                placeholder="No mínimo 8 caracteres"
                secureTextEntry
                autoCapitalize="none"
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <AppInputLabel style={styles.labelSpacing}>
            Confirmar Senha
          </AppInputLabel>
          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field: { onChange, value }, fieldState }) => (
              <AppInput
                value={value}
                onChangeText={onChange}
                placeholder="Repita sua senha"
                secureTextEntry
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <AppButton
            isLoading={form.formState.isSubmitting}
            onPress={onSignUp}
            style={styles.primaryButton}
            icon={<UserPlusIcon size={18} color={theme.colors.background} />}
          >
            <AppText weight="medium" size={16} style={styles.primaryButtonText}>
              Criar conta
            </AppText>
          </AppButton>
        </View>
        <View style={styles.footer}>
          <AppText size={14} color={theme.colors.text.secondary}>
            Já tem uma conta?
          </AppText>
          <TouchableOpacity onPress={() => router.back()}>
            <AppText weight="bold" size={14} color={theme.colors.primary}>
              Faça login
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 12,
  },
  header: {
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  title: {
    color: theme.colors.text.primary,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    textAlign: "center",
    maxWidth: "80%",
  },
  form: {
    gap: 4,
  },
  labelSpacing: {
    marginTop: 8,
  },
  primaryButton: {
    marginTop: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    paddingBottom: 20,
    paddingTop: 12,
  },
});
