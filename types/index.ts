// User profiles: admin_empresa, gestor_empresa, utilizador_empresa, cliente_particular
export type UserRole = 'admin_empresa' | 'gestor_empresa' | 'utilizador_empresa' | 'cliente_particular';

export type UserProfile = 'particular' | 'empresa';

// User data structure - RGPD compliant
export interface AirparkUser {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  nif: string; // NIF (contribuinte) - obrigatório
  profilePhoto?: string; // URL de foto de perfil
  role: UserRole;
  profile: UserProfile;
  companyId?: string; // Para utilizadores de empresa
  createdAt: string;
  updatedAt: string;
  rgpdConsent: boolean; // Consentimento RGPD
  lastLogin?: string;
  isActive: boolean;
}

// Vehicle data - foto obrigatória
export interface Vehicle {
  id: string;
  userId: string;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  vehiclePhoto: string; // URL de foto da viatura - obrigatório
  documentPhoto?: string; // Foto de documento (opcional)
  createdAt: string;
  isPrimary: boolean; // Viatura principal
}

// Reservation data
export interface Reservation {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  spotId?: string;
  totalPrice: number;
  discountPrice: number; // Preço com desconto Airpark Pro
  discountPercentage: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  notes?: string;
  createdAt: string;
}

// Company data
export interface Company {
  id: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  subscription: 'free' | 'pro' | 'enterprise';
}

// Navigation types
export type RootStackParamList = {
  AuthStack: undefined;
  AppStack: undefined;
  Login: undefined;
  Register: undefined;
  PasswordRecovery: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Vehicles: undefined;
  ReservationDetail: { reservationId: string };
};