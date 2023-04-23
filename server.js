if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const express = require('express');
const app = express();
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./middleswares/connectDB')
const {errorHandler, notFound} = require('./middleswares/errorhandler')
const logger = require('./middleswares/logger')
const session = require('express-session')


//import routes
const Authroutes = require('./routes/authRoutes');
const UserRoutes = require('./routes/useroutes')
const PostRoutes = require('./routes/postRoutes')
const TransferRoutes = require('./routes/transferRoutes');


const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// middlewares
app.use(session(sessionConfig))
app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ limit: "500mb", extended: true }));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}


//intailize database
connectDB()

logger();


app.get('/', (req, res) => {
    res.json({ message: "Connected" })
})

app.use('/api/user', Authroutes);
app.use('/api/user', UserRoutes);
app.use('/api/post', PostRoutes);
app.use('/api/bank', TransferRoutes)

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server is listening on PORT ${PORT}`))