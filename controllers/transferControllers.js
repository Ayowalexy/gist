const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Hire = require("../models/hireModel");
const axios = require("axios");
const Transaction = require("../models/transactionModel");
const Notification = require("../models/notificationModel");
const {
  bankAccountSchema,
  handyManPayment,
} = require("../middleswares/schema");
const Flutterwave = require("flutterwave-node-v3");
const Bank = require("../models/bankAccountModel");
const currencyFormatter = require("currency-formatter");
const initPaymant = require("../utils/initPayment");
const crypto = require("crypto");
const { getAdminFee, CHARGE_PERCENT } = require("../constants/pricing");
// const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

const PAYSTACK_SK = process.env.PAYSTACK_SK;

const getAllBanks = asyncHandler(async (req, res) => {
  const response = await axios(`${process.env.BASE_API_URL}/banks/NG`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    },
  });

  res.status(200).json(response.data);
});

const verifyBankAccount = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const { error, value } = bankAccountSchema.validate(req.body);
  if (error) {
    return res.status(401).json({
      status: "error",
      message: "invalid request",
      meta: {
        error: error.message,
      },
    });
  }

  const user = await User.findById({ _id });

  if (user) {
    try {
      const { account_number, account_bank } = value;
      const url = `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${account_bank}`;
      const response = await axios(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SK}`,
        },
      });
      if (response.data.status) {
        // const bank = new Bank(value);
        // await bank.save();
        // user.bank = bank;
        // await user.save();
        res.status(200).json(response.data);
      }
    } catch (e) {
      res.status(401).json({
        status: "error",
        message: "invalid request",
        meta: {
          error:
            e?.response?.data?.message ||
            "Could not resolve account name. Check parameters or try again.",
        },
      });
    }
  }
});

const payForHandyManHire = asyncHandler(async (req, res) => {
  const { error, value } = handyManPayment.validate(req.body);
  if (error) {
    return res.status(401).json({
      status: "error",
      message: "invalid request",
      meta: {
        error: error.message,
      },
    });
  }

  const hire = await Hire.findById({ _id: value.hireId });

  if (hire && hire.status !== "canceled") {
    const handyMan = await User.findById({ _id: hire.handyManId }).populate(
      "bank"
    );
    const client = await User.findById({ _id: hire.clientId });

    const partPayment = hire.partPayment;
    const totalAmount = hire.totalAmount;
    const balance = totalAmount - partPayment;

    if (value.amount <= balance) {
      hire.partPayment = Number(partPayment) + Number(value.amount);
      hire.isPaid = true;
      hire.status = "in progress";
      hire.hoursPaid = hire.workingHours / 2;

      const formatPartPayment = currencyFormatter.format(partPayment, {
        code: "NGN",
      });
      const formatBalance = currencyFormatter.format(balance, { code: "NGN" });

      const { account_bank, account_number } = handyMan?.bank;
      const { narration, amount } = value;

      const data = { account_bank, account_number, narration, amount };

      if (account_bank && account_number && narration && amount) {
        const paymentHandyMan = await initPaymant(data);
        // const clientNotification = new Notification({
        //     type: 'payment',
        //     title: `You just paid ${formatPartPayment} to ${handyMan.firstName.concat(' ', handyMan.lastName)}
        //             for ${hire.jobTitle}, to balance ${formatBalance}`
        // })

        // const handyManNotification = new Notification({
        //     type: 'payment',
        //     title: `${client.firstName.concat(' ', client.lastName)} just paid you ${formatPartPayment}
        //             for ${hire.jobTitle}, to balance ${formatBalance}`
        // })

        // const amountPaid = (Number(partPayment) + Number(value.amount));
        // const formatAmountPaid = currencyFormatter.format(amountPaid, { code: 'NGN' });

        // if (amountPaid === totalAmount) {
        //     hire.isPaidFully = true;
        //     hire.status = 'completed';
        //     clientNotification.title = `You have successfully completed the payment of ${formatAmountPaid}
        //                                 for the service ${hire.jobTitle} to ${handyMan.firstName.concat(' ', handyMan.lastName)}`

        //     handyManNotification.title = `You have been completely paid ${formatAmountPaid}
        //                                 for the service ${hire.jobTitle}`
        // }

        // await hire.save();
        // await clientNotification.save();
        // await handyManNotification.save();
        // client.notifications.push(clientNotification);
        // handyMan.notifications.push(handyManNotification);
        // await client.save();
        // await handyMan.save();

        // const data = {
        //     jobDescription: hire.jobDescription,
        //     jobTitle: hire.jobTitle,
        //     workingHours: hire.workingHours,
        //     chargePerHour: hire.chargePerHour,
        //     totalAmount: hire.totalAmount,
        //     partPayment: hire.partPayment,
        //     handyManId: hire.handyManId,
        //     clientId: hire.clientId,
        //     txtRef: hire.txtRef,
        //     isPaidFully: hire.isPaidFully,
        //     isPaid: hire.isPaid
        // }

        res.status(200).json({
          status: "success",
          data: "data",
          meta: {},
        });
      } else {
        res.status(401).json({
          status: "error",
          message: "invalid request",
          meta: {
            error: `${handyMan.firstName.concat(
              " ",
              handyMan.lastName
            )} has not added a bank account to receive payments`,
          },
        });
      }
    } else {
      res.status(401).json({
        status: "error",
        message: "invalid request",
        meta: {
          error:
            "This service is either completely paid for, is canceled or you are trying to pay more than the service amount",
        },
      });
    }
  }
});

const webhook = asyncHandler(async (req, res) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SK)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash === req.headers["x-paystack-signature"]) {
    const data = req.body;
    const amount = data?.data?.amount;
    // const authorization = data.data.authorization;
    const reference = data?.data?.reference;

    //card charge
    if (data?.event === "charge.success") {
      const email = data.data.customer.email;
      const type = data.data.source.entry_point;
      const user = await User.findOne({ email });

      const notification = new Notification({
        type: "payment",
        title: `You successfully funded your account with ${currencyFormatter.format(
          amount / 100,
          { code: "NGN" }
        )}`,
      });

      await notification.save();
      user.accountBalance = user.accountBalance + amount / 100;
      user.notifications.push(notification);
      await user.save();
    } else if (data?.event === "transfer.success") {
      const ref_id = Array.isArray(reference?.split("_"))
        ? reference?.split("_")[2]
        : "";
      const transaction = await Transaction.findById({ _id: ref_id }).populate(
        "user"
      );
      if (transaction) {
        const user = transaction.user;
        user.total_balance = user.total_balance - amount;
        user.accountBalance = user.accountBalance - amount;
        user.total_withdrawal = user.total_withdrawal + amount;
        transaction.verified = true;
        await user.save();
        await transaction.save();
      }
    }
  }

  res.sendStatus(200);
});

const addBankAccount = asyncHandler(async (req, res) => {
  try {
    const data = {
      type: "nuban",
      name: req.body.account_name,
      account_number: req.body.account_number,
      bank_code: req.body.account_bank,
      currency: "NGN",
    };
    const recipient_resp = await axios(
      "https://api.paystack.co/transferrecipient",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SK}`,
        },
        data: data,
      }
    );

    if (
      recipient_resp.data?.status &&
      recipient_resp.data?.data?.hasOwnProperty("recipient_code")
    ) {
      const bank = new Bank({
        ...req.body,
        recipient_code: recipient_resp.data?.data?.recipient_code,
      });

      await bank.save();
      const user = await User.findById(req.params.id);
      user.bank = bank;
      await user.save();
      res.status(200).json({
        status: "success",
        data: "Added successfully",
        meta: {},
      });
    }
  } catch (e) {
    console.log(e);
    throw Error("An error occured");
  }
});

const payHandyman = asyncHandler(async (req, res) => {
  const hire = await Hire.findById(req.body.hireId);
  const user = await User.findById(req.user.id);
  const handyMan = await User.findById(req.body.handyManId);

  if (Number(req.body.amount) > Number(user.accountBalance)) {
    res.status(401).json({
      status: "error",
      message: "invalid request",
      meta: {
        error: "Insufficient balance",
      },
    });
  } else {
    const amountHandyManPaid = Math.floor(
      Number(req.body.amount) -
        getAdminFee(Number(req.body.amount), CHARGE_PERCENT)
    );
    console.log(amountHandyManPaid, 'amountHandyManPaid', getAdminFee(Number(req.body.amount), CHARGE_PERCENT))
    user.accountBalance = Number(user.accountBalance) - Number(req.body.amount);
    hire.status = "completed";
    handyMan.canUserWithdraw = true;
    handyMan.accountBalance =
      Number(handyMan.accountBalance) + amountHandyManPaid;

    await handyMan.save();
    await user.save();
    await hire.save();
    res.status(200).json({
      status: "success",
      data: "Account funded",
      meta: {},
    });
  }
});

const withdraw = asyncHandler(async (req, res) => {
  const user = await User.findById({ _id: req.user._id }).populate("bank");

  if (user.canUserWithdraw) {
    const transaction = new Transaction({
      amount: req.body.amount,
      user: user,
    });
    if (user.accountBalance < Number(req.body.amount)) {
      throw new Error("You don't have upto this amount in your account");
    }
    const ref = `${user.firstName}_${user.lastName}_${transaction._id}`;
    transaction.reference = ref;
    await transaction.save();

    const data = {
      source: "balance",
      reason: "handy man withdraw",
      amount: Number(req.body.amount),
      reference: ref,
      recipient: user.bank.recipient_code,
      account_number: user.bank.account_number,
      bank_code: user.bank.account_bank,
    };

    const recipient_resp = await axios("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SK}`,
      },
      data: data,
    });

    res.status(200).json({
      status: "success",
      data: "Withdraw has been queued",
      meta: {},
    });
  } else {
    throw new Error(
      "You currently cannot withdraw as you have pending service"
    );
  }
});

module.exports = {
  getAllBanks,
  verifyBankAccount,
  payForHandyManHire,
  webhook,
  addBankAccount,
  payHandyman,
  withdraw,
};
