import { View, Text } from 'react-native';
import React from 'react';
import Menu from '../components/Menu';

export default function Guias({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Guias Screen</Text>
      </View>
      <Menu activeTab="Guias" navigation={navigation} />
    </View>
  );
}
