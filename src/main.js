import { DatabaseManager } from "./db.js"


async function main() {
    console.log("Welcome to the neo4j-powered node for blockchain social media")
    let mgr = new DatabaseManager()
    await mgr.do_stuff()
    await mgr.close()
}

export { main }