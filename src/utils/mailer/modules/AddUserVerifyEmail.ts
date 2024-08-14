// @ts-ignore
const AddUserVerifyEmail = (SENDER_EMAIL, email, token,firstName,lastName,password) => {
  return {
    from: SENDER_EMAIL,
    to: email,
    subject: "Verify Your Email and Complete User Registration",
    text:"Verify Your Email and Complete User Registration",

    html: `
   
    <html>
  <head>
    <link href="https://fonts.cdnfonts.com/css/hk-groteks" rel="stylesheet" />
  
  </head>
  <body>
    <table style="width: 100%; height: 100vh; border:0.1px solid black;">
      <tr>
        <td style="height: 75px; background-color: #2626EA;">
          <table style="width: 100%; height: 100%;">
            <tr>

              <td style="padding:13px">
              <a style="text-decoration:none; color: white; font-family: 'HK Grotesk', sans-serif; font-weight: bold; font-size: 25px" target="_blank" href=${process.env.REMOTE_BASE_URL}>  
               
                
                 Chat-bot
                </a>
        </td>
      </tr>
    </table>
    </td>
    </tr>
    <tr>
      <td style="height: 110px">
        <table style="width: 90%;margin-left:5%; height: 100%;background-color: #2626EA;margin-top:25px">
          <tr style="width:100%; height:100%">
          
         
            <td  style="width:100%;
             background-repeat: no-repeat;
            background-size: 100% 100%;
            background-color:"gray";
            " >
<p style=" margin-left: 12px; color: white; font-family: 'HK Grotesk', sans-serif; font-weight: bold; font-size: 25px;"> Email Verification 
  
                  </p>

</td>




    </tr>
    </table>
    </td>
    </tr>
      <tr>
      <td style="font-size: 18px;color:black;padding-left:5%;padding-top:5%;padding-right:5%;font-family: 'HK Grotesk', sans-serif;">
          <p> Dear ${firstName+ " "+lastName}, </p> Thank you for choosing to register with Chat-bot. We're thrilled to have you on board! Before we can activate your account and provide you with access to our services, we kindly request you to verify your email address. <br />
            <br /> Your password:${password} <br /> 
            <br /> To complete the registration process and verify your email, please click on the following link: <br /> 
            
            <br /> <a target="_blank" href="${process.env.REMOTE_BACKEND_URL}/api/verify/email/${token}">Reset password</a><br />
           
            <br /> By clicking the link above, you will be directed to a secure page where you can confirm the ownership of your email address. This step helps us ensure the security of your account and maintain the integrity of our platform. <br />
            <br /> If the link does not work, please copy and paste the entire URL into your web browser's address bar.<br />
            <br /> Once your email address is verified, you will be able to log in to your account and enjoy the full range of benefits offered by Chat-bot. If you encounter any difficulties during the registration process or have any questions, please don't hesitate to reach out to our support team at info@Chat-bot.com .
            <br />
            <br />
            We are excited to have you as a part of our community and look forward to serving you. Thank you for choosing Chat-bot.

          <p style="font-weight: bold;">Thank you for your cooperation.</p>
         
          <br /> Best regards, 
          <br />
      <span style="font-weight: bold;font-family: 'HK Grotesk', sans-serif;">Chat-bot Team</span>
       
      </td>

    </tr>
   
   
    
   
     
 
   
    
    
    
    
    
    
    
    
    <tr>
      <td  style="width: 100%; margin-left: 2%; padding-right:5%;padding-left:2%">
        <div style="padding:8px;background-color:#F5F6F7;">
          <div style="width: 100%; background-color: #F5F6F7; height: 120px; 
">
            <p style=" color: #2626EA; font-family: 'HK Grotesk', sans-serif; font-weight: bold; text-align:center;font-size: 20px;">Follow Us On</p>
            <div style=" text-align:center;">
            <a taget="_blank" href="https://www.facebook.com/Chat-botLimited"> <img style="padding: 8px;" src="https://test-env-ci-platform.s3.eu-west-2.amazonaws.com/uploads/1687946543479emailfb.png" alt="Facebook" /></a>
            <a taget="_blank" href="https://twitter.com/Chat-botnow"> <img style="padding: 8px;" src="https://test-env-ci-platform.s3.eu-west-2.amazonaws.com/uploads/1687946581944emailtwitter.png" alt="Twitter" /></a>
            <a taget="_blank" href="https://www.instagram.com/Chat-bot_/"><img style="padding: 8px;" src="https://test-env-ci-platform.s3.eu-west-2.amazonaws.com/uploads/1687946430319emailinsta.png" alt="Instagram" /></a>
            <a taget="_blank" href="https://www.linkedin.com/company/Chat-bot-limited/">  <img style="padding: 8px;" src="https://test-env-ci-platform.s3.eu-west-2.amazonaws.com/uploads/1687946467382emaillink.png" alt="LinkedIn" /></a>
            </div>
          </div>
        </div>
      </td>
    </tr>
    
     <br/>
    <br/>
      <br/>
      <br/>
  
   
    </table>
    </td>
    </tr>
    </table>
  </body>
</html>
   `,
  };
};

export {AddUserVerifyEmail}
