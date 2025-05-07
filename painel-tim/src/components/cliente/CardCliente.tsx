import { useRouter } from 'next/navigation';
import { Edit, Trash2, Phone, Mail, User } from 'lucide-react';

interface Cliente {
  id: string;
  cnpj: string;
  nomeEmpresarial: string;
  naturezaJuridica: string;
  situacaoCadastral: string;
  limiteCredito: boolean;
  dividasTim: boolean;
  etapaVenda: string;
  telefone?: string | null;
  email?: string | null;
  contatoNome?: string | null;
  contatoNumero?: string | null;
}

interface CardClienteProps {
  cliente: Cliente;
}

export function CardCliente({ cliente }: CardClienteProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{cliente.nomeEmpresarial}</h3>
          <p className="text-sm text-gray-500">CNPJ: {cliente.cnpj}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/clientes/${cliente.id}/editar`)}
            className="p-2 text-gray-500 hover:text-[#00348D] hover:bg-gray-100 rounded-lg transition"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir este cliente?')) {
                // Implementar exclusão
              }
            }}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg transition"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Natureza Jurídica</p>
          <p className="text-sm font-medium">{cliente.naturezaJuridica}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Situação Cadastral</p>
          <p className="text-sm font-medium">{cliente.situacaoCadastral}</p>
        </div>
      </div>

      <div className="space-y-2">
        {cliente.telefone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={16} />
            <span>{cliente.telefone}</span>
          </div>
        )}
        {cliente.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={16} />
            <span>{cliente.email}</span>
          </div>
        )}
        {cliente.contatoNome && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} />
            <span>{cliente.contatoNome}</span>
            {cliente.contatoNumero && <span>({cliente.contatoNumero})</span>}
          </div>
          )}
        </div>

      <div className="mt-4 flex gap-2">
        <span className={`px-2 py-1 text-xs rounded-full ${cliente.limiteCredito ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {cliente.limiteCredito ? 'Com Limite' : 'Sem Limite'}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full ${!cliente.dividasTim ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {cliente.dividasTim ? 'Com Dívida' : 'Sem Dívida'}
        </span>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          {cliente.etapaVenda}
        </span>
      </div>
    </div>
  );
} 