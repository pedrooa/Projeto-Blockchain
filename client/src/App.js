import React, { Component } from "react";
import IPFSInboxContract from "./contracts/IPFSInbox.json";
import getWeb3 from "./getWeb3";
import truffleContract from "truffle-contract";
import ipfs from "./ipfs";
import background from "./background.png";

import "./App.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            storageValue: 0,
            web3: null,
            accounts: null,
            contract: null,
            ipfsHash: null,
            formIPFS: "",
            formAddress: "",
            receivedIPFS: ""
        };

        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleChangeIPFS = this.handleChangeIPFS.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.handleReceiveIPFS = this.handleReceiveIPFS.bind(this);
    }

    componentDidMount = async () => {
        try {
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            const Contract = truffleContract(IPFSInboxContract);
            Contract.setProvider(web3.currentProvider);
            const instance = await Contract.deployed();
            instance.inboxResponse().on("data", result => {
                this.setState({ receivedIPFS: result.args[0] });
            });

            this.setState(
                { web3, accounts, contract: instance },
                this.runExample
            );
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`
            );
            console.log(error);
        }
    };

    handleChangeAddress(event) {
        this.setState({ formAddress: event.target.value });
    }

    handleChangeIPFS(event) {
        this.setState({ formIPFS: event.target.value });
    }

    handleSend(event) {
        event.preventDefault();
        const contract = this.state.contract;
        const account = this.state.accounts[0];

        document.getElementById("new-notification-form").reset();
        this.setState({ showNotification: true });
        contract
            .sendIPFS(this.state.formAddress, this.state.formIPFS, {
                from: account
            })
            .then(result => {
                this.setState({ formAddress: "" });
                this.setState({ formIPFS: "" });
            });
    }

    handleReceiveIPFS(event) {
        event.preventDefault();
        const contract = this.state.contract;
        const account = this.state.accounts[0];
        console.log(this.state.accounts);
        contract.checkInbox({ from: account });
    }

    convertToBuffer = async reader => {
        const buffer = await Buffer.from(reader.result);
        this.setState({ buffer });
    };

    captureFile = event => {
        event.stopPropagation();
        event.preventDefault();
        const file = event.target.files[0];
        let reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => this.convertToBuffer(reader);
    };
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onIPFSSubmit = async event => {
        event.preventDefault();
        const accounts = this.state.accounts;

        console.log("Conta metamask: " + accounts[0]);

        await ipfs.add(this.state.buffer, (err, ipfsHash) => {
            console.log(err, ipfsHash);
            this.setState({ ipfsHash: ipfsHash[0].hash });
        });
    };

    render() {
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }
        return (
            <div className="App">
                <div className="flex-column ">
                    <h1>Armazenamento de evidências</h1>
                    <div className="flex-column spacing first-box">
                        <h2> 1. Subir imagem na IPFS </h2>
                        <form
                            id="ipfs-hash-form"
                            className="scep-form"
                            onSubmit={this.onIPFSSubmit}
                        >
                            <input type="file" onChange={this.captureFile} />
                            <button type="submit">Enviar</button>
                        </form>

                        <p> O Hash IPFS da imagem é: {this.state.ipfsHash}</p>
                    </div>
                    <div className="flex-row spacing first-box">
                        <div className="flex-column second-box">
                            <h2> 2. Enviar para o departamento: </h2>
                            <form
                                id="new-notification-form"
                                className="scep-form"
                                onSubmit={this.handleSend}
                            >
                                <label>
                                    Endereço Ethereum do departamento:
                                    <input
                                        type="text"
                                        value={this.state.value}
                                        onChange={this.handleChangeAddress}
                                    />
                                </label>
                                <label>
                                    Endereço IPFS:
                                    <input
                                        type="text"
                                        value={this.state.value}
                                        onChange={this.handleChangeIPFS}
                                    />
                                </label>
                                <input type="submit" value="Submit" />
                            </form>
                        </div>
                    </div>
                </div>
                <div className="flex-column spacing first-box ">
                    <h2> 3. Receber Imagens </h2>
                    <button
                        className="last-box"
                        onClick={this.handleReceiveIPFS}
                    >
                        Receber IPFS
                    </button>
                    <p>{this.state.receivedIPFS}</p>
                </div>
            </div>
        );
    }
}

export default App;
