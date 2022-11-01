import { DatabaseManager } from "./db.js"


async function main() {
    console.log("Welcome to the neo4j-powered node for blockchain social media")
    let mgr = new DatabaseManager()

    // TODO Start block creation loop and expose an interface for CRUD on stored data

    await mgr.close()
}

export { main }