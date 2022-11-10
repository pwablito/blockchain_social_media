import { default as express } from "express";
import { other_nodes } from "./main.js";


function get_api(db_manager) {
    const app = express()
    app.use(express.json())
    app.get('/status', (_, res) => {
        res.send({ "success": true, "status": "ok" })
    })
    app.get('/post', (_, res) => {
        db_manager.create_post("test", "123")
        res.send({ "success": false, "error": "not implemented" })
    })
    app.get('/profile', async(_, res) => {
        let profile_id = await db_manager.create_profile("123", "test", "test")
        res.send({ success: false, id: profile_id })
    })
    app.post('/join', (req, res) => {
        res.send({ "success": true, "nodes": other_nodes })
        if (req.body.addr) {
            other_nodes.push(req.body.addr)
        }
    })
    return app
}

export { get_api }