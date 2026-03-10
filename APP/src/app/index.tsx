import { AppButton } from "@/components/ui/Button";
import { AppInput } from "@/components/ui/Input";
import { AppInputLabel } from "@/components/ui/InputLabel";
import { Layout } from "@/components/ui/Layout";
import { AppText } from "@/components/ui/Text";
import { authClient } from "@/lib/auth-client";
import { APP_NAME } from "@/lib/constants";
import { SignInSchema, type SignInType } from "@/lib/schemas";
import { theme } from "@/lib/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { LogInIcon } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function Index() {
  const form = useForm<SignInType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSignIn = form.handleSubmit(async (formData) => {
    try {
      const response = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });
      if (response.error) {
        throw new Error("Credenciais inválidas");
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return Alert.alert("Erro", error.message || "Erro ao fazer login");
      }
      return Alert.alert("Erro", "Erro ao fazer login");
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
          <AppText weight="bold" size={32} style={styles.appName}>
            {APP_NAME}
          </AppText>
          <AppText muted size={16} style={styles.slogan} align="center">
            Organize sua equipe de vendas na rua.
          </AppText>
        </View>
        <View style={styles.form}>
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

          <AppInputLabel style={styles.labelSpacing}>Password</AppInputLabel>
          <Controller
            name="password"
            control={form.control}
            render={({ field: { onChange, value }, fieldState }) => (
              <AppInput
                value={value}
                onChangeText={onChange}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <AppButton
            isLoading={form.formState.isSubmitting}
            onPress={onSignIn}
            style={styles.primaryButton}
            icon={<LogInIcon size={18} color={theme.colors.background} />}
          >
            <AppText weight="medium" size={16} style={styles.primaryButtonText}>
              Entrar
            </AppText>
          </AppButton>
        </View>

        <View style={styles.footer}>
          <AppText size={14} color={theme.colors.text.secondary}>
            Não tem uma conta?
          </AppText>
          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <AppText weight="bold" size={14} color={theme.colors.primary}>
              Cadastre-se
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
    gap: 32,
  },
  header: {
    gap: 4,
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  appName: {
    color: theme.colors.primary,
  },
  slogan: {
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  form: {
    gap: 8,
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
    marginTop: 16,
    paddingBottom: 20,
  },
});
