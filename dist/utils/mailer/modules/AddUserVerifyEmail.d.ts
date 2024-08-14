declare const AddUserVerifyEmail: (SENDER_EMAIL: any, email: any, token: any, firstName: any, lastName: any, password: any) => {
    from: any;
    to: any;
    subject: string;
    text: string;
    html: string;
};
export { AddUserVerifyEmail };
