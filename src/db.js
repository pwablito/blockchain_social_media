import { driver, auth, session } from 'neo4j-driver';
import { generate_id } from './util.js';


class DatabaseManager {
    constructor() {
        const uri = process.env.NEO4J_URI || "neo4j://localhost:7687";
        const user = process.env.NEO4J_USER || "neo4j";
        const password = process.env.NEO4J_PASSWORD || "password";

        this.db_driver = driver(uri, auth.basic(user, password))
    }

    async set_head(block_id) {
        try {

            // Delete old head
            await session.run(
                'MATCH (h:Head) DETACH DELETE h'
            )

            // Create new head detached
            await session.run(
                'CREATE (h:Head {block_id: $block_id}) RETURN h', {
                    block_id: block_id
                }
            )

            // Attach new head to block
            let response = await session.run(
                'MATCH (h:Head) MATCH (b:Block) WHERE b.id=$block_id CREATE (h)-[r:IS_CURRENTLY]->(b) RETURN r', {
                    block_id: block_id
                }
            )

            // Check that the right number of connections were made
            if (response.records.length == 0) {
                throw {
                    error: "Block not found"
                }
            } else if (response.records.length > 1) {
                throw {
                    error: "Multiple blocks with matching id returned"
                }
            }
        } finally {
            await session.close()
        }
    }

    async get_pubkey(profile_handle) {
        const session = this.db_driver.session()
        let pubkey
        try {
            let response = await session.run(
                'MATCH (pr:Profile) WHERE pr.handle=$handle RETURN pr.pubkey', {
                    handle: profile_handle,
                }
            )
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
        let post_id = generate_id()

        // TODO query author_id and create a relationship between new post and associated Profile
        try {

            let response = await session.run(
                'MATCH (p:Profile) WHERE p.id=$id RETURN p', {
                    id: author_id,
                }
            )
            if (response.records.length == 0) {
                throw {
                    error: "Author id not found"
                }
            } else if (response.records.length > 1) {
                throw {
                    error: "Multiple authors with matching id returned"
                }
            }

            // TODO check that the new post id hasnt already been used somewhere, recreate it until we get a new one
            // Create detached node which will be collected at next block creation
            await session.run(
                'CREATE (p:Post {id: $id, body: $body, author_id: $author_id}) RETURN p', {
                    id: post_id,
                    body: body,
                    author_id: author_id,
                }
            )
            await session.run(
                'MATCH (po:Post {id: $post_id}) MATCH (pr:Profile {id: $profile_id} CREATE (pr)-[r:POSTED]->(po) RETURN r', {
                    post_id: post_id,
                    profile_id: author_id,
                }
            )
            if (response.records.length == 0) {
                throw {
                    error: "Relationship not created"
                }
            } else if (response.records.length > 1) {
                throw {
                    error: "Multiple relationships created"
                }
            }
        } finally {
            await session.close()
        }
    }

    async create_profile(handle, pubkey, bio) {
        const session = this.db_driver.session()
        try {
            let response = await session.run(
                'CREATE (pr:Profile {handle: $handle, pubkey: $pubkey, bio: $bio}) RETURN pr', {
                    handle: handle,
                    pubkey: pubkey,
                    bio: bio,
                }
            )
            pubkey = response.records[0]._fields[0].pubkey
        } finally {
            await session.close()
        }
        return pubkey
    }

    async close() {
        await this.db_driver.close()
    }


    async get_detached_profiles() {
        throw {
            "error": "Not implemented"
        }
    }
    async get_detached_posts() {
        throw {
            "error": "Not implemented"
        }
    }
    async get_detached_comments() {
        throw {
            "error": "Not implemented"
        }
    }
}

export {
    DatabaseManager
}
