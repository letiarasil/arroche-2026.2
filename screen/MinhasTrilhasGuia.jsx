import React from 'react';
import HomeGuia from './HomeGuia';

/**
 * Minhas Trilhas do Guia:
 * Tela onde o guia acompanha e gerencia suas trilhas cadastradas e histórico.
 * Reutiliza os fluxos de abas "Cadastradas" e "Histórico" com suporte a inicialização direta.
 */
export default function MinhasTrilhasGuia(props) {
  return <HomeGuia {...props} />;
}
