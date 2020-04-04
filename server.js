const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const Port = process.env.PORT || 3000;
const DbUrl = process.env.CHAT_APP_MONGO_CONNECTION || '';

const Message = mongoose.model('Message', {
    name: String,
    message: String
});

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

mongoose.connect(DbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    console.log('mongo db connection with error', err);
});

app.get('/messages', async (_req, res) => {
    try {
        let messages = await getMessages();
        res.send(messages);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/messages', async (req, res) => {
    try {
        let message = req.body;
        let savedMessage = await saveMessage(message);
        if (savedMessage) {
            io.emit('message', message);
        }

        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }    
});

app.delete('/messages', async (_req, res) => {
    try {
        await deleteAllMessages();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

async function getMessages() {
    return Message.find();
}

async function saveMessage(message) {
    let data = new Message(message);
    await data.save();

    let censored = await Message.findOne({
        message: 'badword'
    });

    if (!censored) {
        return message;
    }
    await Message.deleteOne({
        _id: censored.id
    });

    return null;
}

async function deleteAllMessages() {
    return Message.deleteMany();
}

const server = http.listen(Port, () => {
    console.log('server is listening on port ', server.address().port);
});