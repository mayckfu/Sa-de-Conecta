import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { 
  UserCheck, 
  UserX, 
  Shield, 
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { cn } from '../utils/cn';

interface UserProfile {
  id: string;
  nome: string;
  role: 'admin' | 'cadastrador' | 'visitante';
  status: 'pending' | 'approved' | 'rejected';
  email?: string;
}

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Redirect if not admin (and auth is loaded)
    if (!authLoading && profile && profile.role !== 'admin') {
      navigate('/gestao');
    }
  }, [profile, authLoading, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Note: We need to join with auth.users if we want email, 
      // but for simplicity we'll just show what's in profiles first.
      // Admins can read all profiles due to RLS.
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nome');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateStatus = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const updateRole = async (userId: string, role: 'admin' | 'cadastrador' | 'visitante') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-500" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Administração</p>
        </div>
        <h2 className="font-display text-4xl font-bold text-arc-dark tracking-tight">Gestão de Usuários</h2>
        <p className="text-sm font-medium text-slate-500">Controle de acessos e permissões do sistema</p>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => fetchUsers()}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Atualizar
          </button>
        </div>
        
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendentes</p>
              <h3 className="text-2xl font-display font-extrabold text-amber-500">
                {users.filter(u => u.status === 'pending').length}
              </h3>
           </div>
           <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
           </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.04]">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Usuário</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nível de Acesso</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Carregando usuários...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">
                          {u.nome?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-arc-dark">{u.nome}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{u.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer hover:text-violet-600"
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value as any)}
                      >
                        <option value="visitante">Visitante</option>
                        <option value="cadastrador">Cadastrador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                        u.status === 'approved' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        u.status === 'rejected' ? "bg-red-50 text-red-600 border border-red-100" :
                        "bg-amber-50 text-amber-600 border border-amber-100"
                      )}>
                        {u.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {u.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {u.status === 'pending' && <Clock className="w-3 h-3" />}
                        {u.status === 'approved' ? 'Aprovado' : u.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateStatus(u.id, 'approved')}
                              className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Aprovar"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateStatus(u.id, 'rejected')}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                              title="Rejeitar"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
