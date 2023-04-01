import React, { useEffect, useRef } from "react";
import "./AllParticipants.css";
import { Participant } from "./Participant";

const Participants = (props) => {
  const { participantKey } = props;
    console.log(participantKey, "participantKey");
  let gridCol =
    participantKey.length === 1 ? 1 : participantKey.length <= 4 ? 2 : 4;
  const gridColSize = participantKey.length <= 4 ? 1 : 2;
  let gridRowSize =
    participantKey.length <= 4
      ? participantKey.length
      : Math.ceil(participantKey.length / 2);

  const element = 1;
  const screenPresenter = false;
//   participantKey.find((element) => {
//     const currentParticipant = props.participants[element];
//     return currentParticipant.screen;
//   });

  if (screenPresenter) {
    gridCol = 1;
    gridRowSize = 2;
  }
  return (
    <div
      style={{
        "--grid-size": gridCol,
        "--grid-col-size": gridColSize,
        "--grid-row-size": gridRowSize,
      }}
      className={`participants`}
    >
      {participantKey.map((item, index) => {
        if (1) {
          return (
            <Participant
              dataSocketItem={item.dataSocketItem}
              userName={item.userName}
              video={item.video}
              currentIndex={index}
            />
          );
        } else
          return (
            <Participant
              ref={item.ref}
              userName={item.userName}
              video={item.video}
              currentIndex={index}
            />
          );
      })}
    </div>
  );
};

export default Participants;
