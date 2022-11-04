import { DatabaseManager } from "./db.js"


async function main() {
    console.log("Welcome to the neo4j-powered node for blockchain social media")
    let mgr = new DatabaseManager()

    // TODO Start block creation loop and expose an interface for CRUD on stored data

    // Start CRUD api, on any update, send the result to other nodes

    while (true) {
        // Gather unattached objects from database
        // Try solving a hash puzzle
        // Send result, unless interrupted by another node solving it first
    }

    await mgr.close()
}

export { main }
