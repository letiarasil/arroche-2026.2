import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SignIn from "../screen/SignIn";
import CreateAccount from "../screen/CreateAccount";
import CreateEmail from "../screen/CreateEmail";
import VerifyEmail from "../screen/VerifyEmail";

const Stack = createNativeStackNavigator() 

function RootStack() {
    return(
        <Stack.Navigator screenOptions={{ headerShown: false, }}>
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="CreateAccount" component={CreateAccount} />  
            <Stack.Screen name="CreateEmail" component={CreateEmail} />  
            <Stack.Screen name="VerifyEmail" component={VerifyEmail} />  
        </Stack.Navigator>
    )
}

export default RootStack