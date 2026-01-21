import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata - Apple icons are typically 180x180
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 100%)",
        borderRadius: "32px",
      }}
    >
      {/* Piano icon using divs since SVG support is limited in ImageResponse */}
      <div
        style={{
          width: "140px",
          height: "110px",
          border: "8px solid #7c3aed",
          borderRadius: "12px",
          display: "flex",
          position: "relative",
          background: "white",
        }}
      >
        {/* Black keys */}
        <div
          style={{
            position: "absolute",
            left: "16px",
            top: "0px",
            width: "22px",
            height: "65px",
            background: "#7c3aed",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "54px",
            top: "0px",
            width: "22px",
            height: "65px",
            background: "#7c3aed",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "92px",
            top: "0px",
            width: "22px",
            height: "65px",
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
