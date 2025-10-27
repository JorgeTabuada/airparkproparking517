// Script para criar usuário admin manualmente
// Execute: node create-admin.js

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log('🔄 Criando conta de administrador...');

  const email = 'jorge.g.tabuada@gmail.com';
  const password = '123456'; // Mínimo 6 caracteres

  try {
    // 1. Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Erro ao criar no Auth:', authError.message);
      return;
    }

    console.log('✅ Usuário criado no Auth:', authData.user?.id);

    // 2. Criar perfil na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        fullName: 'Administrador Airpark',
        phone: '000000000',
        nif: '000000000',
        role: 'admin_empresa',
        profile: 'empresa',
        rgpdConsent: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select();

    if (userError) {
      console.error('❌ Erro ao criar perfil:', userError.message);
      return;
    }

    console.log('✅ Perfil criado:', userData);
    console.log('\n🎉 Conta de administrador criada com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createAdmin();
