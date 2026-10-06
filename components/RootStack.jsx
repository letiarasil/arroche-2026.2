import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";

import SignIn from "../screen/SignIn";
import CreateAccount from "../screen/CreateAccount";
import CreateEmail from "../screen/CreateEmail";
import VerifyEmail from "../screen/VerifyEmail";
import Trilhas from "../screen/Trilhas";
import Guias from "../screen/Guias";
import Salvos from "../screen/Salvos";
import Perfil from "../screen/Perfil";

const Stack = createNativeStackNavigator() 

function RootStack() {
    const { isLoggedIn } = useAuth();

    return(
        <Stack.Navigator screenOptions={{ headerShown: false, }}>
            {isLoggedIn ? (
                // Telas para usuários logados
                <>
                    <Stack.Screen name="Trilhas" component={Trilhas} />
                    <Stack.Screen name="Guias" component={Guias} />
                    <Stack.Screen name="Salvos" component={Salvos} />
                    <Stack.Screen name="Perfil" component={Perfil} />
                </>
            ) : (
                // Telas para usuários não logados (fluxo de autenticação)
                <>
                    <Stack.Screen name="SignIn" component={SignIn} />
                    <Stack.Screen name="CreateAccount" component={CreateAccount} />  
                    <Stack.Screen name="CreateEmail" component={CreateEmail} />  
                    <Stack.Screen name="VerifyEmail" component={VerifyEmail} />  
                </>
            )}
        </Stack.Navigator>
    )
}

export default RootStack