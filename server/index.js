import express from "express"
import dotenv from "dotenv"
import cors from "cors";
import cookieParser from "cookie-parser"
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.routes.js"
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js"
dotenv.config()
const app=express()

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))
const corsOptions={
    origin:"http://localhost:5173",
    credential:true
}
app.use(cors(corsOptions))

app.use("/api/v1/user",userRoute)

app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);


const PORT=process.env.PORT
app.listen(PORT,()=>{
    connectDB()
    console.log(`server listening on port:${PORT}`)
})