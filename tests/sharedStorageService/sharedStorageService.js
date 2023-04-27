const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const HOST = process.env.SHARED_STORAGE_HOST || "0.0.0.0:";
const PORT = process.env.SHARED_STORAGE_PORT || 50051;

const PROTO_PATH = path.resolve(__dirname, "../../protos/locker.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const sharedStorageService =
  grpc.loadPackageDefinition(packageDefinition).lockService;

function get_client() {
  return new sharedStorageService.LockService(
    HOST + PORT,
    grpc.credentials.createInsecure()
  );
}

module.exports = { sharedStorageService, get_client };
