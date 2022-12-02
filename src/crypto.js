function hash_data(data) {
    let hash = createHash(HASH_TYPE)
    hash.update(data)
    return hash.digest()
}

function rsa_decrypt(ciphertext, key) {
    throw { "error": "Not implemented" }
}

function validate_signature(data, signature, pubkey) {
    let hash = hash_data(data)
    return rsa_decrypt(signature, pubkey) == hash
}