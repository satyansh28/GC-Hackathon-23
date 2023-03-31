export default function VideoCallComponent(props) {
  return (
    <div>
      <video
        id="my-video"
        ref={props.localVideoref}
        autoPlay
        muted
        style={{
          borderRadius: "50px",
          objectFit: "fill",
          width: "100%",
          height: "100%",
          maxWidth: "900px",
        }}
      ></video>
      <div>peldunga</div>
    </div>
  );
}
