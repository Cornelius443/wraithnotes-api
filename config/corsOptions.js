// Cross-origin resource sharing (CORS) whitelist
const allowedOrigins = require('./allowedOrigins');
// CORS options
const corsOptions = {
origin: (origin, callback) =>{
    // Check if the origin is in the whitelist
    if(allowedOrigins.indexOf(origin) !== -1 || !origin){
        callback(null, true);
    }else{
         // Origin is not allowed, return a CORS error
        callback(new Error('Not allowed by CORS'))
    }
},
credentials: true,
optionsSuccessStatus: 200
}

module.exports = corsOptions;