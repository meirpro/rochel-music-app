import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 100%)",
        borderRadius: "6px",
      }}
    >
      {/* Piano icon using divs since SVG support is limited in ImageResponse */}
      <div
        style={{
          width: "26px",
          height: "20px",
          border: "2px solid #7c3aed",
          borderRadius: "3px",
          display: "flex",
          position: "relative",
          background: "white",
        }}
      >
        {/* Black keys */}
        <div
          style={{
            position: "absolute",
            left: "3px",
            top: "0px",
            width: "4px",
            height: "12px",
            background: "#7c3aed",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "10px",
            top: "0px",
            width: "4px",
            height: "12px",
            background: "#7c3aed",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "17px",
            top: "0px",
            width: "4px",
            height: "12px",
            background: "#7c3aed",
          }}
        />
      </div>
    </div>,
    {
      ...size,
    },
  );
}
