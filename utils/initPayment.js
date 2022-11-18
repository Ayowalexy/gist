const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY  );


const initPaymant = async (data) => {

    const { 
        account_bank, 
        account_number, 
        narration, 
        amount } = 
        data

    try {
        const payload = {
            "account_bank": '044', 
            "account_number": '0690000032',
            "amount": Number(amount),
            "narration": narration,
            "currency": "NGN",
            "reference": "transfer-"+Date.now(),
            "callback_url": "https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d",
            "debit_currency": "NGN"
        }

        const response = await flw.Transfer.initiate(payload)
    } catch (error) {
        console.log(error)
    }

}

module.exports = initPaymant