import React from 'react';
import Login from './Login';

// Redireciona SignIn para a nova tela de Login padronizada
function SignIn(props) {
  return <Login {...props} />;
}

export default SignIn;
