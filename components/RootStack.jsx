import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SingIn from "../screen/SingIn";
import CreateAccount from "../screen/CreateAccount";
const Stack = createNativeStackNavigator() 

function RootStack() {
    return(
        <Stack.Navigator screenOptions={{ headerShown: false, }}>
            <Stack.Screen name="SingIn" component={SingIn} />
            <Stack.Screen name="CreateAccount" component={CreateAccount} />  
        </Stack.Navigator>
    )
}

export default RootStack