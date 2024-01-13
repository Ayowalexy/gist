const sendMail = require("../app");

const sendHandyManPaymentEmail = async (
  email,
  amount,
  service,
  name,
  client
) => {
  await sendMail(
    email,
    `YOUR PART PAYMENT FOR ${service} HAS BEEN PAID`,
    `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Gist</a>
                        </div>
                        <p style="font-size:1.1em">Hi ${name},</p> <br />
                        <p>
                        Trust this finds you well. A total amount of ${amount} has been paid into your account by ${client} for your serice - ${service} which you
                         are due to start right away. Be informed, you won't be able to withdraw the money until the service is complete.
                        </p>
                        <p style="font-size:0.9em;">Regards,<br />Gist</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                        <p>Gist Inc</p>
                        <p>1600 Amphitheatre Parkway</p>
                        <p>Lagos, Nigeria</p>
                        </div>
                    </div>
                    </div>`
  );
};

module.exports = sendHandyManPaymentEmail;
