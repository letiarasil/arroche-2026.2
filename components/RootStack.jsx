import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";

import SignIn from "../screen/SignIn";
import CreateEmail from "../screen/CreateEmail";
import VerifyEmail from "../screen/VerifyEmail";
import Trilhas from "../screen/Trilhas";
import DetalhesEvento from "../screen/DetalhesEvento";
import PagamentoTrilha from "../screen/PagamentoTrilha";
import DicasTrilha from "../screen/DicasTrilha";
import Notificacoes from "../screen/Notificacoes";
import Guias from "../screen/Guias";
import Salvos from "../screen/Salvos";
import Perfil from "../screen/Perfil";
import PerfilGuia from "../screen/PerfilGuia";

import CreatePassword from "../screen/CreatePassword";
import AccountCreated from "../screen/AccountCreated";
import Login from "../screen/Login";
import LoginEmail from "../screen/LoginEmail";

const Stack = createNativeStackNavigator() 

function RootStack() {
    const { isLoggedIn } = useAuth();

    return(
        <Stack.Navigator screenOptions={{ headerShown: false, }}>
            {isLoggedIn ? (
                // Telas para usuários logados
                <>
                    <Stack.Screen name="Trilhas" component={Trilhas} />
                    <Stack.Screen name="DetalhesEvento" component={DetalhesEvento} />
                    <Stack.Screen name="PagamentoTrilha" component={PagamentoTrilha} />
                    <Stack.Screen name="DicasTrilha" component={DicasTrilha} />
                    <Stack.Screen name="Dicas" component={DicasTrilha} />
                    <Stack.Screen name="Notificacoes" component={Notificacoes} />
                    <Stack.Screen name="Guias" component={Guias} />
                    <Stack.Screen name="PerfilGuia" component={PerfilGuia} />
                    <Stack.Screen name="Salvos" component={Salvos} />
                    <Stack.Screen name="Perfil" component={Perfil} />
                </>
            ) : (
                // Telas para usuários não logados (fluxo de autenticação)
                <>
                    <Stack.Screen name="Login" component={Login} />  
                    <Stack.Screen name="SignIn" component={SignIn} /> 
                    <Stack.Screen name="CreateEmail" component={CreateEmail} />  
                    <Stack.Screen name="VerifyEmail" component={VerifyEmail} /> 
                    <Stack.Screen name="CreatePassword" component={CreatePassword} />  
                    <Stack.Screen name="AccountCreated" component={AccountCreated} />  
                    <Stack.Screen name="LoginEmail" component={LoginEmail} /> 
                </>
            )}
        </Stack.Navigator>
    )
}

export default RootStack;
