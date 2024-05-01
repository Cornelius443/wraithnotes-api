const {logEvents} = require('./logger');
const errorHandler = (err, req, res, next)=>{
    logEvents(`${req.headers.origin}\t${req.method}\t${err.name}: ${err.message}`, 'errLog.log');
    console.log(err.stack);
    const status = res.statusCode ? res.statusCode : 500 // server error 

    res.status(status)

    res.json({ message: err.message, isError: true })
}

module.exports = errorHandler;