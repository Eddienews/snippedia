// 1. Importar as bibliotecas
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

// 2. Criar a aplicação e definir a porta
const app = express();
const PORT = Number(process.env.PORT || 3001); // A nossa API vai correr nesta porta interna

// 3. Configurações essenciais
app.use(cors()); // Permite pedidos de outros domínios (o seu frontend)
app.use(express.json()); // Permite que a API entenda JSON nos pedidos

// 4. Configuração da ligação à base de dados
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'snippedia_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'snippedia_db'
};

// 5. Definir o nosso primeiro Endpoint (Rota da API)
// Quando alguém aceder a GET /api/users, este código será executado.
app.get('/api/users', async (req, res) => {
    try {
        console.log("Recebido pedido para /api/users"); // Para depuração
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT id, username, email, display_name FROM users');
        await connection.end();
        res.json(rows); // Envia os resultados como resposta JSON
    } catch (error) {
        console.error('Erro ao buscar utilizadores:', error);
        res.status(500).json({ message: 'Erro ao conectar à base de dados.' });
    }
});

// Rota de "olá mundo" para testar se o servidor está no ar
app.get('/api', (req, res) => {
    res.json({ message: 'Olá! A API do Snippedia está no ar!' });
});

// 6. Iniciar o servidor para que ele comece a "ouvir" os pedidos
app.listen(PORT, () => {
    console.log(`Servidor da API a correr em http://localhost:${PORT}`);
});
