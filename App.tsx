import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Settings, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  MessageSquare,
  MonitorPlay,
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Customer, Platform, PaymentStatus, DashboardStats } from './types';
import CustomerModal from './components/CustomerModal';
import AIAssistantModal from './components/AIAssistantModal';
import { generateCustomerMessage } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [view, setView] = useState<'dashboard' | 'customers' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // AI State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedAICustomer, setSelectedAICustomer] = useState<Customer | null>(null);

  // Initial Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('iptv_customers');
    if (saved) {
      try {
        setCustomers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse customers");
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('iptv_customers', JSON.stringify(customers));
  }, [customers]);

  // Derived Stats
  const stats: DashboardStats = useMemo(() => {
    const now = new Date();
    const active = customers.filter(c => c.paymentStatus === PaymentStatus.ADIMPLENTE);
    const inactive = customers.filter(c => c.paymentStatus === PaymentStatus.INADIMPLENTE);
    const expiring = customers.filter(c => {
      const due = new Date(c.dueDate);
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 5;
    });

    return {
      totalCustomers: customers.length,
      activeCustomers: active.length,
      inactiveCustomers: inactive.length,
      totalRevenue: active.reduce((acc, curr) => acc + (curr.planPrice - curr.discount), 0),
      expiringSoon: expiring.length
    };
  }, [customers]);

  // Handlers
  const handleAddCustomer = (customer: Customer) => {
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    } else {
      setCustomers([...customers, customer]);
    }
    setEditingCustomer(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este cliente?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleGenerateMessage = async (customer: Customer, type: 'REMINDER' | 'WELCOME') => {
    setSelectedAICustomer(customer);
    setAiLoading(true);
    setAiMessage('');
    setIsAIModalOpen(true);
    
    const msg = await generateCustomerMessage(customer, type);
    
    setAiMessage(msg);
    setAiLoading(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerId.includes(searchTerm) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
            <MonitorPlay className="text-blue-500 w-8 h-8" />
            <span className="hidden lg:block ml-3 font-bold text-xl tracking-wide">IPTV MANAGER</span>
          </div>
          
          <nav className="mt-8 px-2 space-y-2">
            <button 
              onClick={() => setView('dashboard')} 
              className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <LayoutDashboard size={20} />
              <span className="hidden lg:block ml-3 font-medium">Dashboard</span>
            </button>
            <button 
              onClick={() => setView('customers')} 
              className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'customers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Users size={20} />
              <span className="hidden lg:block ml-3 font-medium">Clientes</span>
            </button>
             <button 
              onClick={() => setView('settings')} 
              className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Settings size={20} />
              <span className="hidden lg:block ml-3 font-medium">Configurações</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
           <div className="bg-slate-900 rounded-lg p-3 text-xs text-slate-500 hidden lg:block">
            <p className="font-semibold text-slate-400">Versão Web 1.0</p>
            <p>Roda no navegador.</p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-800 flex items-center justify-between px-8">
           <h1 className="text-2xl font-bold text-white capitalize">{view === 'dashboard' ? 'Visão Geral' : view === 'customers' ? 'Gestão de Clientes' : 'Configurações'}</h1>
           
           <div className="flex items-center gap-4">
             {view === 'customers' && (
                <button 
                  onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-blue-600/20"
                >
                  <Plus size={18} /> Novo Cliente
                </button>
             )}
           </div>
        </header>

        <div className="p-8">
          {view === 'dashboard' && (
            <div className="space-y-8">
               {/* Stats Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Total de Clientes</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{stats.totalCustomers}</h3>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                        <Users size={24} />
                      </div>
                    </div>
                 </div>
                 
                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Receita Estimada</p>
                        <h3 className="text-3xl font-bold text-emerald-400 mt-2">R$ {stats.totalRevenue.toFixed(2)}</h3>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <span className="font-bold text-xl">R$</span>
                      </div>
                    </div>
                 </div>

                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Inadimplentes</p>
                        <h3 className="text-3xl font-bold text-red-400 mt-2">{stats.inactiveCustomers}</h3>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                        <AlertCircle size={24} />
                      </div>
                    </div>
                 </div>

                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Vencendo em 5 dias</p>
                        <h3 className="text-3xl font-bold text-amber-400 mt-2">{stats.expiringSoon}</h3>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                        <CheckCircle size={24} />
                      </div>
                    </div>
                 </div>
               </div>
               
               {/* Recent Activity or Quick List could go here */}
               <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                 <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
                 <p className="text-slate-400">Navegue até a aba "Clientes" para gerenciar sua base.</p>
               </div>
            </div>
          )}

          {view === 'customers' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-4">
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                      type="text" 
                      placeholder="Buscar por nome, ID ou telefone..." 
                      className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="flex gap-2">
                   {/* Filters could go here */}
                 </div>
              </div>

              {/* Table */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold tracking-wider">
                      <tr>
                        <th className="p-4">Cliente / ID</th>
                        <th className="p-4">Plano / App</th>
                        <th className="p-4">Vencimento</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Financeiro</th>
                        <th className="p-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">
                            Nenhum cliente encontrado. Adicione um novo cliente.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map(customer => (
                          <tr key={customer.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="p-4">
                              <div className="font-medium text-white">{customer.name}</div>
                              <div className="text-xs text-slate-500">ID: {customer.customerId}</div>
                              <div className="text-xs text-slate-500">{customer.phone}</div>
                            </td>
                            <td className="p-4">
                               <div className="flex items-center gap-2">
                                 <span className={`px-2 py-0.5 rounded text-xs font-bold ${customer.platform === Platform.KRON ? 'bg-blue-900 text-blue-300' : 'bg-amber-900 text-amber-300'}`}>
                                   {customer.platform}
                                 </span>
                                 <span className="text-sm text-slate-300">{customer.screenCount} Tela(s)</span>
                               </div>
                               <div className="text-xs text-slate-500 mt-1">{customer.appName}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-slate-300">{new Date(customer.dueDate).toLocaleDateString('pt-BR')}</div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                customer.paymentStatus === PaymentStatus.ADIMPLENTE 
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                              }`}>
                                {customer.paymentStatus}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-slate-200">R$ {customer.planPrice.toFixed(2)}</div>
                              {customer.discount > 0 && (
                                <div className="text-xs text-green-400">Desc: R$ {customer.discount}</div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleGenerateMessage(customer, 'REMINDER')}
                                  className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                                  title="Gerar Cobrança IA"
                                >
                                  <MessageSquare size={18} />
                                </button>
                                <button 
                                  onClick={() => handleEdit(customer)}
                                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(customer.id)}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 size={18} />
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
          )}

          {view === 'settings' && (
             <div className="max-w-2xl bg-slate-800 p-8 rounded-2xl border border-slate-700">
                <h2 className="text-xl font-bold mb-4">Sobre o App</h2>
                <div className="prose prose-invert">
                  <p>Este sistema foi desenvolvido para controle local de clientes IPTV.</p>
                  <p>Os dados são salvos no armazenamento do seu navegador (LocalStorage). Não limpe o cache deste site se quiser manter os dados.</p>
                  
                  <h3 className="text-lg font-bold mt-6 mb-2">Instalação</h3>
                  <p className="flex items-center gap-2 text-slate-300">
                    <Download size={18} /> 
                    Para "baixar" este app: No Chrome, clique nos três pontinhos > Salvar e Compartilhar > Instalar Página como App.
                  </p>
                </div>
             </div>
          )}
        </div>
      </main>

      <CustomerModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingCustomer(null); }} 
        onSave={handleAddCustomer}
        initialData={editingCustomer}
      />

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        message={aiMessage}
        loading={aiLoading}
        targetPhone={selectedAICustomer?.phone || ''}
      />
    </div>
  );
};

export default App;