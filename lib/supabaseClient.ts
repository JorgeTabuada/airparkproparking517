import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Initialize Supabase client
// IMPORTANT: Replace with your Supabase project credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Detect if running on web or mobile
const isWeb = Platform.OS === 'web';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: isWeb ? undefined : AsyncStorage, // Use default (localStorage) for web, AsyncStorage for mobile
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth functions
export const authService = {
  // Registar novo utilizador
  async register(email: string, password: string, userData: {
    fullName: string;
    phone: string;
    nif: string;
    role: string;
    profile: string;
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Criar perfil do utilizador na tabela users
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            fullName: userData.fullName,
            phone: userData.phone,
            nif: userData.nif,
            role: userData.role,
            profile: userData.profile,
            rgpdConsent: true,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Registar admin (utilizador pré-existente na BD)
  async registerAdminAuth(userId: string, email: string, password: string) {
    try {
      // Esta função assume que o utilizador já existe na tabela 'users'
      // Actualiza o utilizador na autenticação
      const response = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''}`,
          },
          body: JSON.stringify({
            email,
            password,
            user_metadata: {
              role: 'admin_empresa',
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return { data: await response.json(), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Fazer login
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Atualizar último login
      if (data.user) {
        await supabase
          .from('users')
          .update({ lastLogin: new Date().toISOString() })
          .eq('id', data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Magic link (optional)
  async sendMagicLink(email: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Logout
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();

      return { error };
    } catch (error) {
      return { error };
    }
  },
};

// Storage functions
export const storageService = {
  // Upload foto de perfil com compressão
  async uploadProfilePhoto(userId: string, photoUri: string) {
    try {
      const fileName = `profile_${userId}_${Date.now()}.jpg`;
      const response = await fetch(photoUri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('profile_photos')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(fileName);

      return { publicUrl: publicData.publicUrl, error: null };
    } catch (error) {
      return { publicUrl: null, error };
    }
  },

  // Upload foto de viatura
  async uploadVehiclePhoto(userId: string, vehicleId: string, photoUri: string) {
    try {
      const fileName = `vehicle_${userId}_${vehicleId}_${Date.now()}.jpg`;
      const response = await fetch(photoUri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('vehicle_photos')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('vehicle_photos')
        .getPublicUrl(fileName);

      return { publicUrl: publicData.publicUrl, error: null };
    } catch (error) {
      return { publicUrl: null, error };
    }
  },
};

// Database functions
export const dbService = {
  // Obter utilizador por ID
  async getUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Atualizar dados do utilizador
  async updateUser(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Obter viaturas do utilizador
  async getUserVehicles(userId: string) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('userId', userId)
        .order('isPrimary', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Obter reservas do utilizador
  async getUserReservations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('userId', userId)
        .order('startDate', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Obter reservas ativas
  async getActiveReservations(userId: string) {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('userId', userId)
        .eq('status', 'active')
        .lt('startDate', now)
        .gt('endDate', now)
        .order('endDate', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Obter próximas reservas (este mês)
  async getUpcomingReservations(userId: string) {
    try {
      const now = new Date();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('userId', userId)
        .gte('startDate', now.toISOString())
        .lte('startDate', monthEnd.toISOString())
        .order('startDate', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Calcular total a pagar
  async getTotalToPay(userId: string) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('discountPrice')
        .eq('userId', userId)
        .eq('paymentStatus', 'pending');

      if (error) throw error;

      const total = data?.reduce((sum, res) => sum + (res.discountPrice || 0), 0) || 0;
      return { total, error: null };
    } catch (error) {
      return { total: 0, error };
    }
  },
};