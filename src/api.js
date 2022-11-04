import {default as express} from "express";


function get_api(db_manager) {
  const app = express()
  app.get('/status', (_, res) => {
      res.send({"success": true, "status": "ok"})
  })
  return app
}


export {get_api}
