export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CLIENTES: '/clientes',
  CLIENTE_NOVO: '/clientes/novo',
  CLIENTE_EDITAR: (id: string) => `/clientes/${id}/editar`,
  ATENDIMENTO: '/atendimento',
  CONFIGURACAO: '/configuracao',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
};

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.CLIENTES,
  ROUTES.ATENDIMENTO,
  ROUTES.CONFIGURACAO,
];

export const PUBLIC_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
]; 