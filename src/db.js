import { driver, auth, session } from 'neo4j-driver';
import { generate_id } from './util.js';
import { Profile, Comment, Post } from './blockchain.js';


class DatabaseManager {
    constructor() {
        const uri = process.env.NEO4J_URI || "neo4j://localhost:7687";
        const user = process.env.NEO4J_USER || "neo4j";
        const password = process.env.NEO4J_PASSWORD || "password";

        this.db_driver = driver(uri, auth.basic(user, password))
    }

    async create_block(block_id, post_ids, profile_ids, comment_ids, previous_block_hash) {
        try {
            await session.run(
                'CREATE (b:Block {id: $id, previous_block_hash: $previous_block_hash}) RETURN b', {
                    id: block_id,
                    previous_block_hash: previous_block_hash,
                }
            )
            for (let post_id in post_ids) {
                await session.run(
                    'MATCH (p:Post) WHERE p.id=$post_id MATCH (b:Block) WHERE b.id=$block_id CREATE (p)-[r:VERIFIES]->(b) RETURN r', {
                        post_id: post_id,
                        block_id: block_id,
                    }
                )
            }
            for (let profile_id in profile_ids) {
                await session.run(
                    'MATCH (p:Profile) WHERE p.id=$profile_id MATCH (b:Block) WHERE b.id=$block_id CREATE (p)-[r:VERIFIES]->(b) RETURN r', {
                        profile_id: profile_id,
                        block_id: block_id,
                    }
                )
            }
            for (let comment_id in comment_ids) {
                await session.run(
                    'MATCH (c:Comment) WHERE c.id=$comment_id MATCH (b:Block) WHERE b.id=$block_id CREATE (c)-[r:VERIFIES]->(b) RETURN r', {
                        comment_id: comment_id,
                        block_id: block_id,
                    }
                )
            }
        } finally {
            await session.close()
        }
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
            if (response.records.length === 0) {
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
            if (response.records.length === 0) {
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

        try {

            let response = await session.run(
                'MATCH (p:Profile) WHERE p.id=$id RETURN p', {
                    id: author_id,
                }
            )
            if (response.records.length === 0) {
                throw {
                    error: "Author id not found"
                }
            } else if (response.records.length > 1) {
                throw {
                    error: "Multiple authors with matching id returned"
                }
            }

            // Check that the new post id hasnt already been used somewhere
            response = await session.run(
                'MATCH (p:Post) WHERE p.id=$id RETURN p', {
                    id: post_id
                }
            )
            if (response.records.length !== 0) {
                throw {
                    error: "id already used"
                }
            }

            // Create detached node which will be collected at next block creation
            await session.run(
                'CREATE (p:Post {id: $id, body: $body, author_id: $author_id}) RETURN p', {
                    id: post_id,
                    body: body,
                    author_id: author_id,
                }
            )
            response = await session.run(
                'MATCH (po:Post {id: $post_id}) MATCH (pr:Profile {id: $profile_id} CREATE (pr)-[r:POSTED]->(po) RETURN r', {
                    post_id: post_id,
                    profile_id: author_id,
                }
            )
            if (response.records.length === 0) {
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


    async get_detached_profiles() {
        const session = this.db_driver.session()
        let profiles = []
        try {
            let response = await session.run(
                'MATCH (pr:Profile) WHERE NOT (pr)--(b:Block) RETURN pr'
            )
            for (let fields in response.records[0]._fields) {
                profiles.push(new Profile(
                    fields.id,
                    fields.handle,
                    fields.bio,
                    fields.pubkey,
                ))
            }
        } finally {
            await session.close()
        }
        return profiles
    }
    async get_detached_posts() {
        const session = this.db_driver.session()
        let posts = []
        try {
            let response = await session.run(
                'MATCH (po:Post) WHERE NOT (po)--(b:Block) RETURN po'
            )
            for (let fields in response.records[0]._fields) {
                posts.push(new Post(
                    fields.id,
                    fields.body,
                    fields.author_handle,
                ))
            }
        } finally {
            await session.close()
        }
        return posts
    }
    async get_detached_comments() {
        const session = this.db_driver.session()
        let comments = []
        try {
            let response = await session.run(
                'MATCH (c:Comment) WHERE NOT (c)--(b:Block) RETURN c'
            )
            for (let fields in response.records[0]._fields) {
                comments.push(new Comment(
                    fields.id,
                    fields.body,
                    fields.post_id,
                    fields.author_id,
                ))
            }
        } finally {
            await session.close()
        }
        return comments
    }

    async close() {
        await this.db_driver.close()
    }
}

export {
    DatabaseManager
}