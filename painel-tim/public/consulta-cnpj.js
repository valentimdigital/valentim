async function consultarCNPJ(cnpj) {
    try {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) {
            throw new Error('CNPJ deve ter 14 dígitos');
        }

        const response = await fetch(`http://localhost:3001/api/consulta-cnpj?cnpj=${cnpjLimpo}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao consultar CNPJ');
        }

        const data = await response.json();
        
        if (data.status === 'ERROR') {
            throw new Error(data.message);
        }

        // Preenche os campos com os dados retornados
        document.querySelector('input[placeholder="Digite a razão social"]').value = data.nome;
        document.querySelector('input[placeholder="Digite o nome fantasia"]').value = data.fantasia || '';
        document.querySelector('input[placeholder="Data de abertura"]').value = data.abertura || '';
        document.querySelector('input[placeholder="Digite a inscrição estadual"]').value = 'Consultar';
        document.querySelector('input[placeholder="Digite a situação cadastral"]').value = data.situacao;
        document.querySelector('input[placeholder="Atividade principal"]').value = data.atividade_principal ? data.atividade_principal[0].text : '';
        document.querySelector('input[placeholder="Natureza jurídica"]').value = data.natureza_juridica || '';
        
        // Dados do Representante Legal
        if (data.qsa && data.qsa.length > 0) {
            const representante = data.qsa[0];
            document.querySelector('input[placeholder="Digite o nome completo"]').value = representante.nome;
        }
        
        // Endereço
        const camposEndereco = {
            logradouro: document.querySelector('input[placeholder="Rua, Avenida, etc"]'),
            numero: document.querySelector('input[placeholder="Número"]'),
            complemento: document.querySelector('input[placeholder="Apartamento, sala, etc"]'),
            bairro: document.querySelector('input[placeholder="Digite o bairro"]'),
            cep: document.querySelector('input[placeholder="00000-000"]'),
            municipio: document.querySelector('input[placeholder="Digite o município"]')
        };

        camposEndereco.logradouro.value = data.logradouro;
        camposEndereco.numero.value = data.numero;
        camposEndereco.complemento.value = data.complemento || '';
        camposEndereco.bairro.value = data.bairro;
        camposEndereco.cep.value = data.cep;
        camposEndereco.municipio.value = data.municipio;
        
        // Seleciona o estado
        const selectEstado = document.querySelector('select.input-field');
        if (selectEstado) {
            Array.from(selectEstado.options).forEach(option => {
                if (option.text === data.uf) {
                    selectEstado.value = option.value;
                }
            });
        }

        // Contato
        if (data.telefone) {
            document.querySelector('input[placeholder="(00) 00000-0000"]').value = data.telefone;
        }
        if (data.email) {
            document.querySelector('input[placeholder="exemplo@email.com"]').value = data.email;
        }

        // Configura o select de mesmo endereço
        setupEnderecoEntrega();

    } catch (error) {
        alert('Erro ao consultar CNPJ: ' + error.message);
    }
}

// Função para configurar o comportamento do endereço de entrega
function setupEnderecoEntrega() {
    const selectMesmoEndereco = document.getElementById('mesmoEndereco');
    const divEnderecoEntrega = document.getElementById('enderecoEntrega');

    // Configura o evento de mudança no select
    selectMesmoEndereco.addEventListener('change', handleEnderecoEntregaChange);

    // Função para lidar com a mudança no select
    function handleEnderecoEntregaChange() {
        const mesmoEndereco = selectMesmoEndereco.value === 'sim';
        
        if (mesmoEndereco) {
            // Se selecionou "Sim", esconde os campos
            divEnderecoEntrega.classList.add('hidden');
        } else {
            // Se selecionou "Não", mostra os campos vazios
            divEnderecoEntrega.classList.remove('hidden');
            
            // Limpa todos os campos do endereço de entrega
            const camposEnderecoEntrega = divEnderecoEntrega.querySelectorAll('input');
            camposEnderecoEntrega.forEach(campo => campo.value = '');
            
            // Reseta o select de estado
            const selectEstadoEntrega = divEnderecoEntrega.querySelector('select');
            if (selectEstadoEntrega) {
                selectEstadoEntrega.value = '';
            }
        }
    }

    // Executa a função uma vez para configurar o estado inicial
    handleEnderecoEntregaChange();
}

// Configura o comportamento do endereço de entrega quando a página carrega
document.addEventListener('DOMContentLoaded', setupEnderecoEntrega); 