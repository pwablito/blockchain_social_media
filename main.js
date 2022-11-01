const neo4j = require('neo4j-driver')

const uri = process.env.NEO4J_URI || "neo4j://localhost:7687";
const user = process.env.NEO4J_USER || "neo4j";
const password = process.env.NEO4J_PASSWORD || "password";

async function main() {
    console.log("Welcome to the neo4j-powered node for blockchain social media")
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
    const session = driver.session()
    try {
        let result = await session.run(
            'CREATE (a:Person {name: $name1}) -[r:RESPECTS]-> (b:Person {name: $name2}) RETURN a, b, r', {
                name1: "Bob",
                name2: "Alice",
            }
        )
        console.dir(result.records, { depth: null })
    } finally {
        await session.close()
    }
    await driver.close()
}

main()