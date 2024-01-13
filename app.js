const axios = require("axios");
const FormData = require("form-data");
const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");

dotenv.config();

const DOMAIN = "olaseindebiyi.com"; //"sandbox2fadb19a097a4e738ebd007afae22154.mailgun.org";
const API_KEY = "228a9b462242c3a8d281cb365101c622-7ecaf6b5-4d86e313";

const sendMail = async (email, subject, html) => {
  const API_KEY = process.env.SG_API;
  sgMail.setApiKey(API_KEY);
  const message = {
    to: email,
    from: {
      name: "Gist APP",
      email: "info@yeve.co.uk",
    },
    text: "Hello Sample text",
    subject: subject,
    html
  };

  try {
    const response = await sgMail.send(message);
    console.log(response, 'abab');
    return response.data;
  } catch (e) {
    console.log(e, 'error');
  }
 


  // const formData = new FormData();
  // formData.append("from", "hello@gistapp.com");
  // formData.append("to", "seinde4@yahoo.com");
  // formData.append("subject", "subject");
  // formData.append("html", "<p>Hello</p>");
  // formData.append("text", "Testing");

  // try {
  //   await axios({
  //     method: "post",
  //     url: `https://api.mailgun.net/v3/${DOMAIN}/messages`,
  //     auth: {
  //       username: "api",
  //       password: API_KEY,
  //     },
  //     headers: {
  //       ...formData.getHeaders(),
  //     },
  //     data: formData,
  //   })
  //     .then((response) => {
  //       console.log("[MAILGUN] Successfully: ", response.data);
  //     })
  //     .catch((error) => {
  //       console.error("[MAILGUN] Error: ", error);
  //     });
  // } catch (e) {
  //   console.log(e);
  // }
};

sendMail(
  'seinde4@gmail.com',
  'HELLO WORLD',
  '<h1>Hello</h1>'
)
module.exports = sendMail;
