import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../constants/colors";

import SignIn from "../screen/SignIn";
import ChooseProfile from "../screen/ChooseProfile";
import CreateEmail from "../screen/CreateEmail";
import VerifyEmail from "../screen/VerifyEmail";
import Trilhas from "../screen/Trilhas";
import MinhasTrilhas from "../screen/MinhasTrilhas";
import HomeGuia from "../screen/HomeGuia";
import MinhasTrilhasGuia from "../screen/MinhasTrilhasGuia";
import CadastrarEvento from "../screen/CadastrarEvento";
import GerenciarTrilhaGuia from "../screen/GerenciarTrilhaGuia";
import EditarEventoGuia from "../screen/EditarEventoGuia";
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

const Stack = createNativeStackNavigator();

function RootStack() {
    const { isLoggedIn, isGuide, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background || '#ffffff' }}>
                <ActivityIndicator size="large" color={colors.primary || '#264A31'} />
            </View>
        );
    }

    return (
        <Stack.Navigator 
            screenOptions={{ headerShown: false }}
            initialRouteName={!isLoggedIn ? "Login" : (isGuide ? "HomeGuia" : "Trilhas")}
        >
            {isLoggedIn ? (
                isGuide ? (
                    // Telas para usuários com perfil de Guia (HomeGuia é a tela inicial)
                    <>
                        <Stack.Screen name="HomeGuia" component={HomeGuia} />
                        <Stack.Screen name="MinhasTrilhasGuia" component={MinhasTrilhasGuia} />
                        <Stack.Screen name="GerenciarTrilhaGuia" component={GerenciarTrilhaGuia} />
                        <Stack.Screen name="CadastrarEvento" component={CadastrarEvento} />
                        <Stack.Screen name="EditarEventoGuia" component={EditarEventoGuia} />
                        <Stack.Screen name="DetalhesEvento" component={DetalhesEvento} />
                        <Stack.Screen name="Notificacoes" component={Notificacoes} />
                        <Stack.Screen name="Perfil" component={Perfil} />
                        <Stack.Screen name="PerfilGuia" component={PerfilGuia} />
                        <Stack.Screen name="Trilhas" component={Trilhas} />
                        <Stack.Screen name="MinhasTrilhas" component={MinhasTrilhas} />
                        <Stack.Screen name="Guias" component={Guias} />
                        <Stack.Screen name="Salvos" component={Salvos} />
                        <Stack.Screen name="DicasTrilha" component={DicasTrilha} />
                        <Stack.Screen name="Dicas" component={DicasTrilha} />
                        <Stack.Screen name="PagamentoTrilha" component={PagamentoTrilha} />
                    </>
                ) : (
                    // Telas para usuários com perfil de Trilheiro (Trilhas é a tela inicial)
                    <>
                        <Stack.Screen name="Trilhas" component={Trilhas} />
                        <Stack.Screen name="MinhasTrilhas" component={MinhasTrilhas} />
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
                )
            ) : (
                // Telas para usuários não logados (fluxo de autenticação - Login é a tela inicial)
                <>
                    <Stack.Screen name="Login" component={Login} />  
                    <Stack.Screen name="SignIn" component={SignIn} /> 
                    <Stack.Screen name="ChooseProfile" component={ChooseProfile} /> 
                    <Stack.Screen name="CreateEmail" component={CreateEmail} />  
                    <Stack.Screen name="VerifyEmail" component={VerifyEmail} /> 
                    <Stack.Screen name="CreatePassword" component={CreatePassword} />  
                    <Stack.Screen name="AccountCreated" component={AccountCreated} />  
                    <Stack.Screen name="LoginEmail" component={LoginEmail} /> 
                </>
            )}
        </Stack.Navigator>
    );
}

export default RootStack;
