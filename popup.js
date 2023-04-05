//@ts-check

const mouseEvents = (/** @type {number} */ type) => {
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
    terminate(childElements, childStyleAttributes);
    if (type === 0) {
      event.target.style.display = "none";
    } else {
      event.target.style.filter = "none";
      event.target.style.backgroundColor = "rgba(0, 0, 0, 0)";
    }
    return false;
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
