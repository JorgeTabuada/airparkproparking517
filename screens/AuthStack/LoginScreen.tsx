import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SafeContainer from '../../components/SafeContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/theme';
import { useAuth } from '../../hooks/useAuth';

interface LoginScreenProps {
  navigation: any;
  route?: any;
}

export default function LoginScreen({ navigation, route }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signUp } = useAuth();
  const justRegistered = route?.params?.justRegistered;

  const ADMIN_EMAIL = 'jorge.g.tabuada@gmail.com';

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    const { error: loginError } = await signIn(email, password);

    if (loginError) {
      // Network-specific message
      const message = typeof loginError?.message === 'string' && loginError.message.includes('fetch')
        ? 'Falha de ligação ao servidor. Verifique sua internet e tente novamente.'
        : 'Email ou palavra-passe incorretos';

      // Admin auto-provision fallback
      if (email === ADMIN_EMAIL) {
        const { error: registerError } = await signUp(email, password, {
          fullName: 'Administrador Airpark',
          phone: '',
          nif: '000000000',
          role: 'admin_empresa',
          profile: 'empresa',
        } as any);

        if (!registerError) {
          setLoading(false);
          setError('Conta do administrador criada. Tente entrar novamente.');
          return;
        }
      }

      setError(message);
      setLoading(false);
      return;
    }

    setLoading(false);
    // Não navegamos diretamente para AppStack — o RootNavigator mudará automaticamente quando o contexto de autenticação actualizar.
  };

  return (
    <SafeContainer scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[TYPOGRAPHY.display, { color: COLORS.primary, marginBottom: SPACING.md }]}>Airpark</Text>
          <Text style={[TYPOGRAPHY.subtitle, { color: COLORS.textSecondary }]}>Bem-vindo de volta</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="seu.email@exemplo.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text.toLowerCase());
              setError('');
            }}
            keyboardType="email-address"
            error={error && error.includes('Email') ? error : undefined}
          />

          <Input
            label="Palavra-passe"
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry={!showPassword}
          />

          {error ? (
            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.error, marginBottom: SPACING.md }]}>{error}</Text>
          ) : null}

          {justRegistered ? (
            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.success, marginBottom: SPACING.md }]}>Conta criada com sucesso. Verifique o seu email para confirmar (se aplicável).</Text>
          ) : null}

          <Button label="Entrar" onPress={handleLogin} fullWidth loading={loading} />
        </View>

        {/* Links */}
        <View style={styles.links}>
          <TouchableOpacity onPress={() => navigation.navigate('PasswordRecovery')}>
            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.primary }]}>Esqueceu a palavra-passe?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <View style={styles.registerLink}>
              <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>Não tem conta?{' '}</Text>
              <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.primary, fontWeight: '600' }]}>Criar uma</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  form: {
    marginVertical: SPACING.xl,
  },
  links: {
    marginTop: SPACING.xxl,
    gap: SPACING.lg,
  },
  registerLink: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
});