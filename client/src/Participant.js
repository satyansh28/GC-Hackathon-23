import React from "react";
import Card from "./Card";
// import { faMicrophoneSlash } from "fontawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "fontawesome/react-fontawesome";
import "./Participant.css";

export const Participant = (props) => {
  const { ref, dataSocketItem, userName, video, currentIndex } = props;
  console.log(props,"props")
  return (
    <div className={`participant ${video ? "hide" : ""}`}>
      <Card>
        {ref !== null && ref !== undefined ? (
          <video
            data-socket={dataSocketItem}
            ref={ref}
            className="video"
            id={`participantVideo${currentIndex}`}
            autoPlay
            playsInline
          ></video>
        ) : (
          <video
            data-socket={dataSocketItem}
            className="video"
            id={`participantVideo${currentIndex}`}
            autoPlay
            playsInline
          ></video>
        )}{" "}
        {/* {!currentParticipant.audio && (
          <FontAwesomeIcon
            className="muted"
            icon={faMicrophoneSlash}
            title="Muted"
          />
        )} */}
        {!video && (
          <div style={{ backgroundColor: "blue" }} className="avatar">
            {userName[0]}
          </div>
        )}
        <div className="name">{userName}</div>
      </Card>
    </div>
  );
};
