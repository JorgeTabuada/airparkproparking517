import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import SafeContainer from '../../components/SafeContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../lib/theme';
import { authService, dbService, supabase } from '../../lib/supabaseClient';
import { Vehicle } from '../../types';

interface VehiclesScreenProps {
  navigation: any;
}

export default function VehiclesScreen({ navigation }: VehiclesScreenProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    color: '',
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const { user } = await authService.getCurrentUser();

      if (!user) {
        navigation.replace('Login');
        return;
      }

      const { data } = await dbService.getUserVehicles(user.id);
      setVehicles(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!formData.licensePlate || !formData.brand || !formData.model || !formData.color) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      const { user } = await authService.getCurrentUser();

      if (!user) return;

      // Criar viatura em Supabase
      const { error } = await supabase
        .from('vehicles')
        .insert({
          userId: user.id,
          licensePlate: formData.licensePlate,
          brand: formData.brand,
          model: formData.model,
          color: formData.color,
          vehiclePhoto: 'https://via.placeholder.com/300x300?text=' + formData.brand + ' ' + formData.model,
          isPrimary: vehicles.length === 0, // Primeira viatura é principal por defeito
        });

      if (error) throw error;

      Alert.alert('Sucesso', 'Viatura adicionada com sucesso');
      setFormData({ licensePlate: '', brand: '', model: '', color: '' });
      setShowAddForm(false);
      loadVehicles();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a viatura');
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
            Minhas Viaturas
          </Text>
          <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
            Gerencie e adicione viaturas (mínimo 1 obrigatório)
          </Text>
        </View>

        {!showAddForm ? (
          <>
            {vehicles.length === 0 ? (
              <Card variant="outline">
                <View style={styles.emptyState}>
                  <Text style={[TYPOGRAPHY.heading3, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
                    Nenhuma viatura registada
                  </Text>
                  <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textTertiary, marginBottom: SPACING.lg }]}>
                    Adicione uma viatura para começar a fazer reservas
                  </Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Card variant="elevated">
                    <View style={styles.vehicleCard}>
                      {item.vehiclePhoto && (
                        <Image
                          source={{ uri: item.vehiclePhoto }}
                          style={styles.vehicleImage}
                        />
                      )}
                      <View style={styles.vehicleInfo}>
                        <Text style={[TYPOGRAPHY.subtitle, { color: COLORS.text }]}>
                          {item.brand} {item.model}
                        </Text>
                        <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary, marginTop: SPACING.sm }]}>
                          Matrícula: {item.licensePlate}
                        </Text>
                        <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
                          Cor: {item.color}
                        </Text>
                        {item.isPrimary && (
                          <View style={styles.primaryBadge}>
                            <Text style={[TYPOGRAPHY.caption, { color: COLORS.success }]}>
                              ★ Viatura Principal
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Card>
                )}
              />
            )}

            <Button
              label="+ Adicionar Viatura"
              onPress={() => setShowAddForm(true)}
              fullWidth
              style={{ marginTop: SPACING.lg }}
            />
          </>
        ) : (
          <Card variant="filled">
            <Text style={[TYPOGRAPHY.title, { color: COLORS.text, marginBottom: SPACING.lg }]}>
              Adicionar Nova Viatura
            </Text>

            <Input
              label="Matrícula"
              placeholder="AB-12-CD"
              value={formData.licensePlate}
              onChangeText={(text) => setFormData({ ...formData, licensePlate: text.toUpperCase() })}
            />

            <Input
              label="Marca"
              placeholder="Toyota"
              value={formData.brand}
              onChangeText={(text) => setFormData({ ...formData, brand: text })}
            />

            <Input
              label="Modelo"
              placeholder="Corolla"
              value={formData.model}
              onChangeText={(text) => setFormData({ ...formData, model: text })}
            />

            <Input
              label="Cor"
              placeholder="Preto"
              value={formData.color}
              onChangeText={(text) => setFormData({ ...formData, color: text })}
            />

            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary, marginBottom: SPACING.lg }]}>
              Foto da viatura (obrigatória)
            </Text>

            <Button
              label="Selecionar foto"
              onPress={() => Alert.alert('Upload', 'Função de upload será implementada')}
              variant="secondary"
              fullWidth
              style={{ marginBottom: SPACING.lg }}
            />

            <View style={styles.formButtons}>
              <Button
                label="Guardar"
                onPress={handleAddVehicle}
                fullWidth
                style={{ marginRight: SPACING.md }}
              />
              <Button
                label="Cancelar"
                onPress={() => {
                  setShowAddForm(false);
                  setFormData({ licensePlate: '', brand: '', model: '', color: '' });
                }}
                variant="outline"
                fullWidth
              />
            </View>
          </Card>
        )}
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  vehicleImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  primaryBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 4,
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
  },
  formButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});