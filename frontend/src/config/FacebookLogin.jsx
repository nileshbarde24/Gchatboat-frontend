import React from 'react';
import FacebookLogin from 'react-facebook-login';
 

import jwt_decode from "jwt-decode";

const FacebookLog = (props) => {
  const responseFacebook = (credentialResponse) => {
    console.log(credentialResponse)
    props.func(credentialResponse);
  };
  return (
    <div className=" mx-1">
      <FacebookLogin
    appId="1468551313707321"
    fields="name,email,picture"
    callback={responseFacebook}
    cssClass="my-facebook-button-class "
    icon="fa-facebook"
    
  />
    </div>
  );
};

export default FacebookLog;
