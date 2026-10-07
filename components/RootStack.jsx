import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SignIn from "../screen/SignIn";
import CreateAccount from "../screen/CreateAccount";
import CreateEmail from "../screen/CreateEmail";
import VerifyEmail from "../screen/VerifyEmail";
import CreatePassword from "../screen/CreatePassword";
import AccountCreated from "../screen/AccountCreated";
import Login from "../screen/Login";
import LoginEmail from "../screen/LoginEmail";

const Stack = createNativeStackNavigator() 

function RootStack() {
    return(
        <Stack.Navigator screenOptions={{ headerShown: false, }}>
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="Login" component={Login} />  
            <Stack.Screen name="LoginEmail" component={LoginEmail} />  
            <Stack.Screen name="CreateAccount" component={CreateAccount} />  
            <Stack.Screen name="CreateEmail" component={CreateEmail} />  
            <Stack.Screen name="VerifyEmail" component={VerifyEmail} />  
            <Stack.Screen name="CreatePassword" component={CreatePassword} />  
            <Stack.Screen name="AccountCreated" component={AccountCreated} />  
        </Stack.Navigator>
    )
}

export default RootStack