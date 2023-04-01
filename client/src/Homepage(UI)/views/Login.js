import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import axios from "axios";
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(firstName, lastName, email, password);
    axios
      .post(`${config.REACT_APP_AUTHURI}/auth/signup`, {
        name: firstName,
        email: email,
        password: password,
        passwordConfirm: password,
      })
      .then((response) => {
        console.log(response);
        if (response.status === 200)
          window.alert("verfication mail has been sent");
        else window.alert("something went wrong!");
      })
      .catch((errr) => {
        console.log(errr);
        window.alert("something went wrong!");
      });
    handleClose2();
  };
  const handleLogin = (e) => {
    e.preventDefault();
    loginMode &&
      axios
        .post(
          `${config.REACT_APP_AUTHURI}/auth/login`,
          {
            email: email,
            password: password,
          },
          { withCredentials: true }
        )
        .then((response) => {
          console.log(response);
          if (response.status === 200) window.alert("successfully logged in");
          else window.alert("something went wrong!");
          handleClose2();
        })
        .catch((errr) => {
          console.log(errr);
        });
    setLoginMode(true);
  };
  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      {!loginMode && (
        <TextField
          label="First Name"
          variant="filled"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      )}{" "}
      {!loginMode && (
        <TextField
          label="Last Name"
          variant="filled"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      )}
      <TextField
        label="Email"
        variant="filled"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        variant="filled"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth={true}
        variant="contained"
        onClick={handleLogin}
      >
        {!loginMode ? `Already a user ? Log in` : `Log In`}
      </Button>
      {!loginMode && (
        <Button
          type="submit"
          variant="contained"
          fullWidth={"full"}
          color="primary"
        >
          Signup
        </Button>
      )}
      {loginMode && (
        <Button
          variant="contained"
          fullWidth={"full"}
          color="primary"
          onClick={(e) => {
            e.preventDefault();
            setLoginMode(false);
          }}
        >
          Not Registered?
        </Button>
      )}
    </form>
  );
};

export default Form;
