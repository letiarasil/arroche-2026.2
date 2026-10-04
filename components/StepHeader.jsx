import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants/colors';

function StepHeader({ title, currentStep = 1, totalSteps = 3, onBack }) {
  return (
    <View style={styles.header}>
      <View style={styles.topo}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
          activeOpacity={0.7}
        >
          <MaterialDesignIcons
            name="arrow-left"
            size={28}
            color="#000"
          />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Barrinhas de progresso dinâmicas de acordo com o total e etapa atual */}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index < currentStep;
          return (
            <View
              key={index}
              style={[
                styles.progressBar,
                isActive && styles.progressActive,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },

  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },

  headerRight: {
    width: 36,
  },

  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },

  progressBar: {
    width: 26,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.progressInactive,
  },

  progressActive: {
    backgroundColor: colors.progressActive,
  },
});

export default StepHeader;
