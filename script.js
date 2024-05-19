document.addEventListener('DOMContentLoaded', async () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const contractAddress = '0x57B29f18e76460293294564e7E81e84da89b2028'; // Dirección del contrato desplegado
        const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ClaimDividends","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawal","type":"event"},{"inputs":[],"name":"ceoAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"dividendsStarted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"firstDepositTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserAvailableDividends","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDividendsPaymentTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDeposits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasuryPool","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"userAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"deposits","type":"uint256"},{"internalType":"uint256","name":"withdrawn","type":"uint256"},{"internalType":"uint256","name":"dividends","type":"uint256"},{"internalType":"uint256","name":"dividendsClaimed","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const accounts = await web3.eth.getAccounts();
        const userAccount = accounts[0];

        updateStats();

        document.getElementById('deposit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = document.getElementById('deposit-amount').value;
            await contract.methods.deposit().send({ from: userAccount, value: web3.utils.toWei(amount, 'ether') });
            updateStats();
            document.getElementById('deposit-amount').value = '';
        });

        document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = document.getElementById('withdraw-amount').value;
            await contract.methods.withdraw(web3.utils.toWei(amount, 'ether')).send({ from: userAccount });
            updateStats();
            document.getElementById('withdraw-amount').value = '';
        });

        document.getElementById('claim-dividends').addEventListener('click', async () => {
            await contract.methods.claimDividends().send({ from: userAccount });
            updateStats();
        });

        async function updateStats() {
            const totalDeposits = await contract.methods.totalDeposits().call();
            const totalTreasuryPool = await contract.methods.totalTreasuryPool().call();
            const totalDividendsPool = await contract.methods.totalDividendsPool().call();
            const lastDividendsPaymentTime = await contract.methods.lastDividendsPaymentTime().call();
            const contractBalance = await contract.methods.getContractBalance().call();

            const user = await contract.methods.users(userAccount).call();
            const userDeposits = user.deposits;
            const userWithdrawals = user.withdrawn;
            const userDividendsToday = await contract.methods.getUserAvailableDividends(userAccount).call();
            const userTotalDividends = user.dividendsClaimed;

            const userCurrentDeposit = parseInt(userDeposits) - parseInt(userWithdrawals);

            document.getElementById('user-address').innerText = userAccount;
            document.getElementById('total-deposits').innerText = web3.utils.fromWei(totalDeposits, 'ether');
            document.getElementById('total-treasury-pool').innerText = web3.utils.fromWei(totalTreasuryPool, 'ether');
            document.getElementById('total-dividends-pool').innerText = web3.utils.fromWei(totalDividendsPool, 'ether');
            document.getElementById('last-dividends-payment-time').innerText = new Date(lastDividendsPaymentTime * 1000).toLocaleString();
            document.getElementById('contract-balance').innerText = web3.utils.fromWei(contractBalance, 'ether');
            document.getElementById('user-deposits').innerText = web3.utils.fromWei(userDeposits, 'ether');
            document.getElementById('user-withdrawals').innerText = web3.utils.fromWei(userWithdrawals, 'ether');
            document.getElementById('user-dividends-today').innerText = web3.utils.fromWei(userDividendsToday, 'ether');
            document.getElementById('user-current-deposit').innerText = web3.utils.fromWei(userCurrentDeposit.toString(), 'ether');
            document.getElementById('user-total-dividends').innerText = web3.utils.fromWei(userTotalDividends, 'ether');
        }
    } else {
        alert('Por favor, instala MetaMask para utilizar esta aplicación.');
    }
});

function calcularTiempoRestanteParaPago() {
    const ahora = new Date();
    const horaActualUTC = ahora.getUTCHours();
    const minutosActualesUTC = ahora.getUTCMinutes();
    const segundosActualesUTC = ahora.getUTCSeconds();
    
    let horasRestantes = 20 - horaActualUTC;
    let minutosRestantes = 0;
    let segundosRestantes = 0;

    if (horaActualUTC >= 20) {
        horasRestantes = 24 - (horaActualUTC - 20);
    }

    if (minutosActualesUTC > 0 || segundosActualesUTC > 0) {
        horasRestantes--;
        minutosRestantes = 60 - minutosActualesUTC;
        segundosRestantes = 60 - segundosActualesUTC;
    }

    return {
        horas: horasRestantes,
        minutos: minutosRestantes,
        segundos: segundosRestantes
    };
}

function actualizarContador() {
    const contador = document.getElementById('countdown-timer');
    const tiempoRestante = calcularTiempoRestanteParaPago();
    contador.textContent = `${tiempoRestante.horas}h ${tiempoRestante.minutos}m ${tiempoRestante.segundos}s`;
}

function inicializarContador() {
    setInterval(actualizarContador, 1000);
}

inicializarContador();
