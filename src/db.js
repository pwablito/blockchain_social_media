import { driver, auth } from 'neo4j-driver';


class DatabaseManager {
    constructor() {
        const uri = process.env.NEO4J_URI || "neo4j://localhost:7687";
        const user = process.env.NEO4J_USER || "neo4j";
        const password = process.env.NEO4J_PASSWORD || "password";

        this.db_driver = driver(uri, auth.basic(user, password))
    }

    async get_pubkey(profile_handle) {
        const session = this.db_driver.session()
        let pubkey
        try {
            let response = (await session.run(
                'MATCH (pr:Profile) WHERE pr.handle=$handle RETURN pr.pubkey', {
                    handle: profile_handle,
                }
            ))
            if (response.records.length == 0) {
                throw {
                    error: "Handle not found"
                }
            } else if (response.records.length > 1) {
                throw {
                    error: "Multiple records returned"
                }
            }
            pubkey = response.records[0]._fields[0].pubkey
        } finally {
            await session.close()
        }
        return pubkey
    }

    async create_post(body, author_id) {
        const session = this.db_driver.session()

        // TODO query author_id and create a relationship between new post and associated Profile
        try {
            // Create detached node which will be collected at next block creation
            await session.run(
                'CREATE (p:Post {body: $body, author_id: $author_id}) RETURN p', {
                    body: body,
                    author_id: author_id,
                }
            )
        } finally {
            await session.close()
        }
    }

    async create_profile(handle, pubkey, bio) {
        const session = this.db_driver.session()
        try {
            let response = (await session.run(
                'CREATE (pr:Profile {handle: $handle, pubkey: $pubkey, bio: $bio}) RETURN pr', {
                    handle: handle,
                    pubkey: pubkey,
                    bio: bio,
                }
            ))
            pubkey = response.records[0]._fields[0].pubkey
        } finally {
            await session.close()
        }
        return pubkey
    }

    async close() {
        await this.db_driver.close()
    }
}

export {
    DatabaseManager
}