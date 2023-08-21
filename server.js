if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}
const express = require('express');
const app = express();
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./middleswares/connectDB')
const { errorHandler, notFound } = require('./middleswares/errorhandler')
const logger = require('./middleswares/logger')
const session = require('express-session')
const Message = require('./models/message')
const { Server } = require("socket.io");
const { createServer } = require("http");

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


const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});
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

const saveNewMessage = async (message, senderId, receiverId) => {
    const newMessage = new Message({
        message,
        receiver: receiverId,
        sender: senderId,
        users: [senderId, receiverId]
    })
    await newMessage.save();
    const messages = await Message.find({ users: { $all: [senderId, receiverId] } })
    return messages
}


const getAllMessages = async (senderId, receiverId) => {
    const messages = await Message.find({ users: { $all: [senderId, receiverId] } })
    return messages
}

io.on('connection', socket => {
    console.log('socket id', socket.id)
    socket.on('room', async (room) => {
        const senderId = room.split('-')[0];
        const receiverId = room.split('-')[1];
        socket.join(room);
        const allMessages = await getAllMessages(senderId, receiverId);
        io.to(room).emit('allMessage', allMessages);
    })

    socket.on('sendMessageToRoom', async ({ roomName, message }) => {
        const senderId = roomName.split('-')[0];
        const receiverId = roomName.split('-')[1];
        const allMessages = await saveNewMessage(message, senderId, receiverId);
        io.to(roomName).emit('newMessage', allMessages);
    });
})


const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
));