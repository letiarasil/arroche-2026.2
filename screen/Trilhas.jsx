import { View, Text } from 'react-native';
import React from 'react';
import Menu from '../components/Menu'; // Assuming Menu will be saved in components

export default function Trilhas({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Trilhas Screen</Text>
      </View>
      <Menu activeTab="Trilhas" navigation={navigation} />
    </View>
  );
}
