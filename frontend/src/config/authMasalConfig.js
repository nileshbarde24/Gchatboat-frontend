import { LogLevel } from "@azure/msal-browser";
import { Config } from "../config/index";

export const msalConfig = {
    auth: {
      clientId: 'f0369486-1eb2-4a65-a18e-e9bf866a686a', // Replace with your Azure AD App Registration client ID
    //   redirectUri: `${Config.API_URL}/selecttype`,
      redirectUri: 'http://localhost:5173/selecttype' ,
      navigateToLoginRequestUrl:false,
    },
    cache:{
        cacheLocation:'sessionStorage',
        storeAuthStateInCookie:false
    },
    system:{
        loggerOptions:{
            loggerCallback:(level,message,containsPii)=>{
                if(containsPii){
                    return
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message)
                        return
                    case LogLevel.Info:
                        console.error(message)
                        return
                    case LogLevel.Verbose:
                        console.error(message)
                        return
                    case LogLevel.Warning:
                        console.error(message)
                        return
                    default:
                        return
                }
            }
        }
    }
  };
  
  export const loginRequest = {
    scopes: ["user.read"], // Add the required scopes for your application
    redirectUri: msalConfig.auth.redirectUri
  };