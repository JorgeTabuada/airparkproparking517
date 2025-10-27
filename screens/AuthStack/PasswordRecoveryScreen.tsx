import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SafeContainer from '../../components/SafeContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/theme';
import { authService } from '../../lib/supabaseClient';

interface PasswordRecoveryScreenProps {
  navigation: any;
}

export default function PasswordRecoveryScreen({ navigation }: PasswordRecoveryScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleRecovery = async () => {
    if (!email) {
      setError('Insira seu email');
      return;
    }

    setLoading(true);
    setError('');

    const { error: recoveryError } = await authService.resetPassword(email);

    if (recoveryError) {
      setError('Erro ao enviar email de recuperação. Tente novamente.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <SafeContainer>
        <View style={styles.successContainer}>
          <Text style={[TYPOGRAPHY.display, { color: COLORS.success, textAlign: 'center', marginBottom: SPACING.lg }]}>
            ✓
          </Text>
          <Text style={[TYPOGRAPHY.heading2, { color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md }]}>
            Email enviado!
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl }]}>
            Verifique seu email para as instruções de recuperação de palavra-passe
          </Text>
          <Button
            label="Voltar para Login"
            onPress={() => {
              setSuccess(false);
              setEmail('');
              navigation.navigate('Login');
            }}
            fullWidth
          />
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer scrollable>
      <View style={styles.container}>
        <Button
          label="← Voltar"
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
          size="small"
          style={{ alignSelf: 'flex-start', marginBottom: SPACING.lg }}
        />

        <View style={styles.header}>
          <Text style={[TYPOGRAPHY.heading2, { color: COLORS.text, marginBottom: SPACING.md }]}>
            Recuperar palavra-passe
          </Text>
          <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
            Insira seu email para receber instruções
          </Text>
        </View>

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
          />

          {error && (
            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.error, marginBottom: SPACING.md }]}>
              {error}
            </Text>
          )}

          <Button
            label="Enviar instruções"
            onPress={handleRecovery}
            fullWidth
            loading={loading}
          />
        </View>
      </View>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: SPACING.xl,
  },
  form: {
    marginVertical: SPACING.xl,
  },
});