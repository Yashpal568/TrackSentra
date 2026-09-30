export interface Company {
  id: string;
  name: string;
}

export interface User {
  id: string;
  companyId: string;
  email: string;
  role: 'admin' | 'guard';
}
