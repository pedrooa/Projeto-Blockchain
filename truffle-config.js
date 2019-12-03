const path = require("path");

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    contracts_build_directory: path.join(__dirname, "client/src/contracts"),
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*" // Match any network id
        },
        develop: {
            port: 8545
        }
    },
    // test: {
    //     host: "127.0.0.1",
    //     port: 7545,
    //     network_id: "*" // Match any network id
    // },
    compilers: {
        solc: {
            version: "^0.4.23" // A version or constraint - Ex. "^0.5.0"
            // Can also be set to "native" to use a native solc
        }
    }
};
