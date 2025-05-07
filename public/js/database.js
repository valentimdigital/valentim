// Funções para interagir com a API

// Salvar uma nova ficha
async function salvarFicha(dados) {
    try {
        const response = await fetch('/api/fichas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao salvar ficha');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Buscar todas as fichas
async function buscarFichas() {
    try {
        const response = await fetch('/api/fichas');
        
        if (!response.ok) {
            throw new Error('Erro ao buscar fichas');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Buscar ficha por CNPJ
async function buscarFichaPorCNPJ(cnpj) {
    try {
        const response = await fetch(`/api/fichas/${cnpj}`);
        
        if (!response.ok) {
            throw new Error('Ficha não encontrada');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Atualizar ficha
async function atualizarFicha(cnpj, dados) {
    try {
        const response = await fetch(`/api/fichas/${cnpj}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao atualizar ficha');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Deletar ficha
async function deletarFicha(cnpj) {
    try {
        const response = await fetch(`/api/fichas/${cnpj}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao deletar ficha');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Exportar as funções
window.database = {
    salvarFicha,
    buscarFichas,
    buscarFichaPorCNPJ,
    atualizarFicha,
    deletarFicha
}; 