import React, { useState } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import Typography from "../Component/Typography";
import Layout from "./Layout";
import { Grid } from "@material-ui/core";
import BasicModal from "./ModalLoginSignUp";
import BasicModal2 from "./ModalMeetingDetails";
const { v4: uuidV4 } = require("uuid");

const styles = (theme) => ({
  background: {
    backgroundColor: "rgb(224, 17, 95)", // Average color of the background image.
    backgroundPosition: "center",
  },
  h5: {
    marginBottom: theme.spacing(8),
    marginTop: theme.spacing(4),
    [theme.breakpoints.up("sm")]: {
      marginTop: theme.spacing(4),
    },
  },
  more: {
    marginTop: theme.spacing(2),
  },
  button: {
    backgroundColor: "rgb(0, 174, 252)",
  },
});



function Product(props) {
  const { classes } = props;
  const [modalOpen, setisModalOpen] = useState(false);
  const [meetDetails, setMeetDetails] = useState(false);
  function videocall() {
    setMeetDetails(!meetDetails)
    // window.location.href = `/create/${uuid}`;
    // window.location.href = `/call/${uuid}`;
  }
  function login() {
    setisModalOpen(!modalOpen);
  }
  React.useEffect(() => {
    console.log("trigger rerender");
  }, [modalOpen, meetDetails]);
  return (
    <Layout backgroundClassName={classes.background}>
      {/* Increase the network loading priority of the background image. */}
      <BasicModal isModalOpen={modalOpen} setIsModalOpen={setisModalOpen} />
      <BasicModal2 isModalOpen={meetDetails} setIsModalOpen={setMeetDetails} />
      <Typography color="inherit" align="center" variant="h2">
        Team Mate
      </Typography>
      <Typography
        color="inherit"
        align="center"
        variant="h5"
        className={classes.h5}
      >
        Unleash your team's potential with TeamMate - the ultimate collaboration
        platform!
      </Typography>
      <Grid container spacing={2} justify="center">
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            onClick={login}
          >
            Log In/Sign Up
          </Button>
        </Grid>

        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            onClick={videocall}
          >
            Start a Video Call
          </Button>
        </Grid>
        
      </Grid>
    </Layout>
  );
}

Product.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Product);
