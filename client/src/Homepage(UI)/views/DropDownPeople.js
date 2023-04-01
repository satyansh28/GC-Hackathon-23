import * as React from "react";

import { Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import axios from "axios";
import { TextField } from "@mui/material";
import Button from "@material-ui/core/Button";
const { v4: uuidV4 } = require("uuid");
const config = require("../../config");
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function MultipleSelect(props) {
  const theme = useTheme();
  const [email, setEmail] = React.useState([]);
  const [currentEmail, setCurrentEmail] = React.useState("");
  const [bkl, setbkl] = React.useState(false);
  React.useEffect(() => {
    console.log("re render here");
  }, [email, bkl]);
  const handleEmailList = async () => {
    const result = await axios.post(
      `${config.REACT_APP_BACKENDURI}/createRoom`,
      {
        roomId: props.roomId,
        allowAll: false,
        allowedEmails: email,
      },
      { withCredentials: true }
    );
    if (result.status == 200) {
      window.location.href = `/call/${props.roomId}`;
    } else {
      window.alert("Something went wrong");
    }
  };
  return (
    <Stack spacing={3}>
      <TextField
        id="outlined-multiline-flexible"
        label="Input Email id to allow"
        multiline
        maxRows={4}
        value={currentEmail}
        onChange={(e) => {
          e.preventDefault();
          setCurrentEmail(e.target.value);
        }}
      />
      <Button
        variant="contained"
        fullWidth={"full"}
        color="primary"
        onClick={(e) => {
          e.preventDefault();
          const prevEmail = email;
          prevEmail.push(currentEmail);
          setEmail(prevEmail);
          setCurrentEmail("");
        }}
      >
        Submit Email id
      </Button>

      {console.log(email)}
      <List>
        {email.map((emailx, index) => {
          return (
            <ListItem
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log(index);
                    const prevEmail = email;
                    if (prevEmail.length) prevEmail.splice(index, 1);
                    setEmail(prevEmail);
                    setbkl(!bkl);
                  }}
                >
                  <DeleteIcon
                    onClick={(e) => {
                      e.preventDefault();
                      console.log(index);
                      const prevEmail = email;
                      if (prevEmail.length) prevEmail.splice(index, 1);
                      setEmail(prevEmail);
                      setbkl(!bkl);
                    }}
                  />
                </IconButton>
              }
            >
              {emailx}
            </ListItem>
          );
        })}
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleEmailList();
          }}
        >
          Submit Email List
        </Button>
      </List>
    </Stack>
  );
}
