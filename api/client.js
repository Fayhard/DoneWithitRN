import { create } from "apisauce";
import cache from "../utility/cache";
import authStorage from "../auth/authStorage";
import settings from "../config/settings";

const apiClient = create({
  baseURL: settings.apiUrl,
});

apiClient.addAsyncRequestTransform(async (request) => {
  const token = await authStorage.getToken();
  if (!token) return;
  request.headers["x-auth-token"] = token;
});

const get = apiClient.get;

apiClient.get = async (url, params, axiosConfig) => {
  const response = await get(url, params, axiosConfig);

  if (response.ok) {
    cache.store(url, response.data);
    return response;
  }

  const data = await cache.get(url);
  return data ? { ok: true, data } : response;
};

export default apiClient;
