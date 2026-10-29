import { NavigationContainer } from "@react-navigation/native"
import RootStack from "./components/RootStack"
import { AuthProvider } from "./contexts/AuthContext"
import { SubscriptionsProvider } from "./contexts/SubscriptionsContext"

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionsProvider>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </SubscriptionsProvider>
    </AuthProvider>
  );
}
