class Block {
    constructor(posts, profiles) {
        this.posts = posts
        this.profiles = profiles
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