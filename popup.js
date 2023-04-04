//@ts-check

const mouseEvents = (/** @type {number} */ type) => {
  let childElements = [];
  let childStyleAttributes = [];

  const terminate = (
    /** @type {string | any[]} */ childElements,
    /** @type {any[]} */ childStyleAttributes
  ) => {
    for (var i = 0; i < childElements.length; i++) {
      childElements[i].style.backgroundColor = childStyleAttributes[i].bgColor;
    }
    childElements = [];
    childStyleAttributes = [];
    window.onmouseover = null;
    window.onmouseout = null;
    window.onkeyup = null;
    window.onclick = null;
  };

  window.onmouseover = (event) => {
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

  window.onmouseout = function () {
    for (var i = 0; i < childElements.length; i++) {
      childElements[i].style.backgroundColor = childStyleAttributes[i].bgColor;
    }
    childElements = [];
    childStyleAttributes = [];
  };

  window.onclick = function (event) {
    terminate(childElements, childStyleAttributes);
    if (type === 0) {
      event.target.style.display = "none";
    } else {
      event.target.style.filter = "none";
      event.target.style.backgroundColor = "rgba(0, 0, 0, 0)";
    }
    return false;
  };

  window.onkeyup = function (event) {
    if (event.key === "Escape") {
      terminate(childElements, childStyleAttributes);
      return false;
    }
  };
};

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const removeElement = () => {
    window.close();
    chrome.scripting.executeScript({
      target: { tabId: tab.id || 0 },
      //@ts-ignore
      function: mouseEvents,
      args: [0], // remove element
    });
  };

  const refineElement = () => {
    window.close();
    chrome.scripting.executeScript({
      target: { tabId: tab.id || 0 },
      //@ts-ignore
      function: mouseEvents,
      args: [1], // refine element
    });
  };

  document
    .getElementById("remove-element")
    ?.addEventListener("click", removeElement);
  document
    .getElementById("refine-element")
    ?.addEventListener("click", refineElement);
});
