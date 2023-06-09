import React, { Component,useRef } from "react";
import { io } from "socket.io-client";
import faker from "faker";
import axios from "axios";
import { IconButton, Badge, Input, Button } from "@material-ui/core";
import VideocamIcon from "@material-ui/icons/Videocam";
import Container from "@material-ui/core/Container";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import { experimentalStyled as styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import ChatSideWindow from "./ChatSideWindow";
import PresentToAllIcon from "@mui/icons-material/PresentToAll";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import Grid from "@mui/material/Grid";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import CallEndIcon from "@material-ui/icons/CallEnd";
import ChatIcon from "@material-ui/icons/Chat";
import ShareIcon from "@mui/icons-material/Share";
import VideoOptionButton from "./VideoOptionButton";
import { message } from "antd";
import "antd/dist/antd.css";
import AllParticipants from "./AllParticipants";
import "bootstrap/dist/css/bootstrap.css";
import "./Video.css";

const config = require("./config");
//Uncomment during production

//For development mode
const server_url = "http://localhost:4000";

//Defining free stun servers
var connections = {};
const peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};
var socket = null;
var socketId = null;
var elms = 0;
var Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

class Video extends Component {
  constructor(props) {
    super(props);

    this.localVideoref = React.createRef();

    this.videoAvailable = false;
    this.audioAvailable = false;
    this.numberOfStreams = [];
    this.participantInfoMapping = [];
    this.authorized = false;
    this.state = {
      video: false,
      audio: false,
      screen: false,
      showModal: false,
      screenAvailable: false,
      messages: [],
      message: "",
      newmessages: 0,
      askForUsername: true,
      username: faker.internet.userName(),
      fileshare_option: false,
      fileshare: false,
      record_option: false,
      numberOfStreams: [],
      participantInfoMapping: [],
      authorized: false,
      isAdmin:false,
      flip:false
    };
    connections = {};
    
    this.getPermissions();
  }
  //Get permissions to access user's camera and microphone
  
  getPermissions = async () => {
    try {
      await navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => (this.videoAvailable = true))
        .catch(() => (this.videoAvailable = false));

      await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => (this.audioAvailable = true))
        .catch(() => (this.audioAvailable = false));

      if (navigator.mediaDevices.getDisplayMedia) {
        this.setState({ screenAvailable: true });
      } else {
        this.setState({ screenAvailable: false });
      }

      if (this.videoAvailable || this.audioAvailable) {
        navigator.mediaDevices
          .getUserMedia({
            video: this.videoAvailable,
            audio: this.audioAvailable,
          })
          .then((stream) => {
            window.localStream = stream;
            this.localVideoref.current.srcObject = stream;
            const prevMapping = this.participantInfoMapping;
            prevMapping.push({
              ref: this.localVideoref,
              userName: this.state.username,
              video: this.videoAvailable,
            });
            this.setState({ participantInfoMapping: prevMapping });
          })
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    } catch (e) {
      console.log(e);
    }
  };
  componentDidUpdate(prevProps, prevState) {
    if (prevState.authorized !== this.state.authorized) {
      console.log("authorized value changed triiger rerender");
    }
    if (prevState.showModal !== this.state.showModal) {
      console.log(
        "show modal value updated",
        prevState.showModal,
        this.state.showModal
      );
    }
  }
  async componentDidMount() {
    console.log("component mounted!");
    let strintSplitArray = window.location.href.split("/");
    console.log(strintSplitArray, "string split");
    try {
      const response = await axios.post(
        `${config.REACT_APP_BACKENDURI}/joinRoom`,
        {
          roomId: strintSplitArray[4],
        },
        { withCredentials: true }
      );
      console.log(response);
      if (response.status === 200) {
        this.setState({ authorized: true,isAdmin:(response.data.isAdmin || response.data.isCreator)});

        this.getPermissions();
      } else {
        window.alert("You are not authorized to join this room");
      }
    } catch (e) {
      console.log(e);
      window.alert("You are not authorized to join this room");
      window.location.href = "/";
    }
  }

  getMedia = () => {
    this.setState(
      {
        video: this.videoAvailable,
        audio: this.audioAvailable,
      },
      () => {
        this.getUserMedia();
        this.connecttoSocketServer();
      }
    );
  };

  getUserMedia = () => {
    if (
      (this.state.video && this.videoAvailable) ||
      (this.state.audio && this.audioAvailable)
    ) {
      navigator.mediaDevices
        .getUserMedia({ video: this.state.video, audio: this.state.audio })
        .then(this.getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        console.log("audio off video off");
        let tracks = this.localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => (track.enabled = false));
      } catch (e) {}
    }
  };
  getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => (track.enabled = true));
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    this.localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketId) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e, "error was caught here4"));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          this.setState(
            {
              video: false,
              audio: false,
            },
            () => {
              try {
                let tracks = this.localVideoref.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
              } catch (e) {
                console.log(e);
              }

              let blackSilence = (...args) =>
                new MediaStream([this.black(...args), this.silence()]);
              window.localStream = blackSilence();
              this.localVideoref.current.srcObject = window.localStream;

              for (let id in connections) {
                connections[id].addStream(window.localStream);

                connections[id].createOffer().then((description) => {
                  connections[id]
                    .setLocalDescription(description)
                    .then(() => {
                      socket.emit(
                        "signal",
                        id,
                        JSON.stringify({
                          sdp: connections[id].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                });
              }
            }
          );
        })
    );
  };

  gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketId) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socket.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e, "error was caught here 3"));
                })
                .catch((e) => console.log(e, "error was caught here2"));
            }
          })
          .catch((e) => console.log(e, "errror was caught here"));
      }

      if (signal.ice) {
        if (connections[fromId])
          connections[fromId]
            .addIceCandidate(new RTCIceCandidate(signal.ice))
            .catch((e) => console.log(e));
      }
    }
  };
  //Video-Calling Functionality
  connecttoSocketServer = () => {
    socket = io(server_url, { transports: ["websocket"] });
    console.log(server_url);

    socket.on("signal", this.gotMessageFromServer);
    socket.on("admin-commanded",async(data,sockid)=>{
      if(sockid!==socket.id)
        return;
      if(data==="mute")
        this.setState({ audio: false }, () => this.getUserMedia());
      if(data==="video")
        this.setState({ video: false },() => this.getUserMedia());
      if(data==="remove")
        window.location.href="/";
    })
    socket.on("connect", () => {
      socket.emit("join-call", window.location.href);
      socketId = socket.id;

      socket.on("chat-message", this.addMessage);



      socket.on("user-left", (id) => {
        let ind=this.numberOfStreams.indexOf(id);
        if(ind!==-1)
        {
          this.numberOfStreams.splice(ind,1);
          this.setState({flip:!this.state.flip})
        }
      });

      socket.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConnectionConfig
          );
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socket.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].ontrack = (event) => {
            var searchVidep = document.querySelector(
              `[data-socket="${socketListId}"]`
            );
            if (searchVidep !== null) {
              searchVidep.srcObject = event.streams[0];
            } else {
              elms = clients.length;
              const prevNumberOfClients = this.numberOfStreams;
              const prevMapping = this.participantInfoMapping;
              prevMapping.push({
                dataSocketItem: socketListId,
                userName: this.state.username,
                video: this.videoAvailable,
              });
              prevNumberOfClients.push(socketListId);
              this.setState({ numberOfStreams: prevNumberOfClients });
              this.setState({ participantInfoMapping: prevMapping });
              console.log(this.numberOfStreams, "number of streams");
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            console.log("not found");
            let blackSilence = (...args) =>
              new MediaStream([this.black(...args), this.silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketId) {
          for (let id2 in connections) {
            if (id2 === socketId) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socket.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };
  getDislayMedia = () => {
    if (this.state.screen) {
      //if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(this.getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    //}
  };
  getDislayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    this.localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketId) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          this.setState(
            {
              screen: false,
            },
            () => {
              try {
                let tracks = this.localVideoref.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
              } catch (e) {
                console.log(e);
              }

              let blackSilence = (...args) =>
                new MediaStream([this.black(...args), this.silence()]);
              window.localStream = blackSilence();
              this.localVideoref.current.srcObject = window.localStream;

              this.getUserMedia();
            }
          );
        })
    );
  };

  //Functions executed after clicking on the buttons
  handleCloseModal = () => this.setState({ showModal: false });
  handleVideo = () =>
    this.setState({ video: !this.state.video }, () => this.getUserMedia());
  handleAudio = () =>
    this.setState({ audio: !this.state.audio }, () => this.getUserMedia());
  handleScreen = () =>
    this.setState({ screen: !this.state.screen }, () => this.getDislayMedia());
  //End-call Functionality
  handleEndCall = () => {
    try {
      let tracks = this.localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  //Chat Functionality
  openChat = () => {
    console.log("open chat function called");
    this.setState({ showModal: true, newmessages: 0 });
  };
  closeChat = () => this.setState({ showModal: false });
  handleMessage = (e) => this.setState({ message: e.target.value });

  addMessage = (data, sender, socketIdSender) => {
    this.setState((prevState) => ({
      messages: [...prevState.messages, { sender: sender, data: data }],
    }));
    if (socketIdSender !== socketId) {
      this.setState({ newmessages: this.state.newmessages + 1 });
    }
  };

  handleUsername = (e) => this.setState({ username: e.target.value });

  adminfunc= (data,sockid)=>{
    socket.emit("change-other",data,sockid);
  }

  sendMessage = () => {
    socket.emit("chat-message", this.state.message, this.state.username);
    this.setState({ message: "", sender: this.state.username });
  };
  //Copy URL to send invite links.
  copyUrl = () => {
    let text = window.location.href;
    if (!navigator.clipboard) {
      let textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        message.success("Link copied to clipboard!");
      } catch (err) {
        message.error("Failed to copy");
      }
      document.body.removeChild(textArea);
      return;
    }
    navigator.clipboard.writeText(text).then(
      function () {
        message.success("Link copied to clipboard!");
      },
      () => {
        message.error("Failed to copy");
      }
    );
  };

  connect = () =>
    this.setState({ askForUsername: false }, () => this.getMedia());

  //Compatibility checking
  isChrome = function () {
    let userAgent = (navigator && (navigator.userAgent || "")).toLowerCase();
    let vendor = (navigator && (navigator.vendor || "")).toLowerCase();
    let matchChrome = /google inc/.test(vendor)
      ? userAgent.match(/(?:chrome|crios)\/(\d+)/)
      : null;
    // let matchFirefox = userAgent.match(/(?:firefox|fxios)\/(\d+)/)
    // return matchChrome !== null || matchFirefox !== null
    return matchChrome !== null;
  };



  render() {
   
    if (this.state.authorized === false) {
      return <div>Loading</div>;
    }
    return (
      <div>
        {this.state.askForUsername === true ? (
          <div>
            <div
              style={{
                background: "white",
                width: "30%",
                height: "auto",
                padding: "20px",
                minWidth: "400px",
                textAlign: "center",
                margin: "auto",
                marginTop: "50px",
                justifyContent: "center",
              }}
            >
              <p
                style={{ margin: 0, fontWeight: "bold", paddingRight: "50px" }}
              >
                Set your username
              </p>
              <Input
                placeholder="Username"
                value={this.state.username}
                onChange={(e) => this.handleUsername(e)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={this.connect}
                style={{ margin: "20px" }}
              >
                Connect
              </Button>
            </div>

            <div
              style={{
                justifyContent: "center",
                textAlign: "center",
                paddingTop: "30px",
              }}
            >
              {/*governs the user name selection video output*/}
              <video
                id="my-video"
                ref={this.localVideoref}
                autoPlay
                muted
                style={{
                  borderRadius: "50px",
                  objectFit: "fill",
                  width: "50%",
                  height: "5%",
                }}
              ></video>
            </div>
          </div>
        ) : (
          <div>
            <div
              className="btn-down"
              style={{
                backgroundColor: "whitesmoke",
                color: "whitesmoke",
                textAlign: "center",
              }}
            >
              <IconButton
                style={{ color: "#424242" }}
                onClick={this.handleVideo}
              >
                {this.state.video === true ? (
                  <VideocamIcon />
                ) : (
                  <VideocamOffIcon />
                )}
              </IconButton>

              <IconButton
                style={{ color: "#f44336" }}
                onClick={this.handleEndCall}
              >
                <CallEndIcon />
              </IconButton>

              <IconButton
                style={{ color: "#424242" }}
                onClick={this.handleAudio}
              >
                {this.state.audio === true ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              {this.state.screenAvailable === true ? (
                <IconButton
                  style={{ color: "#424242" }}
                  onClick={this.handleScreen}
                >
                  {this.state.screen === true ? (
                    <CancelPresentationIcon />
                  ) : (
                    <PresentToAllIcon />
                  )}
                </IconButton>
              ) : null}

              <Badge
                badgeContent={this.state.newmessages}
                max={999}
                color="secondary"
                onClick={this.openChat}
              >
                <IconButton
                  style={{ color: "#424242" }}
                  onClick={this.openChat}
                >
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>
            {console.log(this.state.showModal, "this state modal")}
            <ChatSideWindow
              rightOpen={this.state.showModal}
              messages={this.state.messages}
              handleMessage={this.handleMessage}
              sendMessage={this.sendMessage}
              closeModal={this.handleCloseModal}
            />
            <div className="container">
              <div
                style={{
                  paddingTop: "10px",
                  marginBottom: "20px",
                }}
              >
                {/* <Input value={window.location.href} disable="true"></Input> */}
                <Button
                  size="small"
                  style={{
                    backgroundColor: "#3f51b5",
                    color: "whitesmoke",
                    marginLeft: "20px",
                    marginTop: "5px",
                  }}
                  onClick={this.copyUrl}
                  endIcon={<ShareIcon />}
                >
                  Copy invite link
                </Button>
              </div>

              <Container
                style={{ textAlign: "center" }}
                component="section"
                maxWidth="100%"
              >
                <Grid
                  container
                  rowSpacing={1}
                  alignItems="center"
                  justifyContent="space-evenly"
                >
                  <Grid
                    item
                    xs={12}
                    md={6}
                    style={{
                      maxWidth: "550px",
                    }}
                  >
                    <video
                      ref={this.localVideoref}
                      style={{
                     
                        width: "550px",
                        border: "2px blue solid",
                        borderRadius: "10px",
                      }}
                      autoPlay
                      muted
                    ></video>
                  </Grid>
                  {this.numberOfStreams.map((item) => {
                    return (
                      <Grid item xs={12} md={6} style={{ maxWidth: "550px" }}>
                        {this.state.isAdmin && <VideoOptionButton
                          style={{left:"10px"}}
                          sockid={item}
                          handleAdmin={(data,sockid) => {
                            this.adminfunc(data,sockid);
                          }}
                        />}
                        <video
                          data-socket={item}
                          id="my-video"
                          autoPlay="true"
                          playsInline="true"
                          style={{
                            border: "2px red solid",
                            width: "550px",
                            borderRadius: "10px",
                          }}
                        ></video>
                        {console.log(
                          this.state.participantInfoMapping,
                          this.localVideoref.current.getAttribute("srcObject")
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
                {/* <AllParticipants participantKey={this.participantInfoMapping} /> */}
              </Container>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Video;
