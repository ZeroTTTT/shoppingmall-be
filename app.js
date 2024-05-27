const express = require('express');
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json()); // req.body가 객체로 인식이 된다.
app.use('/api', indexRouter);

// const mongoURL = process.env.LOCAL_DB_ADDRESS;
const mongoURL = process.env.MONGODB_URI_PROD;

mongoose    
    .connect(mongoURL)    
    .then(()=>{
        console.log('mongoose connected');
    }).catch((err)=> {
        console.log('DB connection fail', err);
    });

    app.listen(process.env.PORT || 5000, ()=>{
        console.log('server on 5000');
    });