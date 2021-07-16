import { parseLinkHeader } from "../utils/utils";

const baseUrl = "http://localhost:5091";

export const getAccountsData = async (params = "") => {
  return await fetch(`${baseUrl}/accounts?${params}`).then(async (response) => {
    const data = await response.json();

    return {
      total: +response.headers.get("X-Total-Count"),
      links:
        response.headers.get("Link") &&
        parseLinkHeader(response.headers.get("Link")),
      data,
    };
  });
};
