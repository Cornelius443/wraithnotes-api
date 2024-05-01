require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3500;
const {logger, logEvents} = require('./middleware/logger');
const errorHandler = require('./middleware/errorLog');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const mongoose = require('mongoose'); 
const connectDB = require('./config/dbConn');


// connect to MongoDb
connectDB();
// custom middleware logger
app.use(logger);
app.use(cors(corsOptions));
// built in middleware for json
app.use(express.json());
app.use(cookieParser());
app.use('/',express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/notes', require('./routes/noteRoutes'));
// 404
app.all('*',(req, res)=>{
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }else if(res.accepts('json')){
        res.json({error: "404 not found"});
    }else{
        res.type('txt').send('404 not found');
    }
    
});

// logging errors
app.use(errorHandler);

// starting server
mongoose.connection.once('open', ()=>{
    console.log('Connected to MongoDB');
    app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
})

mongoose.connection.on('error', err=>{
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.message}`, 'mongoErrLog.log');
})

  