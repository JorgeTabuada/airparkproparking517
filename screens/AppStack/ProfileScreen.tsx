import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import SafeContainer from '../../components/SafeContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '../../lib/theme';
import { authService, dbService, storageService } from '../../lib/supabaseClient';
import { AirparkUser } from '../../types';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [user, setUser] = useState<AirparkUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nif: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user: authUser } = await authService.getCurrentUser();

      if (!authUser) {
        navigation.replace('Login');
        return;
      }

      const { data: userData } = await dbService.getUser(authUser.id);

      if (userData) {
        setUser(userData);
        setFormData({
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          nif: userData.nif,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await dbService.updateUser(user.id, formData);

      if (error) {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil');
        return;
      }

      if (data) {
        setUser(data);
        setIsEditing(false);
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    }
  };

  if (loading) {
    return (
      <SafeContainer>
        <View style={styles.loadingContainer}>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary }]}>
            Carregando...
          </Text>
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            label="← Voltar"
            onPress={() => navigation.goBack()}
            variant="secondary"
            size="small"
            style={{ alignSelf: 'flex-start', marginBottom: SPACING.lg }}
          />
          <Text style={[TYPOGRAPHY.heading2, { color: COLORS.text }]}>
            Meu Perfil
          </Text>
        </View>

        {/* Foto de Perfil */}
        <Card variant="filled">
          <View style={styles.photoSection}>
            {user?.profilePhoto ? (
              <Image
                source={{ uri: user.profilePhoto }}
                style={styles.profileLargeImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={[TYPOGRAPHY.display, { color: COLORS.textInverse }]}>
                  {user?.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Button
              label="Alterar foto"
              onPress={() => {
                Alert.alert('Alterar Foto', 'Função de upload será implementada');
              }}
              variant="secondary"
              size="small"
              fullWidth
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        </Card>

        {/* Informações de Perfil */}
        <Card variant="filled">
          <View style={styles.infoSection}>
            <View style={styles.infoBadge}>
              <Text style={[TYPOGRAPHY.label, { color: COLORS.primary }]}>
                Perfil
              </Text>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.text }]}>
                {user?.profile === 'particular' ? 'Cliente Particular' : 'Cliente Empresa'}
              </Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={[TYPOGRAPHY.label, { color: COLORS.primary }]}>
                Tipo de Conta
              </Text>
              <Text style={[TYPOGRAPHY.body, { color: COLORS.text }]}>
                {user?.role === 'cliente_particular' ? 'Particular' : 'Empresa'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Dados do Utilizador */}
        <Card variant="filled">
          <View style={styles.dataSection}>
            <View style={styles.sectionHeader}>
              <Text style={[TYPOGRAPHY.title, { color: COLORS.text }]}>
                Dados Pessoais
              </Text>
              {!isEditing && (
                <Button
                  label="Editar"
                  onPress={() => setIsEditing(true)}
                  variant="secondary"
                  size="small"
                />
              )}
            </View>

            {isEditing ? (
              <>
                <Input
                  label="Nome Completo"
                  value={formData.fullName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fullName: text })
                  }
                />

                <Input
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  editable={false}
                />

                <Input
                  label="Telefone"
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                  keyboardType="phone-pad"
                />

                <Input
                  label="NIF (Contribuinte)"
                  value={formData.nif}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nif: text })
                  }
                  keyboardType="numeric"
                  editable={false}
                />

                <View style={styles.buttonGroup}>
                  <Button
                    label="Guardar"
                    onPress={handleUpdateProfile}
                    fullWidth
                    style={{ marginBottom: SPACING.md }}
                  />
                  <Button
                    label="Cancelar"
                    onPress={() => setIsEditing(false)}
                    variant="outline"
                    fullWidth
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.dataField}>
                  <Text style={[TYPOGRAPHY.label, { color: COLORS.textSecondary }]}>
                    Nome Completo
                  </Text>
                  <Text style={[TYPOGRAPHY.body, { color: COLORS.text }]}>
                    {formData.fullName}
                  </Text>
                </View>

                <View style={styles.dataField}>
                  <Text style={[TYPOGRAPHY.label, { color: COLORS.textSecondary }]}>
                    Email
                  </Text>
                  <Text style={[TYPOGRAPHY.body, { color: COLORS.text }]}>
                    {formData.email}
                  </Text>
                </View>

                <View style={styles.dataField}>
                  <Text style={[TYPOGRAPHY.label, { color: COLORS.textSecondary }]}>
                    Telefone
                  </Text>
                  <Text style={[TYPOGRAPHY.body, { color: COLORS.text }]}>
                    {formData.phone}
                  </Text>
                </View>

                <View style={styles.dataField}>
                  <Text style={[TYPOGRAPHY.label, { color: COLORS.textSecondary }]}>
                    NIF (Contribuinte)
                  </Text>
                  <Text style={[TYPOGRAPHY.body, { color: COLORS.text }]}>
                    {formData.nif}
                  </Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* RGPD Compliance */}
        <Card variant="outline">
          <Text style={[TYPOGRAPHY.label, { color: COLORS.primary, marginBottom: SPACING.md }]}>
            Conformidade RGPD
          </Text>
          <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
            ✓ Seus dados são protegidos de acordo com o RGPD
          </Text>
          <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
            ✓ Consentimento registado em {new Date(user?.createdAt || '').toLocaleDateString('pt-PT')}
          </Text>
        </Card>

        <View style={styles.bottomSpacing} />
      </View>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: SPACING.xl,
  },
  photoSection: {
    alignItems: 'center',
  },
  profileLargeImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: SPACING.lg,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  infoBadge: {
    flex: 1,
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: 8,
  },
  dataSection: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dataField: {
    marginBottom: SPACING.lg,
  },
  buttonGroup: {
    marginTop: SPACING.lg,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});