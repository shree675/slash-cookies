//@ts-check

/*
declaring all variables of external files here instead
because external files are loaded multiple times
*/
var getNotificationHtml;
var modified = false;

chrome.webNavigation.onDOMContentLoaded.addListener(async function (details) {
  const tabUrlMatches = details.url.match("https://[^/]*");
  let tabUrl = null;
  if (tabUrlMatches) {
    tabUrl = tabUrlMatches[0];
  }
  const tabId = details.tabId;
  modified = false;

  const filterElements = (
    /** @type {{ [x: string]: { refine: any[]; remove: any[]; }; }} */ storage,
    /** @type {string | number} */ tabUrl
  ) => {
    if (storage[tabUrl].remove && storage[tabUrl].remove.length > 0) {
      storage[tabUrl].remove.forEach((identifier) => {
        let element = null;
        if (identifier[0]) {
          element = document.getElementById(identifier[0]);
        } else if (identifier[1]) {
          element = document.getElementsByClassName(identifier[1])[0];
        }
        if (element) {
          //@ts-ignore
          element.style.display = "none";
        }
      });
    }
    if (storage[tabUrl].refine && storage[tabUrl].refine.length > 0) {
      storage[tabUrl].refine.forEach((identifier) => {
        let element = null;
        if (identifier[0]) {
          element = document.getElementById(identifier[0]);
        } else if (identifier[1]) {
          element = document.getElementsByClassName(identifier[1])[0];
        }
        if (element) {
          //@ts-ignore
          element.style.filter = "none";
          //@ts-ignore
          element.style.backgroundColor = "rgba(0, 0, 0, 0)";
        }
      });
    }
  };

  let storage = null;

  chrome.storage.local.get("mappings", (data) => {
    storage = data.mappings;

    if (tabUrl && storage && storage[tabUrl]) {
      chrome.scripting.executeScript({
        target: { tabId: tabId || 0 },
        // @ts-ignore
        function: filterElements,
        args: [storage, tabUrl],
      });
    }
  });
});

chrome.webNavigation.onCompleted.addListener(async function (details) {
  const tabUrlMatches = details.url.match("https://[^/]*");
  let tabUrl = null;
  if (tabUrlMatches) {
    tabUrl = tabUrlMatches[0];
  }
  const tabId = details.tabId;

  const filterElements = (
    /** @type {{ [x: string]: { refine: any[]; remove: any[]; }; }} */ storage,
    /** @type {string | number} */ tabUrl
  ) => {
    window.setTimeout(() => {
      if (storage[tabUrl].remove && storage[tabUrl].remove.length > 0) {
        storage[tabUrl].remove.forEach((identifier) => {
          let element = null;
          if (identifier[0]) {
            element = document.getElementById(identifier[0]);
          } else if (identifier[1]) {
            element = document.getElementsByClassName(identifier[1])[0];
          }
          if (element) {
            //@ts-ignore
            element.style.display = "none";
            modified = true;
          }
        });
      }
      if (storage[tabUrl].refine && storage[tabUrl].refine.length > 0) {
        storage[tabUrl].refine.forEach((identifier) => {
          let element = null;
          if (identifier[0]) {
            element = document.getElementById(identifier[0]);
          } else if (identifier[1]) {
            element = document.getElementsByClassName(identifier[1])[0];
          }
          if (element) {
            //@ts-ignore
            element.style.filter = "none";
            //@ts-ignore
            element.style.backgroundColor = "rgba(0, 0, 0, 0)";
            modified = true;
          }
        });
      }
      if (modified) {
        const notification = getNotificationHtml(document);
        if (notification) {
          document.body.appendChild(notification);
          function removeFadeOut(element, speed) {
            var seconds = speed / 1000;
            element.style.transition = "opacity " + seconds + "s ease";
            element.style.opacity = 0;
            setTimeout(function () {
              element.parentNode.removeChild(element);
            }, speed);
          }
          window.setTimeout(() => {
            removeFadeOut(notification, 500);
          }, 2000);
        }
      }
    }, 1000);
  };

  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["./utils.js"],
  });

  let storage = null;

  chrome.storage.local.get("mappings", (data) => {
    storage = data.mappings;

    if (tabUrl && storage && storage[tabUrl]) {
      chrome.scripting.executeScript({
        target: { tabId: tabId || 0 },
        // @ts-ignore
        function: filterElements,
        args: [storage, tabUrl],
      });
    }
  });
});
