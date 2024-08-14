import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

const GoogleLog = (props) => {
  const onSuccess = (credentialResponse) => {
    const details = jwt_decode(credentialResponse.credential);
    props.func(details);
    console.log("login google details", details);
  };
  return (
    <div className=" mx-1">
      <GoogleOAuthProvider clientId="1026062015892-hn7rm3t6of1q5m60bthg42a06daru116.apps.googleusercontent.com">
        <GoogleLogin
          onSuccess={onSuccess}
          clientId="1026062015892-hn7rm3t6of1q5m60bthg42a06daru116.apps.googleusercontent.com"
          onError={() => {
            console.log("Login Failed");
          }}
          icon="fa-google"
        ></GoogleLogin>
      </GoogleOAuthProvider>
    </div>
  );
};

export default GoogleLog;
