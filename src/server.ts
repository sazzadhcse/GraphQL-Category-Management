import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import connectDB from './config/database';

const app = express();
app.use(cors());

const server = new ApolloServer({
    typeDefs,
    resolvers
});


app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

async function startServer() {
    
    await server.start();

    await connectDB();
    
    app.use('/graphql',
        express.json(),
        expressMiddleware(server)
    );
    
    app.listen(4000, () => {
        console.log('Server is running on port 3000');
    });
}

startServer();