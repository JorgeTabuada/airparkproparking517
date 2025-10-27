import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import SafeContainer from '../../components/SafeContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { COLORS, SPACING, TYPOGRAPHY, LOCALE_CONFIG } from '../../lib/theme';
import { authService, dbService } from '../../lib/supabaseClient';
import { Reservation } from '../../types';

interface ReservationsScreenProps {
  navigation: any;
}

export default function ReservationsScreen({ navigation }: ReservationsScreenProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const { user } = await authService.getCurrentUser();

      if (!user) {
        navigation.replace('Login');
        return;
      }

      const { data } = await dbService.getUserReservations(user.id);
      setReservations(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading reservations:', error);
      setLoading(false);
    }
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'completed':
        return COLORS.textTertiary;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const filteredReservations = reservations.filter((res) => res.status === activeTab);

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
            Minhas Reservas
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {(['active', 'upcoming', 'completed'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  TYPOGRAPHY.label,
                  {
                    color: activeTab === tab ? COLORS.primary : COLORS.textSecondary,
                  },
                ]}
              >
                {tab === 'active' ? 'Ativas' : tab === 'upcoming' ? 'Próximas' : 'Concluídas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <Card variant="outline">
            <View style={styles.emptyState}>
              <Text style={[TYPOGRAPHY.heading3, { color: COLORS.textSecondary }]}>
                Nenhuma reserva encontrada
              </Text>
            </View>
          </Card>
        ) : (
          <FlatList
            data={filteredReservations}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Card variant="elevated">
                <View style={styles.reservationHeader}>
                  <View>
                    <Text style={[TYPOGRAPHY.subtitle, { color: COLORS.text }]}>
                      Reserva #{item.id.slice(0, 8)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        TYPOGRAPHY.label,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.reservationDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[TYPOGRAPHY.label, { color: COLORS.textSecondary }]}>
                      Início
                    </Text>
                    <Text style={[TYPOGRAPHY.body, { color: COLORS.text }]}>
                      {formatDate(item.startDate)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[TYPOGRAPHY.label, { color: COLORS.textSecondary }]}>
                      Fim
                    </Text>
                    <Text style={[TYPOGRAPHY.body, { color: COLORS.text }]}>
                      {formatDate(item.endDate)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[TYPOGRAPHY.label, { color: COLORS.textSecondary }]}>
                      Preço
                    </Text>
                    <Text style={[TYPOGRAPHY.body, { color: COLORS.text }]}>
                      {formatCurrency(item.totalPrice)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[TYPOGRAPHY.label, { color: COLORS.textSecondary }]}>
                      Com Desconto
                    </Text>
                    <Text style={[TYPOGRAPHY.body, { color: COLORS.success, fontWeight: '600' }]}>
                      {formatCurrency(item.discountPrice)}
                    </Text>
                  </View>

                  {item.discountPercentage > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={[TYPOGRAPHY.caption, { color: COLORS.success }]}>
                        Economia: {item.discountPercentage}%
                      </Text>
                    </View>
                  )}

                  {item.paymentStatus === 'pending' && (
                    <Button
                      label="Pagar"
                      onPress={() => {}}
                      variant="secondary"
                      size="small"
                      fullWidth
                      style={{ marginTop: SPACING.lg }}
                    />
                  )}
                </View>
              </Card>
            )}
          />
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
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  reservationDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  discountBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 4,
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
  },
});