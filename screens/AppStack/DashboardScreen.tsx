import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import SafeContainer from '../../components/SafeContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { COLORS, SPACING, TYPOGRAPHY, LOCALE_CONFIG } from '../../lib/theme';
import { authService, dbService } from '../../lib/supabaseClient';
import { AirparkUser, Reservation } from '../../types';

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [user, setUser] = useState<AirparkUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReservations, setActiveReservations] = useState<Reservation[]>([]);
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [totalToPay, setTotalToPay] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user: authUser, error: authError } = await authService.getCurrentUser();

      if (authError || !authUser) {
        navigation.replace('Login');
        return;
      }

      const { data: userData, error: userError } = await dbService.getUser(authUser.id);

      if (userError || !userData) {
        console.error('Error loading user:', userError);
        return;
      }

      setUser(userData);

      const { data: vehicles } = await dbService.getUserVehicles(authUser.id);
      setVehicleCount(vehicles?.length || 0);

      const { data: active } = await dbService.getActiveReservations(authUser.id);
      setActiveReservations(active || []);

      const { data: upcoming } = await dbService.getUpcomingReservations(authUser.id);
      setUpcomingReservations(upcoming || []);

      const { total } = await dbService.getTotalToPay(authUser.id);
      setTotalToPay(total);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('Login');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: LOCALE_CONFIG.currency,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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
        {/* Header com perfil */}
        <View style={styles.header}>
          <View>
            <Text style={[TYPOGRAPHY.subtitle, { color: COLORS.textSecondary }]}>
              Bem-vindo,
            </Text>
            <Text style={[TYPOGRAPHY.heading2, { color: COLORS.text }]}>
              {user?.fullName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileButton}
          >
            {user?.profilePhoto ? (
              <Image
                source={{ uri: user.profilePhoto }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={[TYPOGRAPHY.title, { color: COLORS.textInverse }]}>
                  {user?.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Cartões de Informação */}
        <View style={styles.cardsContainer}>
          {/* Reservas Ativas */}
          <Card variant="elevated">
            <View style={styles.cardHeader}>
              <Text style={[TYPOGRAPHY.caption, { color: COLORS.primary }]}>
                RESERVAS ATIVAS
              </Text>
              <Text style={[TYPOGRAPHY.display, { color: COLORS.text }]}>
                {activeReservations.length}
              </Text>
            </View>
            {activeReservations.length > 0 ? (
              <View style={styles.cardContent}>
                {activeReservations.slice(0, 1).map((reservation) => (
                  <View key={reservation.id} style={styles.reservationPreview}>
                    <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
                      Até {formatDate(reservation.endDate)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textTertiary }]}>
                Nenhuma reserva ativa
              </Text>
            )}
            <Button
              label="Ver todas"
              onPress={() => navigation.navigate('Reservations')}
              variant="secondary"
              size="small"
              fullWidth
              style={{ marginTop: SPACING.md }}
            />
          </Card>

          {/* Próximas Reservas (este mês) */}
          <Card variant="elevated">
            <View style={styles.cardHeader}>
              <Text style={[TYPOGRAPHY.caption, { color: COLORS.primary }]}>
                PRÓXIMAS RESERVAS (ESTE MÊS)
              </Text>
              <Text style={[TYPOGRAPHY.display, { color: COLORS.text }]}>
                {upcomingReservations.length}
              </Text>
            </View>
            {upcomingReservations.length > 0 ? (
              <View style={styles.cardContent}>
                {upcomingReservations.slice(0, 1).map((reservation) => (
                  <View key={reservation.id} style={styles.reservationPreview}>
                    <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
                      De {formatDate(reservation.startDate)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textTertiary }]}>
                Nenhuma reserva próxima
              </Text>
            )}
          </Card>

          {/* Total a Pagar (com desconto Airpark Pro) */}
          <Card variant="elevated">
            <View style={styles.cardHeader}>
              <Text style={[TYPOGRAPHY.caption, { color: COLORS.success }]}>
                TOTAL A PAGAR (COM DESCONTO AIRPARK PRO)
              </Text>
              <Text style={[TYPOGRAPHY.display, { color: COLORS.text }]}>
                {formatCurrency(totalToPay)}
              </Text>
            </View>
            <View style={styles.discountBadge}>
              <Text style={[TYPOGRAPHY.caption, { color: COLORS.success }]}>
                ✓ Desconto Airpark Pro aplicado
              </Text>
            </View>
            {totalToPay > 0 && (
              <Button
                label="Pagar agora"
                onPress={() => {}}
                variant="secondary"
                size="small"
                fullWidth
                style={{ marginTop: SPACING.md }}
              />
            )}
          </Card>

          {/* Viaturas Ligadas */}
          <Card variant="elevated">
            <View style={styles.cardHeader}>
              <Text style={[TYPOGRAPHY.caption, { color: COLORS.primary }]}>
                VIATURAS LIGADAS
              </Text>
              <Text style={[TYPOGRAPHY.display, { color: COLORS.text }]}>
                {vehicleCount}
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
              Gerencie suas viaturas e adicione novas
            </Text>
            <Button
              label="Gerir viaturas"
              onPress={() => navigation.navigate('Vehicles')}
              variant="secondary"
              size="small"
              fullWidth
              style={{ marginTop: SPACING.md }}
            />
          </Card>
        </View>

        {/* Botão de Logout */}
        <Button
          label="Terminar sessão"
          onPress={handleLogout}
          variant="outline"
          fullWidth
          style={{ marginTop: SPACING.xl, marginBottom: SPACING.lg }}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    marginBottom: SPACING.xl,
  },
  cardHeader: {
    marginBottom: SPACING.md,
  },
  cardContent: {
    marginBottom: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  reservationPreview: {
    paddingVertical: SPACING.sm,
  },
  discountBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 4,
    marginTop: SPACING.md,
  },
});