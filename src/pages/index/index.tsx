import * as electron from "electron";
import * as React from "react";
import * as ReactDOM from "react-dom";

import * as constants from "../../constants";

let isInitialized = false;

const IndexComponent = () => {
  type Me = {
    birthday: string;
    country: string;
    language: string;
    nickname: string;
  };
  const [meInfo, setMeInfo] = React.useState<Me>();

  React.useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;

      electron.ipcRenderer.on("auth", async (_, auth: { sessionTokenCode: string; verifier: string }) => {
        const sessionTokenResult = await fetch(constants.acountSessionTokenURI, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Platform": "Android",
            "X-ProductVersion": constants.userAgent,
            "User-Agent": constants.userAgent,
          },
          body: JSON.stringify({
            client_id: constants.clientID,
            session_token_code: auth.sessionTokenCode,
            session_token_code_verifier: auth.verifier,
          }),
        });

        const sessionTokenJSON = await sessionTokenResult.json();

        const accessTokenResult = await fetch(constants.acountAccessTokenURI, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Platform": "Android",
            "X-ProductVersion": constants.userAgent,
            "User-Agent": constants.userAgent,
            "Content-Length": "439",
            Accept: "application/json",
            Connecton: "Keep-Alive",
          },
          body: JSON.stringify({
            client_id: constants.clientID,
            session_token: sessionTokenJSON.session_token,
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token",
          }),
        });

        const accessTokenJSON = await accessTokenResult.json();

        const meResult = await fetch(constants.acountMeURI, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Platform": "Android",
            "X-ProductVersion": constants.userAgent,
            "User-Agent": constants.userAgent,
            Authorization: `Bearer ${accessTokenJSON.access_token}`,
          },
        });
        const meJSON: Me = await meResult.json();

        setMeInfo(meJSON);
      });
    }
  });

  return (
    <main>
      <h1>switch-viewer</h1>
      <hr />
      <h2>認証</h2>
      <button onClick={() => electron.ipcRenderer.send("openAcountAuthorizeViewWindow")}>認証ページ</button>
      {meInfo && <div>認証完了しました</div>}
      {meInfo && (
        <>
          <h2>認証情報</h2>
          <div>{meInfo.nickname}</div>
          <div>{meInfo.country}</div>
          <div>{meInfo.birthday}</div>
          <div>{meInfo.language}</div>
        </>
      )}
    </main>
  );
};

ReactDOM.render(<IndexComponent />, document.getElementById("app"));
