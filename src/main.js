import { DatabaseManager } from "./db.js"
import { get_api } from "./api.js"


const api_port = 8000

async function main() {
    console.log("Welcome to the neo4j-powered node for blockchain social media")
    let mgr = new DatabaseManager()

    // TODO Start block creation loop and expose an interface for CRUD on stored data
    const api = get_api(mgr)
    const server = api.listen(api_port, () => console.log(`Started api listener on port ${api_port}`))

    let interrupt = false
    let interrupt_func = () => {
        console.log("Got interrupt, killing program")
        interrupt = true
        server.close(() => {
            console.log("Shutting down api listener")
        })
    }

    // Set signal handlers to kill main loop
    process.on('SIGINT', interrupt_func)
    process.on('SIGQUIT', interrupt_func)
    process.on('SIGTERM', interrupt_func)

    while (!interrupt) {
        // Short sleep for debugging purposes to allow node to shutdown on interrupt
        // TODO remove this eventually
        await new Promise(resolve => setTimeout(resolve, 100));
        // Gather unattached objects from database
        let profiles = mgr.get_detached_profiles()
        let posts = mgr.get_detached_posts()
        let comments = mgr.get_detached_comments()


        // Try solving a hash puzzle to generate nonce for new block
        // Send result, unless interrupted by another node solving it first

    }

    await mgr.close()
}

export { main }