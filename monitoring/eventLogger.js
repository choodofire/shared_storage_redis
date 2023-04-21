import winston from "winston";
import fs from 'fs';
import {fileURLToPath} from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logger = (data) => winston.createLogger(
    {
        level: data?.level,
        transports: [
            new winston.transports.File({
                filename: path.join(logsDir, `${data?.level}.log`),
                level: data?.level,
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                )
            })
        ],
    });

export default function eventLogger(level, message) {
    const log = logger({ level });
    log.log({
        level,
        message,
    });
}