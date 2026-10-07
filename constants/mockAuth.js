// Armazenamento em memória para simular o banco de dados até a criação do backend real
export const mockDatabase = {
  // Usuário padrão baseado no protótipo para testes rápidos
  defaultUser: {
    email: 'sarah.jansen@gmail.com',
    password: 'senha123@',
  },

  // Guarda o último usuário que acabou de se cadastrar no app
  registeredUser: null,
};
