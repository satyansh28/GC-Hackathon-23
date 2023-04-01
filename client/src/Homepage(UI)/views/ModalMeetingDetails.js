import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Login2 from "./MeetingDetailsModalSubComp";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function BasicModal2(props) {
  const [open, setOpen] = React.useState(props.isModalOpen);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    props.setIsModalOpen(false);
  };
  React.useEffect(() => {
    setOpen(props.isModalOpen);
  }, [props.isModalOpen]);
  return (
    <div>
      {/* <Button onClick={handleOpen}>Open modal</Button> */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div>
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Meeting Options
            </Typography>
            <Login2 handleClose2={handleClose} />
          </Box>
        </div>
      </Modal>
    </div>
  );
}
