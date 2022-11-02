class Block {
    constructor(posts, profiles, previous_block_hash) {
        this.posts = posts
        this.profiles = profiles
        this.previous_block_hash = previous_block_hash
    }

    get_hash() {
        // TODO Hash all contents, including previous block hash
    }
}

class Post {
    constructor(body, author) {
        this.body = body
        this.author = author
    }
}

class Profile {
    constructor(bio, handle, pubkey) {
        this.bio = bio
        this.handle = handle
        this.pubkey = pubkey
    }
}