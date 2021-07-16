// Parse an ISO date time stamp into readible English.
export const dateTimeFormat = (dateToParse) => {
  const date = new Date(dateToParse);

  const dateTimeFormat = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  return dateTimeFormat.format(date);
};

// Create URL Params.
export const encodeQueryData = (objectToParse) => {
  const params = [];

  for (let param in objectToParse) {
    params.push(
      `${encodeURIComponent(param)}=${encodeURIComponent(objectToParse[param])}`
    );
  }

  return params.join("&");
};

// Parse the Link Headers that come from the server call.
export const parseLinkHeader = (linkHeader) => {
  const linkHeadersArray = linkHeader
    .split(", ")
    .map((header) => header.split("; "));

  const linkHeadersMap = linkHeadersArray.map((header) => {
    const thisHeaderRel = header[1].replace(/"/g, "").replace("rel=", "");
    let thisHeaderUrl = header[0]
      .slice(1, -1)
      .replace("<", "")
      .replace(">", "");

    const findIndexOf = thisHeaderUrl.indexOf("?");
    const params = thisHeaderUrl
      .slice(findIndexOf + 1, thisHeaderUrl.length)
      .split("&");
    const pageParams = params[0].split("=");

    return [thisHeaderRel, +pageParams[1]];
  });

  return Object.fromEntries(linkHeadersMap);
};
