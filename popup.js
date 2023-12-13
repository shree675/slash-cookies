//@ts-check

const mouseEvents = (
  /** @type {number} */ type,
  /** @type {string | number} */ tabUrl,
  /** @type {any} */ save
) => {
  let curEvent = null;
  let childElements = [];
  let childStyleAttributes = [];

  const prevOnmouseover = window.onmouseover;
  const prevOnmouseout = window.onmouseout;
  const prevOnkeyup = window.onkeyup;
  const prevOnclick = window.onclick;

  const terminate = (
    /** @type {string | any[]} */ childElements,
    /** @type {any[]} */ childStyleAttributes
  ) => {
    for (var i = 0; i < childElements.length; i++) {
      childElements[i].style.backgroundColor = childStyleAttributes[i].bgColor;
    }
    childElements = [];
    childStyleAttributes = [];
    window.onmouseover = prevOnmouseover;
    window.onmouseout = prevOnmouseout;
    window.onkeyup = prevOnkeyup;
    window.onclick = prevOnclick;
  };

  const clickHandler = (event) => {
    let storage = null;
    chrome.storage.local.get("mappings", ({ mappings }) => {
      storage = mappings;
      if (!storage) {
        storage = {};
      }
      if (!storage[tabUrl]) {
        storage[tabUrl] = {
          remove: [],
          refine: [],
        };
      }
      terminate(childElements, childStyleAttributes);
      if (type === 0) {
        event.target.style.display = "none";
        if (event.target.id && event.target.id !== "") {
          storage[tabUrl].remove.push([event.target.id, null]);
        } else if (event.target.className && event.target.className !== "") {
          storage[tabUrl].remove.push([null, event.target.className]);
        } else {
          //@ts-ignore
          document.getElementById("app").style.backgroundColor = "red";
        }
      } else {
        event.target.style.filter = "none";
        event.target.style.backgroundColor = "rgba(0, 0, 0, 0)";
        if (event.target.id && event.target.id !== "") {
          storage[tabUrl].refine.push([event.target.id, null]);
        } else if (event.target.className && event.target.className !== "") {
          storage[tabUrl].refine.push([null, event.target.className]);
        } else {
          //@ts-ignore
          document.getElementById("app").style.backgroundColor = "red";
        }
      }
      if (save) {
        chrome.storage.local.set({ mappings: storage });
      }
      return false;
    });
  };

  window.onclick = (event) => {
    clickHandler(event);
  };

  window.onmouseover = (event) => {
    curEvent = event;

    const obtainAllChildren = (
      /** @type {{ style: { backgroundColor: string; }; children: any; }} */ element,
      /** @type {any[]} */ childElements,
      /** @type {any[]} */ childStyleAttributes,
      /** @type {any} */ root
    ) => {
      childElements.push(element);
      childStyleAttributes.push({
        bgColor: element.style.backgroundColor,
      });
      if (element === root) {
        element.style.backgroundColor = "rgba(116, 179, 158, 0.8)";
      } else {
        element.style.backgroundColor = "rgba(0, 0, 0, 0)";
      }
      for (var child of element.children) {
        obtainAllChildren(child, childElements, childStyleAttributes, root);
      }
    };

    obtainAllChildren(
      event.target,
      childElements,
      childStyleAttributes,
      event.target
    );
  };

  window.onmouseout = () => {
    for (var i = 0; i < childElements.length; i++) {
      childElements[i].style.backgroundColor = childStyleAttributes[i].bgColor;
    }
    childElements = [];
    childStyleAttributes = [];
    curEvent = null;
  };

  window.onkeyup = (event) => {
    terminate(childElements, childStyleAttributes);
    if (event.key === "Escape") {
      return false;
    } else if (event.key === "Enter") {
      clickHandler(curEvent);
      return false;
    }
  };
};

const clearStorageURL = (tabUrl) => {
  chrome.storage.local.get("mappings", ({ mappings }) => {
    if (tabUrl && mappings[tabUrl]) {
      delete mappings[tabUrl];
      chrome.storage.local.set({ mappings: mappings });
      window.location.reload();
    }
  });
};

const clearAllStorageURL = () => {
  chrome.storage.local.get("mappings", ({ mappings }) => {
    if (mappings) {
      chrome.storage.local.set({ mappings: {} });
      window.location.reload();
    }
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // HTTPS only according to manifest file
  const tabUrlMatches = tab.url?.match("https://[^/]*");
  let tabUrl = null;
  if (tabUrlMatches) {
    tabUrl = tabUrlMatches[0];
  }

  const confirmDialog = document.getElementById("dialog");
  const save = document.getElementById("checkbox");

  const removeElement = () => {
    window.close();
    chrome.scripting.executeScript({
      target: { tabId: tab.id || 0 },
      //@ts-ignore
      function: mouseEvents,
      //@ts-ignore
      args: [0, tabUrl, save?.checked], // remove element
    });
  };

  const refineElement = () => {
    window.close();
    chrome.scripting.executeScript({
      target: { tabId: tab.id || 0 },
      //@ts-ignore
      function: mouseEvents,
      //@ts-ignore
      args: [1, tabUrl, save?.checked], // refine element
    });
  };

  const clearStorage = () => {
    window.close();
    chrome.scripting.executeScript({
      target: { tabId: tab.id || 0 },
      //@ts-ignore
      function: clearStorageURL,
      args: [tabUrl], // refine element
    });
  };

  const clearAllStorage = () => {
    window.close();
    chrome.scripting.executeScript({
      target: { tabId: tab.id || 0 },
      //@ts-ignore
      function: clearAllStorageURL,
    });
  };

  const openPopUp = () => {
    //@ts-ignore
    confirmDialog.style.display = "flex";
  }

  const closePopUp = () => {
    //@ts-ignore
    confirmDialog.style.display = "none";
  }

  document
    .getElementById("remove-element")
    ?.addEventListener("click", removeElement);
  document
    .getElementById("refine-element")
    ?.addEventListener("click", refineElement);
  document
    .getElementById("clear-storage")
    ?.addEventListener("click", clearStorage);
    document
      .getElementById("button-yes")
      ?.addEventListener("click", clearAllStorage);
  document
    .getElementById("clear-all")
    ?.addEventListener("click", openPopUp);
  document
    .getElementById("button-no")
    ?.addEventListener("click", closePopUp);
});