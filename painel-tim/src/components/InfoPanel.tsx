console.log('InfoPanel carregado');

export default function InfoPanel() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium text-lg">Informações do Contato</h3>
      </div>
      <div className="p-4 space-y-6">
        {/* Dados do Contato */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Dados do Contato</h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">Nome</span>
              <p className="font-medium">João Silva</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Telefone</span>
              <p className="font-medium">(11) 99999-9999</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email</span>
              <p className="font-medium">joao.silva@email.com</p>
            </div>
          </div>
        </div>

        {/* Histórico */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Histórico</h4>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Primeiro contato:</span>{' '}
              <span className="font-medium">15/04/2024</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Último atendimento:</span>{' '}
              <span className="font-medium">27/04/2024</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Total de atendimentos:</span>{' '}
              <span className="font-medium">5</span>
            </div>
          </div>
        </div>

        {/* Anotações */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Anotações</h4>
          <textarea
            className="w-full h-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00348D]"
            placeholder="Adicione anotações sobre o contato..."
          />
        </div>
      </div>
    </div>
  );
} 