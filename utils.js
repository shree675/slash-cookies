getNotificationHtml = (document) => {
  const notificationElement = document.createElement("div");
  notificationElement.style.position = "absolute";
  notificationElement.style.right = "10px";
  notificationElement.style.top = "10px";
  notificationElement.style.color = "white";
  notificationElement.style.backgroundColor = "#323232";
  notificationElement.style.padding = "10px";
  notificationElement.style.borderRadius = "5px";
  notificationElement.style.zIndex = "999999";
  notificationElement.style.fontFamily = "Verdana";

  const firstChildElement = document.createElement("div");
  firstChildElement.style.fontSize = "16px";
  firstChildElement.innerHTML = "Applied window rules!";

  const secondChildElement = document.createElement("div");
  secondChildElement.style.fontSize = "12px";
  secondChildElement.innerHTML = "Source: Slash Cookies";

  notificationElement.appendChild(firstChildElement);
  notificationElement.appendChild(secondChildElement);
  return notificationElement;
};
