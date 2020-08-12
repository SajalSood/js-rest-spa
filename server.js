const express = require('express');
const session = require('cookie-session');
const app = express();
const PORT = 3000;

app.use(express.static('./public'));

app.use(session({
    name: 'webmart',
    keys: ['w3bt00l$', 'd3v3l0pm3nt']
}));

const store = {};

app.get('/session/', (req, res) =>  {
    if(req.session.name){
        res.status(200).json(req.session.name);
    }
    else {
        res.status(401).json({session: false, error: false});
    }
});

app.post('/session/', express.json(), (req, res) =>  {
    const username = req.body.username;
    if(isUsernameValid(username)) {
        req.session.name = username;
        res.status(200).json(req.session.name);
    }
    else {
        res.status(400).json({session: true, error: true, message: "Username is invalid. Please try again!"});
    }
});

app.delete('/session', (req, res) =>  {
    req.session = null;
    res.status(200).json(true);
});

app.get('/items/', (req, res) =>  {
    if(req.session.name) { 
       res.status(200).json(store);
    }
    else {
        res.status(401).json({session: false, error: false, message: "No session found. Please login."});
    }
});

app.post('/items/', express.json(), (req, res) =>  {
    if(req.session.name) { 
        const name = req.body.name;
        const quantity = req.body.quantity;
        const error = isItemValid({name : name, quantity: quantity});
        if(!error.err) {
            const id = nextId();
            store[id] = { "name" : name, "quantity" : quantity || 0};
            res.status(200).json(store[id]);
        }
        else {
            res.status(400).json({session: true, error: true, message: error.msg});
        }
    }
    else {
        res.status(401).json({session: false, error: false, message: "No session found. Please login."});
    }
});

app.put('/items/:itemid', express.json(), (req, res) =>  {
    if(req.session.name) { 
        const id = req.params.itemid;
        const name = req.body.name;
        const quantity = req.body.quantity;
        const error = isItemValid({id: id, name : name, quantity: quantity});
        if(!error.err) {
            store[id] = { "name" : name, "quantity" : quantity || 0};
            res.status(200).json(store[id]);
        }
        else {
            res.status(400).json({session: true, error: true, message: error.msg});
        }
    }
    else {
        res.status(401).json({session: false, error: false, message: "No session found. Please login."});
    }
});

app.delete('/items/:itemid', (req, res) =>  {
    if(req.session.name) { 
        const id = req.params.itemid;
        const error = isItemValid({id: id});
        if(!error.err) {
            const item = store[id];
            delete store[id];
            res.status(200).json(item);
        }
        else {
            res.status(400).json({session: true, error: true, message: error.msg});
        }
    }
    else {
        res.status(401).json({session: false, error: false, message: "No session found. Please login."});
    }
});

const isUsernameValid = (username) => {
    if(!username || username.indexOf(' ') >= 0 || username.includes('dog')) {
        return false;
    }
    return true;
}

const isItemValid = (item) => {
    if(item.id && item.name === "") {
        return { err: true, msg: "Invalid name of item."};
    } 
    else if(item.id && !store[item.id]) {
        return { err: true, msg: "Item does not exist"};
    }
    else if(item.quantity && (isNaN(item.quantity) || item.quantity < 0)) {
        return { err: true, msg: "Enter a valid quantity which is greater or equal to 0."};
    }
    else if(item.name) {
        for (const key in store) {
            const storeItem = store[key];
            if(item.name.toUpperCase() === storeItem.name.toUpperCase() && (item.id ? key !== item.id : true)) {
                return { err: true, msg: "Item with same name already exists."};
            }
        }
    }
    return { err: false };
}

const counter = () =>  {
    let count = 0;
    return () => {
      count += 1;
      return count;
    };
};

const nextId = counter();

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});