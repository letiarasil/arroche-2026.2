import { View, Text } from 'react-native';
import React from 'react';
import Menu from '../components/Menu';

export default function Salvos({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Salvos Screen</Text>
      </View>
      <Menu activeTab="Salvos" navigation={navigation} />
    </View>
  );
}
