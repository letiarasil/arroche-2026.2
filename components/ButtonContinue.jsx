import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

function ButtonContinue({ onPress, disabled = false, title = 'Continue' }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
      ]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '90%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  buttonDisabled: {
    backgroundColor: colors.primary,
    opacity: 0.45,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default ButtonContinue;