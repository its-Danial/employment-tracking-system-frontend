export enum RouteName {
  // Layouts
  AuthLayout = 'auth-layout',
  AppLayout = 'app-layout',

  // Auth Pages
  Login = 'login',
  Register = 'register',

  // App Page
  Dashboard = 'dashboard',
  Candidates = 'candidates',
  Candidate = 'candidate',
  NewCandidate = 'new-candidate',
  EditCandidate = 'edit-candidate',
  Contracts = 'contracts',
  Payments = 'payments',
  Companies = 'companies',
  Agents = 'agents',
  Trades = 'trades',

  // Platform admin (hidden, not in any menu)
  Platform = 'platform',

  // Blank Pages
  NotFound = 'not-found',
  Error = 'error',
  Unauthorized = 'unauthorized',
}
