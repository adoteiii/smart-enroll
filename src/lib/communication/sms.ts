'use server'

import axios from "axios";

const SENDER_ID = process.env.SENDER_ID

export const sendSMS = async (to: string, message: string) => {
  const data = {
    sender: SENDER_ID,
    message: message,
    recipients: [to],
  };

  const config = {
    method: "post",
    url: "https://sms.arkesel.com/api/v2/sms/send",
    headers: {
      "api-key": process.env.ARKESEL_API_KEY||"",
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      console.log(message)
    })
    .catch(function (error) {
      console.log(error);
    });
};
