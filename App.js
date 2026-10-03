import { NavigationContainer } from "@react-navigation/native"
import RootStack from "./components/RootStack"

export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
