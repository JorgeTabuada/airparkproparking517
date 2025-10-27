import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import SafeContainer from '../../components/SafeContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../lib/theme';
import { useAuth } from '../../hooks/useAuth';

interface RegisterScreenProps {
  navigation: any;
}

type ProfileType = 'particular' | 'empresa' | null;
type UserRole = 'cliente_particular' | 'utilizador_empresa' | null;

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [step, setStep] = useState<'profile' | 'form'>('profile');
  const [profile, setProfile] = useState<ProfileType>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nif, setNif] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProfileSelect = (selectedProfile: ProfileType) => {
    setProfile(selectedProfile);
    setStep('form');
  };

  const validateForm = () => {
    if (!fullName || !email || !phone || !nif || !password || !confirmPassword) {
      setError('Preencha todos os campos');
      return false;
    }

    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem');
      return false;
    }

    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return false;
    }

    return true;
  };

  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    const userRole: UserRole = profile === 'particular' ? 'cliente_particular' : 'utilizador_empresa';

    const { error: registerError, signedIn } = await signUp(
      email,
      password,
      {
        fullName,
        phone,
        nif,
        role: userRole,
        profile: profile!,
      }
    );

    if (registerError) {
      setError('Erro ao criar conta. Tente novamente.');
      setLoading(false);
      return;
    }

    setLoading(false);

    if (signedIn) {
      // If signed in immediately, RootNavigator will switch to AppStack automatically.
      return;
    }

    // If not signed in (e.g. confirmation required), redirect to Login with a flag to show a message.
    navigation.navigate('Login', { justRegistered: true });
  };

  if (step === 'profile') {
    return (
      <SafeContainer>
        <View style={styles.profileContainer}>
          <View style={styles.header}>
            <Text style={[TYPOGRAPHY.heading2, { color: COLORS.text, marginBottom: SPACING.md }]}>
              Escolha seu perfil
            </Text>
            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
              Selecione o tipo de conta que melhor se adequa
            </Text>
          </View>

          <View style={styles.profileOptions}>
            <TouchableOpacity
              style={[styles.profileCard, styles.cardShadow]}
              onPress={() => handleProfileSelect('particular')}
            >
              <Text style={[TYPOGRAPHY.heading3, { color: COLORS.primary, marginBottom: SPACING.md }]}>
                👤 Cliente Particular
              </Text>
              <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
                Estacione ocasionalmente no aeroporto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileCard, styles.cardShadow]}
              onPress={() => handleProfileSelect('empresa')}
            >
              <Text style={[TYPOGRAPHY.heading3, { color: COLORS.primary, marginBottom: SPACING.md }]}>
                🏢 Cliente Empresa
              </Text>
              <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
                Gerencie estacionamentos para sua empresa
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.primary, textAlign: 'center', marginTop: SPACING.xl }]}>
              Já tem conta? Entrar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer scrollable>
      <View style={styles.container}>
        <Button
          label="← Voltar"
          onPress={() => {
            setStep('profile');
            setProfile(null);
            setError('');
          }}
          variant="secondary"
          size="small"
          style={{ alignSelf: 'flex-start', marginBottom: SPACING.lg }}
        />

        <View style={styles.header}>
          <Text style={[TYPOGRAPHY.heading2, { color: COLORS.text, marginBottom: SPACING.md }]}>
            Criar conta
          </Text>
          <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
            {profile === 'particular' ? 'Cliente Particular' : 'Cliente Empresa'}
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nome Completo"
            placeholder="João Silva"
            value={fullName}
            onChangeText={setFullName}
          />

          <Input
            label="Email"
            placeholder="seu.email@exemplo.com"
            value={email}
            onChangeText={(text) => setEmail(text.toLowerCase())}
            keyboardType="email-address"
          />

          <Input
            label="Telefone"
            placeholder="+351 912 345 678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="NIF (Contribuinte)"
            placeholder="123456789"
            value={nif}
            onChangeText={setNif}
            keyboardType="numeric"
          />

          <Input
            label="Palavra-passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Confirmar Palavra-passe"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={password !== confirmPassword && confirmPassword ? 'Palavras-passe não coincidem' : undefined}
          />

          {error && (
            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.error, marginBottom: SPACING.md }]}>
              {error}
            </Text>
          )}

          <Button
            label="Criar Conta"
            onPress={handleRegister}
            fullWidth
            loading={loading}
          />
        </View>
      </View>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  profileOptions: {
    gap: SPACING.lg,
    marginVertical: SPACING.xl,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  form: {
    marginVertical: SPACING.lg,
  },
});