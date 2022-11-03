import { randomUUID } from 'node:crypto';

function generate_id() {
    return randomUUID()
}

export {
    generate_id
}