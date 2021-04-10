import cookieParser from "cookie-parser";
import Express from "express";
import { URLSearchParams } from "url";
import request from "request-promise";
import { CLIENT_ID, CLIENT_SECRET } from "./cred";

// Create a scope what you want to test
export const SCOPE =
  encodeURIComponent("https://www.googleapis.com/auth/userinfo.email") +
  " " +
  encodeURIComponent("https://www.googleapis.com/auth/userinfo.profile");

export const REDIRECT_URI = encodeURIComponent(
  `http://localhost:4000/api/login/google/callback`
);

const app = Express();

// You know why its there
app.use(cookieParser());

app.get("/", (req, res) => {
  res.cookie("test", "works", { httpOnly: true }).json({ hello: "world" });
});

// Call this route to start the process
app.get("/auth/login/google", (req, res) => {
  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`
  );
});

// This route will be called by google
app.get("/api/login/google/callback", async (req, res) => {
  if (!req.query.code) return res.send("Not logged in!");
  const code = req.query.code;

  // trade the code in for an access token
  try {
    let auth = await request({
      method: "post",
      url: "https://oauth2.googleapis.com/token",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      form: {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:4000/api/login/google/callback",
        scope: ["email", "profile"],
      },
      json: true,
      simple: true,
    });

    // use that token to get the data of the user
    const profile = await request({
      method: "get",
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
      headers: {
        Authorization: "Bearer " + auth.access_token,
      },
      json: true,
      simple: true,
    });

    // Now you can store this in database create jwt or whatever
    res.json({ profile });

  } catch (e) {
    res.json({ error: e });
  }
});

app.listen("4000", () => console.log("Server running on port 4000"));
