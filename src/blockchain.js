import { createHash } from 'node:crypto';


const HASH_TYPE = 'sha256'

class Block {
    constructor(posts, profiles, comments, previous_block_hash) {
        this.posts = posts
        this.profiles = profiles
        this.comments = comments
        this.previous_block_hash = previous_block_hash
    }

    get_hash() {
        let hash = createHash(HASH_TYPE)
        for (let post in this.posts) hash.update(post.get_hash())
        for (let profile in this.profiles) hash.update(profile.get_hash())
        for (let comment in this.comments) hash.update(comment.get_hash())
        hash.update(this.previous_block_hash)
        return hash.digest()
    }
}

class Post {
    constructor(id, body, author_handle) {
        this.id = id
        this.body = body
        this.author_handle = author_handle
    }

    get_hash() {
        let hash = createHash(HASH_TYPE)
        hash.update(this.id)
        hash.update(this.body)
        hash.update(this.author_handle)
        return hash.digest()
    }
}

class Comment {
    constructor(id, body, post_id, author_id) {
        this.id = id
        this.body = body
        this.post_id = post_id
        this.author_id = author_id
    }

    get_hash() {
        let hash = createHash(HASH_TYPE)
        hash.update(this.id)
        hash.update(this.body)
        hash.update(this.post_id)
        hash.update(this.author_id)
        return hash.digest()
    }
}


class Profile {
    constructor(id, handle, bio, pubkey) {
        this.id = id
        this.handle = handle
        this.bio = bio
        this.pubkey = pubkey
    }

    get_hash() {
        let hash = createHash(HASH_TYPE)
        hash.update(this.id)
        hash.update(this.handle)
        hash.update(this.bio)
        hash.update(this.pubkey)
        return hash.digest()
    }
}