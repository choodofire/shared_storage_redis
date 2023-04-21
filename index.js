import path from 'path';
import {fileURLToPath} from 'url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import wrapServerWithReflection from 'grpc-node-server-reflection';
import {acquireLock, releaseLock, extendLock, persistLock, pollLock, ensureLock} from './handlers/handlers.js';
import eventLogger from "./monitoring/eventLogger.js";

const PORT = process.env.PORT || 50051;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(__dirname, "./protos/shared_storage.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const lockService = grpc.loadPackageDefinition(packageDefinition).lockService;

const wrapServerWithReflection_f = wrapServerWithReflection.default;

async function bootstrap() {
    try {
        const server = wrapServerWithReflection_f(new grpc.Server());

        server.addService(lockService.LockService.service, {
            AcquireLock: acquireLock,
            ReleaseLock: releaseLock,
            ExtendLock: extendLock,
            PersistLock: persistLock,
            PollLock: pollLock,
            EnsureLock: ensureLock,
        });

        server.bindAsync(
            `0.0.0.0:${PORT}`,
            grpc.ServerCredentials.createInsecure(),
            (err, port) => {
                if (err) {
                    console.error(`Failed to start gRPC server: ${err}`);
                    eventLogger('error', {
                        message: err.message,
                        stack: err.stack,
                        caughtAt: 'start gRPC server',
                    });
                    return;
                }

                console.log(`gRPC server started on port ${port}`);
                server.start();
            }
        );

    } catch (e) {
        console.error('Server start error', e.stack);
        eventLogger('error', {
            message: e.message,
            stack: e.stack,
            caughtAt: 'grpc Client Start',
        });
    }
}

bootstrap()

