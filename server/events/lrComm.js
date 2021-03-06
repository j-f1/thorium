import App from "../app";
import { pubsub } from "../helpers/subscriptionManager.js";
import uuid from "uuid";

//Creating a new long range message
App.on(
  "sendLongRangeMessage",
  ({ id, simulatorId, message, crew, decoded, sender }) => {
    let system;
    if (id) {
      system = App.systems.find(s => s.id === id);
    }
    if (simulatorId) {
      system = App.systems.find(
        s => s.simulatorId === simulatorId && s.type === "LongRangeComm"
      );
    }
    const simulator = App.simulators.find(s => s.id === system.simulatorId);
    system &&
      system.createMessage(
        message.replace(/#SIM/gi, simulator.name),
        crew,
        decoded,
        sender
      );

    pubsub.publish(
      "longRangeCommunicationsUpdate",
      App.systems.filter(s => s.type === "LongRangeComm")
    );
  }
);
//Queued messages are sent
App.on("longRangeMessageSend", ({ id, message }) => {
  const sys = App.systems.find(s => s.id === id);
  sys.sendMessage(message);
  pubsub.publish("notify", {
    id: uuid.v4(),
    simulatorId: sys.simulatorId,
    station: "Core",
    title: `New Long Range Message`,
    body: ``,
    color: "info"
  });
  App.handleEvent(
    {
      simulatorId: sys.simulatorId,
      component: "LRCommCore",
      title: `New Long Range Message`,
      body: ``,
      color: "info"
    },
    "addCoreFeed"
  );
  pubsub.publish(
    "longRangeCommunicationsUpdate",
    App.systems.filter(s => s.type === "LongRangeComm")
  );
});
App.on("deleteLongRangeMessage", ({ id, message }) => {
  App.systems.find(s => s.id === id).deleteMessage(message);
  pubsub.publish(
    "longRangeCommunicationsUpdate",
    App.systems.filter(s => s.type === "LongRangeComm")
  );
});
App.on(
  "updateLongRangeDecodedMessage",
  ({ id, messageId, decodedMessage, a, f }) => {
    App.systems
      .find(s => s.id === id)
      .updateDecodedMessage(id, messageId, decodedMessage, a, f);
    pubsub.publish(
      "longRangeCommunicationsUpdate",
      App.systems.filter(s => s.type === "LongRangeComm")
    );
  }
);
App.on("updateLongRangeComm", ({ longRangeComm }) => {
  const lr = App.systems.find(s => s.id === longRangeComm.id);
  lr.update(longRangeComm);
  if (longRangeComm.locked) {
    pubsub.publish("notify", {
      id: uuid.v4(),
      simulatorId: lr.simulatorId,
      station: "Core",
      title: `Interception Signal Locked`,
      body: ``,
      color: "info"
    });
    App.handleEvent(
      {
        simulatorId: lr.simulatorId,
        title: `Interception Signal Locked`,
        body: null,
        color: "info"
      },
      "addCoreFeed"
    );
  }
  pubsub.publish(
    "longRangeCommunicationsUpdate",
    App.systems.filter(s => s.type === "LongRangeComm")
  );
});
