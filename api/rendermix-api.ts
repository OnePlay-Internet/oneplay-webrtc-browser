import { Axios } from "axios";
import { UserProfile } from "../inteface";

export class RendermixApi extends Axios {
    constructor() {
        super();
        this.defaults.baseURL = process.env.RENDERMIX_BASE_URL;
        this.defaults.headers.common = { "Content-Type": "application/json" };
        this.interceptors.request.use((req) => {
            req.headers = {
                session_token: localStorage.getItem("op_session_token"),
            };
            return req;
        });
        this.interceptors.response.use(
            (res) => res,
            (error) => {
                if (error.response.status === 401) {
                    localStorage.removeItem("op_session_token");
                    location.href =
                        "/dashboard/login?redirectUrl=" + location.href;
                }
                return Promise.reject(error.response);
            }
        );
    }

    async getProfile() {
        const { data } = await this.get<UserProfile>("/accounts/profile");
        return data;
    }
}
