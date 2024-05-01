const {format} = require('date-fns');
const {v4: uuid} = require('uuid');
const fsPromises = require('fs').promises;
const path = require('path');


const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}`;
    console.log(logItem);
    try {
        const logDir = path.join(__dirname,  'logs');
        const logFilePath = path.join(logDir,  logName);
        await fsPromises.mkdir(logDir, { recursive: true }); // Create the log directory recursively if it doesn't exist
        await fsPromises.appendFile(logFilePath, logItem + '\n'); // Append the log item to the eventLog.txt file
    }catch(e){
        console.log(e);
    }
}

const logger = (req, res, next)=>{
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.log');
    next();
}

module.exports = {logger, logEvents};