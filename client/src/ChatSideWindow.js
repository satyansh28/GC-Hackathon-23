import * as React from "react";
import Box from "@mui/material/Box";

import SendIcon from "@mui/icons-material/Send";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import Input from "@mui/material/Input";
import Modal from "react-bootstrap/Modal";
import useMediaQuery from "@mui/material/useMediaQuery";
import { TextField } from "@mui/material";
export default function TemporaryDrawer(props) {
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const width = isSmallScreen ? "80%" : "600px";
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: props.rightOpen,
  });
  const [message, setMessage] = React.useState("");
  const toggleDrawer = (anchor, open) => {
    console.log("toggleDrawer", anchor, open);
    return (event) => {
      console.log("toggleDrawer", anchor, open, event);
      if (
        event.type === "keydown" &&
        (event.key === "Tab" || event.key === "Shift")
      ) {
        return;
      }
      setState({ ...state, [anchor]: open });
      props.closeModal();
    };
  };
  const list = (anchor) => (
    <Box
      // sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
      style={{ padding: "10px" }}
    >
      <div style={{ width: "100%" }}>
        {props.messages.length > 0 ? (
          props.messages.map((item, index) => (
            <div key={index} style={{ textAlign: "left" }}>
              <p style={{ wordBreak: "break-all" }}>
                <b>{item.sender}</b> <div>{item.data}</div>
              </p>
            </div>
          ))
        ) : (
          <p>No message yet</p>
        )}
      </div>
      <div
        style={{
          textAlign: "center",
          position: "absolute",
          bottom: "0",
          width: "100%",
        }}
      >
        <TextField
          id="full-width-text-field"
          placeholder="Message"
          InputLabelProps={{ style: { padding: "10px" } }}
          onKeyDown={(ev) => {
            console.log(`Pressed keyCode ${ev.key}`);
            if (ev.key === "Enter") {
              ev.preventDefault();
              props.sendMessage();
              setMessage("");
            }
          }}
          helperText="Type and send message "
          margin="normal"
          onChange={(e) => {
            props.handleMessage(e);
            setMessage(e.target.value);
          }}
          value={message}
          style={{ padding: "10px", width: "90%" }}
          InputProps={{
            endAdornment: (
              <SendIcon
                onClick={() => {
                  props.sendMessage();
                  setMessage("");
                }}
                style={{ cursor: "pointer" }}
              />
            ),
          }}
        />
        {/* <Button
          variant="contained"
          style={{ textAlign: "center" }}
          color="primary"
          onClick={props.sendMessage}
        >
          Send
        </Button> */}
      </div>
    </Box>
  );
  React.useEffect(() => {
    console.log("trigger renreder");
    console.log(state, props, "im here just before toggle drawer");
    const toggleRightDrawer = toggleDrawer("right", props.rightOpen);
    if (props.rightOpen) toggleRightDrawer({ type: "click" });
  }, [props]);
  return (
    <div>
      {["right"].map((anchor) => (
        <React.Fragment key={anchor}>
          {/* <Button onClick={toggleDrawer(anchor, true)}>{anchor}</Button> */}
          <Drawer
            PaperProps={{
              sx: { width: width },
            }}
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
          >
            {list(anchor)}
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}
