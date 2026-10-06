import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import Menu from '../components/Menu';
import { useAuth } from '../contexts/AuthContext';

export default function Perfil({ navigation }) {
  const { logout } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>Perfil Screen</Text>
        
        <TouchableOpacity 
          onPress={logout}
          style={{ padding: 15, backgroundColor: '#FF3B30', borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sair (Logout)</Text>
        </TouchableOpacity>
      </View>
      <Menu activeTab="Perfil" navigation={navigation} />
    </View>
  );
}
