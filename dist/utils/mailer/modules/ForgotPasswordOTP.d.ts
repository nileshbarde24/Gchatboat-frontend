declare const ForgotPasswordOTP: (SENDER_EMAIL: any, email: any, otp: any) => {
    from: any;
    to: any;
    subject: string;
    text: string;
    html: string;
};
export { ForgotPasswordOTP };
