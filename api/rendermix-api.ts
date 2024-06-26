import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { UserProfile } from "../inteface";
import config from "@config";
import Cookies from "js-cookie";

export class RendermixApi {
    private http: AxiosInstance;

    constructor() {
        const axiosConfig: AxiosRequestConfig = {
            baseURL: config.render_mix_api,
            headers: {
                "Content-Type": "application/json",
            },
        };
        this.http = axios.create(axiosConfig);

        this.http.interceptors.request.use((req) => {
            req.headers = {
                session_token: Cookies.get("op_session_token"),
            };
            return req;
        });
        this.http.interceptors.response.use(
            (res) => res,
            (error) => {
                if (error.response.status === 401) {
                    Cookies.remove("op_session_token", {
                        domain: config.cookie_domain,
                        path: "/",
                    });
                    location.href =
                        config.app_domain +
                        "/login?redirectUrl=" +
                        encodeURIComponent(location.href);
                }
                return Promise.reject(error.response);
            }
        );
    }

    async getProfile() {
        const { data } = await this.http.get<UserProfile>("/accounts/profile");
        return data;
    }
}
