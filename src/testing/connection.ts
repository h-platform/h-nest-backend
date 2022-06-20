import { allEntities } from 'src/all-entities';
import { createConnection, getConnection } from 'typeorm';

const connection = {
    async create() {
        await createConnection({
            type: 'mysql',
            host: 'localhost',
            // port: 5433,
            username: 'root',
            password: '1234',
            database: 'h-database',
            ssl: false,
            entities: allEntities,
            synchronize: true,
            logging: true,
        });
    },

    getEntityManager() {
        const connection = getConnection();
        return connection.createEntityManager();
    },

    async close() {
        await getConnection().close();
    },

    async clear() {
        const connection = getConnection();
        const entities = connection.entityMetadatas;

        entities.forEach(async (entity) => {
            const repository = connection.getRepository(entity.name);
            await repository.query(`DELETE FROM ${entity.tableName}`);
        });
    },
};
export default connection;
