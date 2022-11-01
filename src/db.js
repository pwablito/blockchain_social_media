import { driver, auth } from 'neo4j-driver';


class DatabaseManager {
    constructor() {
        const uri = process.env.NEO4J_URI || "neo4j://localhost:7687";
        const user = process.env.NEO4J_USER || "neo4j";
        const password = process.env.NEO4J_PASSWORD || "password";

        this.db_driver = driver(uri, auth.basic(user, password))
    }

    async do_stuff() {
        const session = this.db_driver.session()
        try {
            console.dir((await session.run(
                'CREATE (a:Person {name: $name1}) -[r:RESPECTS]-> (b:Person {name: $name2}) RETURN a, b, r', {
                    name1: "Bob",
                    name2: "Alice",
                }
            )).records, { depth: null })
        } finally {
            await session.close()
        }
    }

    async close() {
        await this.db_driver.close()
    }
}

export {
    DatabaseManager
}