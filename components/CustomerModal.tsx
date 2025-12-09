import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Customer, Platform, PaymentStatus } from '../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  initialData?: Customer | null;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    platform: Platform.KRON,
    paymentStatus: PaymentStatus.ADIMPLENTE,
    screenCount: 1,
    discount: 0,
    planPrice: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: crypto.randomUUID(),
        platform: Platform.KRON,
        paymentStatus: PaymentStatus.ADIMPLENTE,
        signupDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        screenCount: 1,
        discount: 0,
        planPrice: 29.90,
        bonus: '',
        appName: '',
        customerId: '',
        name: '',
        phone: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Customer);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'screenCount' || name === 'planPrice' || name === 'discount' ? Number(value) : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {initialData ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Nome do Cliente</label>
            <input required name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: João Silva" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">ID do Cliente</label>
            <input required name="customerId" value={formData.customerId || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 102030" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Telefone (WhatsApp)</label>
            <input required name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 11999999999" type="tel" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Plataforma</label>
            <select name="platform" value={formData.platform} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option value={Platform.KRON}>KRON</option>
              <option value={Platform.VOLT}>VOLT</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Nome do App</label>
            <input name="appName" value={formData.appName || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Smarters Player" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Quantidade de Telas</label>
            <input type="number" min="1" name="screenCount" value={formData.screenCount} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Valor do Plano (R$)</label>
            <input type="number" step="0.01" name="planPrice" value={formData.planPrice} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Data de Cadastro</label>
            <input type="date" name="signupDate" value={formData.signupDate || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

           <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Data de Vencimento</label>
            <input type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Status de Pagamento</label>
            <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option value={PaymentStatus.ADIMPLENTE}>ADIMPLENTE (Pago)</option>
              <option value={PaymentStatus.INADIMPLENTE}>INADIMPLENTE (Pendente)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Desconto (R$)</label>
            <input type="number" step="0.01" name="discount" value={formData.discount} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Bonificação (Descrição)</label>
            <input name="bonus" value={formData.bonus || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: +15 dias grátis" />
          </div>

          <div className="md:col-span-2 pt-4 flex justify-end gap-3">
             <button type="button" onClick={onClose} className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
              <Save size={20} />
              Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;