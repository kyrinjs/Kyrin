/**
 * Kyrin Framework
 * Entry Point
 */
import {KyrinServer} from "./core/server"

const app = new KyrinServer({
    port:3000,
    hostname:"localhost",
    development:true
})

app.start()