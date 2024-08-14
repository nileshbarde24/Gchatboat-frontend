// @ts-ignore
const SetupMultiFactOfEmailOtp = (SENDER_EMAIL, email, otp) => {
    return {
        from: SENDER_EMAIL,
        to: email,
        subject: "Setup authentication of email OTP",
        text: "Your OTP",
        html: `
      <html>
        <head>
          <link href="https://fonts.cdnfonts.com/css/hk-groteks" rel="stylesheet" />
        </head>
        <body>
          <table style="width: 100%; height: 100vh; border: 0.1px solid black;">
            <tr>
              <td style="height: 75px; background-color: #2626EA;">
                <table style="width: 100%; height: 100%;">
                  <tr>
                    <td style="padding: 13px">
                      <a style="text-decoration: none; color: white; font-family: 'HK Grotesk', sans-serif; font-weight: bold; font-size: 25px" target="_blank" href=${process.env.REMOTE_BASE_URL}>
                        Chat-bot
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height: 110px">
                <table style="width: 90%; margin-left: 5%; height: 100%; background-color: #2626EA; margin-top: 25px">
                  <tr style="width: 100%; height: 100%">
                    <td style="width: 100%; background-repeat: no-repeat; background-size: 100% 100%; background-color: gray;">
                      <p style="margin-left: 12px; color: white; font-family: 'HK Grotesk', sans-serif; font-weight: bold; font-size: 25px;">Setup authentication of email OTP</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="font-size: 18px; color: black; padding-left: 5%; padding-top: 5%; padding-right: 5%; font-family: 'HK Grotesk', sans-serif;">
                <p>Dear User,</p> You have requested a One-Time Password (OTP) for setting up email authentication for your chatbot. Please use the following OTP to complete the authentication process:

                <br />
                <strong>OTP: ${otp}</strong>
                <br />
                
                If you did not request this OTP, please disregard this message. Thank you!:
                <br />
                
                <br />
                If you did not request this OTP or have any questions, please contact our support team at info@Chat-bot.com.
                <br />
                <br />
                Best regards,
                <br />
                <span style="font-weight: bold; font-family: 'HK Grotesk', sans-serif;">Chat-bot Team</span>
              </td>
            </tr>
            <tr>
              <td style="width: 100%; margin-left: 2%; padding-right: 5%; padding-left: 2%">
                <div style="padding: 8px; background-color: #F5F6F7;">
                  <div style="width: 100%; background-color: #F5F6F7; height: 120px;">
                    <p style="color: #2626EA; font-family: 'HK Grotesk', sans-serif; font-weight: bold; text-align: center; font-size: 20px;">Follow Us On</p>
                    <div style="text-align: center;">
                      <a target="_blank" href="https://www.facebook.com/Chat-botLimited">
                        <img style="padding: 8px;" src="https://test-env-ci-platform.s3.eu-west-2.amazonaws.com/uploads/1687946543479emailfb.png" alt="Facebook" />
                      </a>
                      <a target="_blank" href="https://twitter.com/Chat-botnow">
                        <img style="padding: 8px;" src="https://test-env-ci-platform.s3.eu-west-2.amazonaws.com/uploads/1687946581944emailtwitter.png" alt="Twitter" />
                      </a>
                      <a target="_blank" href="https://www.instagram.com/Chat-bot_/">
                        <img style="padding: 8px;" src="https://test-env-ci-platform.s3.eu-west-2.amazonaws.com/uploads/1687946430319emailinsta.png" alt="Instagram" />
                      </a>
                      <a target="_blank" href="https://www.linkedin.com/company/Chat-bot-limited/">
                        <img style="padding: 8px;" src="https://test-env-ci-platform.s3.eu-west-2.amazonaws.com/uploads/1687946467382emaillink.png" alt="LinkedIn" />
                      </a>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </body>
      </html>
     `,
    };
};
export { SetupMultiFactOfEmailOtp };
//# sourceMappingURL=SetupMultiFactOfEmailOtp.js.map