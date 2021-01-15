"use strict";

import "./pages/index/index.html";

import * as electron from "electron";
import * as constants from "./constants";

import * as crypto from "crypto";
import * as base64url from "base64url";

const generateRandom = (length: number) => {
  return base64url.default(crypto.randomBytes(length));
};

const calculateChallenge = (codeVerifier: crypto.BinaryLike) => {
  const hash = crypto.createHash("sha256");
  hash.update(codeVerifier);
  const codeChallenge = base64url.default(hash.digest());
  return codeChallenge;
};

const getGenerateAuthenticationParams = () => {
  const state = generateRandom(36);
  const sessionTokenCodeVerifier = generateRandom(32);
  const sessionTokenCodeChallenge = calculateChallenge(sessionTokenCodeVerifier);

  return {
    state,
    sessionTokenCodeVerifier,
    sessionTokenCodeChallenge,
  };
};

const generateAuthenticationParams = getGenerateAuthenticationParams();

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let menuWindow: electron.BrowserWindow | null;

// Scheme must be registered before the app is ready
electron.protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);

const registerCustomURLScheme = () => {
  electron.protocol.registerHttpProtocol(constants.customURLScheme, (req) => {
    if (new RegExp(constants.redirectURL).test(req.url)) {
      const urlSearchParams = new URLSearchParams(req.url);
      const sessionTokenCode = urlSearchParams.get("session_token_code");
      const verifier = generateAuthenticationParams.sessionTokenCodeVerifier;

      menuWindow?.webContents.send("auth", { sessionTokenCode, verifier });
      acountAuthorizeViewWindow?.close();
    }
  });
};

const createMenuWindow = async () => {
  // Create the browser window.
  menuWindow = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  await menuWindow.loadURL(`file://${__dirname}/pages/index/index.html`);

  menuWindow.on("closed", () => {
    menuWindow = null;
  });
};

let acountAuthorizeViewWindow: electron.BrowserWindow | null;
electron.ipcMain.on("openAcountAuthorizeViewWindow", async (_) => {
  acountAuthorizeViewWindow = new electron.BrowserWindow({
    x: 0,
    y: 0,
    width: 600,
    height: 600,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  const url = `${constants.acountAuthorizeURI}?state=${generateAuthenticationParams.state}&redirect_uri=${constants.redirectURL}&client_id=${constants.clientID}&scope=${constants.scope}&response_type=session_token_code&session_token_code_challenge=${generateAuthenticationParams.sessionTokenCodeChallenge}&session_token_code_challenge_method=S256&theme=login_form`;

  acountAuthorizeViewWindow.loadURL(url);

  acountAuthorizeViewWindow.on("closed", () => {
    acountAuthorizeViewWindow = null;
  });
});

// Quit when all windows are closed.
electron.app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});

electron.app.on("activate", async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (menuWindow === null) {
    await createMenuWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron.app.on("ready", async () => {
  registerCustomURLScheme();
  await createMenuWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        electron.app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      electron.app.quit();
    });
  }
}
