import cron from "node-cron";
import moment from "moment-timezone";
import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/test");

const Clients = mongoose.model("Client", {
  name: String,
  tz: String,
  email: String,
});

cron.schedule("*/30 * * * *", async () => {
  const targetTime = "08:00";

  const currentTzs = getCurrentTZs(targetTime);
  const selectedClients = getTzSelectedClients(currentTzs);
  try {
    (await selectedClients).forEach(({ name, email }) =>
      sendNotification(name, email)
    );
  } catch (e) {
    console.log("error", e);
  }
});

export const getCurrentTZs = (targetTime) => {
  const tzList = moment.tz.names();
  const selectedTz = tzList.filter((tz) => isTime(tz, targetTime));
  return selectedTz;
};

function isTime(zone, time) {
  const currentTime = moment();
  const targetTime = currentTime.tz(zone).format("HH:mm");
  return targetTime === time;
}

async function getTzSelectedClients(selectedTZ) {
  // make a query to mongo db
  const clients = await Clients.find({
    tz: { $in: selectedTZ },
  });

  return clients;
}

function sendNotification(name, email) {
  // Need to send the following message to an email
  console.log(`Good morning, ${name}.`);
}
