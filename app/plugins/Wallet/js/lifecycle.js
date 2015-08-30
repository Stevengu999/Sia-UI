'use strict';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Updating  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Make API calls, sending a channel name to listen for responses
function update() {
	IPC.sendToHost('api-call', '/wallet', 'update-status');
	/*
	IPC.sendToHost('api-call', {
		url: '/wallet/transactions',
		type: 'GET',
		args: {
			startheight: 0,
			// arbitrarily large endheight to get full history
			endheight: 1000000
		}
	}, 'update-history');
	*/
	
	updating = setTimeout(update, 2500);
}

// Update transaction history and addresses
addResultListener('update-status', function(result) {
	wallet = result;
	
	// Update balance confirmed and uncomfirmed
	var bal = convertSiacoin(wallet.confirmedsiacoinbalance);
	var pend = convertSiacoin(wallet.unconfirmedincomingsiacoins).sub(convertSiacoin(wallet.unconfirmedoutgoingsiacoins));
	eID('confirmed').innerHTML = 'Balance: ' + bal + ' S';
	eID('uncomfirmed').innerHTML = 'Pending: ' + pend + ' S';
});

/*
// Adds an address to the address list
function appendTransaction(txn) {
	if (eID(txn.transactionid)) {
		return;
	}
	var entry = eID('transactionbp').cloneNode(true);
	entry.id = txn.transactionid;

	// Determine how to display transaction
	// Have to use !== logic to represent miner payouts
	var sign, unit, amount, related;
	var ft = txn.fundtype.split(' ');
	sign = ft[1] !== 'input' ? '+' : '-';
	amount = ft[0] !== 'siafund' ? convertSiacoin(txn.value) : txn.value;
	unit = ft[0] !== 'siafund' ? ' Siacoin ' : ' Siafund ';
	related = ft[1] !== 'input' ? ' received into ' : ' sent from ';
	related += txn.relatedaddress;

	// Describe if from mining or from a transaction
	related += ft[1] === 'payout' ? ' via mining' : ' via trading ';

	// Sentence to display transaction
	var txndisplay = sign + amount + unit + related;

	// Display transaction
	entry.querySelector('.transaction').innerHTML = txndisplay;
	eID('transaction-list').appendChild(entry);
	show(entry);
}
*/

/*
// Update transaction history and addresses
addResultListener('update-history', function(result) {
	if (result.confirmedhistory) {
		result.confirmedhistory.forEach(function(processedtxn) {
			appendTransaction(processedtxn);
		});
	}

	if (result.unconfirmedhistory) {
		result.unconfirmedhistory.forEach(function(processedtxn) {
		});
	}
});
*/

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Start/Stop ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Called upon showing
function start() {
	// DEVTOOL: uncomment to bring up devtools on plugin view
	// IPC.sendToHost('devtools');
	
	// Need to check if wallet's unencrypted
	IPC.sendToHost('api-call', '/wallet', 'on-opened');
}

// First status call to diagnose the state of the wallet
addResultListener('on-opened', function(result) {
	wallet = result;

	// Show correct lock status. TODO: If the wallet is encrypted, prompt with
	// a pw.
	if (!wallet.encrypted) {
		setUnencrypted();
   	} else if (!wallet.unlocked) {
		setLocked();
	} else if (wallet.unlocked) {
		setUnlocked();
	}

	// Start updating
	update();
});

// Called upon transitioning away from this view
function stop() {
	// Stop updating
	clearTimeout(updating);
}

