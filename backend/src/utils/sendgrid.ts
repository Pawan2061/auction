import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

const msg = {
  to: "test@example.com",
  from: "22btrdc063@jainuniversity.ac.in",
  subject: "Sending with SendGrid is Fun",
  text: "and easy to do anywhere, even with Node.js",
  html: "<strong>and easy to do anywhere, even with Node.js</strong>",
};

sgMail
  .send(msg)
  .then((response) => {
    console.log(response[0].statusCode);
    console.log(response[0].headers);
  })
  .catch((error) => {
    console.error(error);
  });
