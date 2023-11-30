const { Expo } = require("expo-server-sdk");
let expo = new Expo();

const sendNotification = async (message, deviceToken, title) => {
  let messages = [];

  if (!Expo.isExpoPushToken(deviceToken)) {
    console.error(`Push token ${deviceToken} is not a valid Expo push token`);
  }
  messages.push({
    to: deviceToken,
    sound: "default",
    body: message,
    title: title ? title : "We have an update",
    data: { withSome: "data" },
  });
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

module.exports = sendNotification;
