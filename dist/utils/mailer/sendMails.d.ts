declare function addUserVerifyMail(email: any, token: any, firstName: any, lastName: any, password: any): Promise<void>;
declare function otpForgotPasswordMail(email: any, otp: any): Promise<void>;
declare function otpForSetupEmailAuthenticationMail(email: any, otp: any): Promise<void>;
export { addUserVerifyMail, otpForgotPasswordMail, otpForSetupEmailAuthenticationMail };
