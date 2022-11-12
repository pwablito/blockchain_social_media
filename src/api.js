import { default as express } from "express";
import { other_nodes } from "./main.js";


function get_api(db_manager) {
    const app = express()
    app.use(express.json())

    app.post('/status', (_, res) => {
        // Quick endpoint to check that the server is still up
        // TODO add some health checks, report back their results
        res.send({ success: true, status: "ok" })
    })

    app.post('/post', async(req, res) => {
        try {
            // TODO add some kind of signature validation. Signatures should end up in database too
            let post_id = await db_manager.create_post(req.body.body, req.body.author_id)
            res.send({ success: true, id: post_id })
        } catch (e) {
            console.log(e)
            res.send({ success: false, error: e })
        }
    })

    app.post('/profile', async(req, res) => {
        try {
            let profile_id = await db_manager.create_profile(req.body.handle, req.body.pubkey, req.body.bio)
            res.send({ success: true, id: profile_id })
        } catch (e) {
            console.log(e)
            res.send({ success: false, error: e })
        }
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