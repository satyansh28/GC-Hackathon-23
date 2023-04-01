import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import axios from "axios";
import { Stack } from "@mui/material";
import DropDown from "./DropDownPeople";
const { v4: uuidV4 } = require("uuid");
const config = require("../../config");
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    backgroundColor: "white",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),

    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "300px",
    },
    "& .MuiButtonBase-root": {
      margin: theme.spacing(2),
    },
  },
}));

const Form = ({ handleClose, handleClose2 }) => {
  const classes = useStyles();
  // create state variables for each input
  const [typeOfMeet, settypeOfMeet] = useState("all");
  const [uuid, setUUID] = useState(uuidV4());
  const handleAllowAllEmail = async () => {
    const result = await axios.post(
      `${config.REACT_APP_BACKENDURI}/createRoom`,
      {
        roomId: uuid,
        allowAll: true,
      },
      { withCredentials: true }
    );
    if (result.status == 200) {
      window.location.href = `/call/${uuid}`;
    } else {
      window.alert("Something went wrong");
    }
  };
  return (
    <div>
      <Stack spacing={3}>
        <Button
          color="primary"
          variant="contained"
          onClick={(e) => {
            e.preventDefault();
            settypeOfMeet("all");
            handleAllowAllEmail();
          }}
        >
          Anyone can join?
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            settypeOfMeet("select");
          }}
        >
          Choose who can join
        </Button>
        {typeOfMeet === "select" && <DropDown roomId={uuid} />}
      </Stack>
    </div>
  );
};

export default Form;
