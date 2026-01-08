import { ImageResponse } from "next/og";

// export const runtime = "edge"; // Reverted to default runtime due to build error

export const alt = "Joan Sasanedas - Software Engineer Portfolio";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image() {
    // Fonts
    const interSemiBold = await fetch(
        new URL("https://fonts.googleapis.com/css2?family=Inter:wght@600&text=Joan%20Sasanedas")
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
        (
            <div
                style={{
                    background: "linear-gradient(to bottom right, #000000, #111111)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Inter",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "20px",
                        padding: "60px 80px",
                        background: "rgba(255, 255, 255, 0.03)",
                        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
                    }}
                >
                    <div
                        style={{
                            fontSize: 80,
                            fontWeight: 600,
                            letterSpacing: "-0.02em",
                            color: "white",
                            marginBottom: 20,
                            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                        }}
                    >
                        Joan Sasanedas
                    </div>
                    <div
                        style={{
                            fontSize: 40,
                            fontWeight: 400,
                            color: "#A1A1AA", // zinc-400
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Software Engineer & Cloud Infrastructure
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
