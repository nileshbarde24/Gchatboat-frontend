import React, { useEffect } from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal, MsalProvider } from "@azure/msal-react";
import { loginRequest } from "./authMasalConfig"; // Define your authentication configuration
import { useNavigate } from 'react-router-dom';
import { apiPOST } from '../utils/apiHelper';


const WrappedView = () => {
    const navigate = useNavigate()
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount()
    const handleRedirect = () => {
        instance.loginPopup({
            ...loginRequest,
            prompt: 'create',
        })
            .catch((error) => console.log(error))
    };
    const handleLogout = () => {
        localStorage.clear()
        instance.logout();
    };

        const MICROSOFTLOGIN = async()=>{
            if (activeAccount) {
                localStorage.setItem('user', JSON.stringify(activeAccount?.idTokenClaims));
                const userDataString = localStorage.getItem('user');
                const loginUserData = JSON.parse(userDataString);
                if(loginUserData){
                    let names = loginUserData?.name.split(" ");
                    let firstName = names[0];
                    let lastName = names?.slice(1)?.join(" ");
                let payload = {
                  email: loginUserData?.preferred_username,
                  firstName: firstName,
                  lastName: lastName,
                }
                try {
        
                  let response = await apiPOST("api/socialLogin", payload);
                  if (response?.data?.status) {
                      localStorage.setItem('access_token', response?.data?.data?.access_token);
                      localStorage.setItem('refresh_token', response?.data?.data?.access_token);
                      localStorage.setItem('user', JSON.stringify(response.data?.data));
                     if(response?.data?.data?.role==="Individual" || response?.data?.data?.role==="Administrator"){
                        navigate('/');
                     }else{
                        navigate('/selecttype');
                     }
                      
                  }
                  } catch (error) {
                    console.log("error while calling login api------", error)
        
                  }
                }
               
            }
        }

useEffect(()=>{
    if(activeAccount){
        console.log("LOGIN MICROSOFT<<")
        MICROSOFTLOGIN()
    }
},[activeAccount])

   
    return (
        <div>
            <AuthenticatedTemplate>
                {activeAccount ? (
                    <div>
                    <p>Authenticated Successfully</p>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                ) : null
                }
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <button onClick={handleRedirect} className='border  flex items-center pr-3'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="40" viewBox="0 0 200 200">
                        <g clipPath="url(#a)">
                            <path d="M106.214 106.214H71.996V71.996h34.218z" fill="#f25022"></path>
                            <path d="M143.993 106.214h-34.218V71.996h34.218z" fill="#7fba00"></path>
                            <path d="M106.214 143.993H71.996v-34.218h34.218z" fill="#00a4ef"></path>
                            <path d="M143.993 143.993h-34.218v-34.218h34.218z" fill="#ffb900"></path>
                        </g>
                    </svg>Login with microsoft
                </button>
            </UnauthenticatedTemplate>
        </div>
    )

}

const MicrosoftLoginButton = ({ instance }) => {

    return (
        <MsalProvider instance={instance}>
            <WrappedView />
        </MsalProvider>
    );
}

export default MicrosoftLoginButton;