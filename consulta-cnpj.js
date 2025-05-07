const response = await fetch(`http://192.168.1.15:3001/api/consulta-cnpj?cnpj=${cnpjLimpo}`, {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
}); 