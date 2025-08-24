export interface UserLoginInformation {
  event: {
    eventType: number;
    eventData: Array<{
      key: string;
      value: {
        message: string;
        token: string;
        refreshToken: string;
        encryptId: string;
        [key: string]: any;
      };
    }>;
    eventId: number;
  };
}
  export interface UserLoginInformation {
    status: Number;
    message: string;
    redirectUrl: string;
  }
  