import express from "express"
import router from "./routes/index.js"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser('JohnHarvard'))
app.use('/', router)

export default app