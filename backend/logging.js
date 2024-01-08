// Log format
// unix-timestamp | type | info
// May 29, 2023 at 16:02:23 EDT | INFO | request received

// new Date().toLocaleString('en-US', {timeZone: 'America/New_York', hour12: false, dateStyle: 'short', timeStyle: 'long' })
const winston = require('winston');
const CONTAINER_ID = process.env.HOSTNAME;

const capitalize_level = winston.format(({level, ...otherstuff}) => {
    level = level.toUpperCase();
    return { level, ...otherstuff};
});

const add_readable_log = winston.format(({level,request_id,request_method,message,...otherstuff})=>{
    const human_friendly_message = `[${level}][${request_id}][${request_method}]: ${message}`;
    return {
        human_friendly_message: human_friendly_message,
        level: level,
        request_id: request_id,
        message: message,
        ...otherstuff
    };
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        capitalize_level(),
        add_readable_log(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: "/logs/"+CONTAINER_ID+".log"
        })
    ]
})

const logger_wrapper = new Proxy({}, {
    get(target, prop){
        return function(message, request, optional) {
            //console.log("request",request);
            logger[prop](message,{
                request_id: request.request_id, 
                request_method: request.method,
                container_id: CONTAINER_ID,
                ...optional
            });
        }
    }
});

module.exports = logger_wrapper;