const style = document.createElement("style");
style.innerText = "specai-tag-start, specai-tag-end {display: none;}";
document.body.appendChild(style);

const sendMessageToParent = (type, data) => {
  if (window.parent) {
    window.parent.postMessage({ type, data }, "*");
  }
};

const handleError = () => {
  window.addEventListener("error", (event) => {
    sendMessageToParent("ERROR", {
      message: event.message,
      stack: event.error.stack.toString(),
      error: event.error?.toString(),
    });
  });
};

// parent and self dora-id
const getAllDoraIds = (element) => {
  const allDoraIds = [];
  let prevSibling = element.previousElementSibling;
  while (prevSibling) {
    if (prevSibling.tagName.toLowerCase() === "specai-tag-start") {
      const doraId = prevSibling.getAttribute("data-dora-id");
      if (doraId) {
        allDoraIds.unshift(doraId);
      }
    } else {
      break;
    }
    prevSibling = prevSibling.previousElementSibling;
  }

  const doraId = element.getAttribute("data-dora-id");
  if (doraId) {
    allDoraIds.push(doraId);
  }

  return allDoraIds;
};

const getDomInfo = (element) => {
  const rect = element.getBoundingClientRect();
  const position = {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
  };
  const size = {
    width: rect.width,
    height: rect.height,
  };

  const processTextNode = (node, parentRect) => ({
    nodeType: "text",
    text: node.textContent.trim(),
    doraId: node.parentElement?.getAttribute("data-dora-id") || "",
    allDoraIds: getAllDoraIds(node.parentElement),
    position,
    size,
  });

  const children = Array.from(element.childNodes)
    .map((node) => {
      const tagName = node.tagName?.toLowerCase();
      if (tagName === "specai-tag-start" || tagName === "specai-tag-end") {
        return null;
      }
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        return processTextNode(node, rect);
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        return getDomInfo(node);
      }
      return null;
    })
    .filter(Boolean);

  const res = {
    nodeType: "element",
    tagName: element.tagName.toLowerCase(),
    componentName: element.tagName,
    doraId: element.getAttribute("data-dora-id") || "",
    allDoraIds: getAllDoraIds(element),
    position,
    size,
    children,
  };

  // component container size
  if (element.hasAttribute("data-component-container")) {
    res["componentContainerWidth"] = element.scrollWidth + 160;
  }

  return res;
};

const initDomObserver = () => {
  setTimeout(() => {
    let rootElement = document.getElementById("root");
    if (!rootElement) return;

    if (
      window.location.href.includes("specai-page") ||
      window.location.href.includes("specai-component")
    ) {
      const domStructure = getDomInfo(rootElement);
      sendMessageToParent("DOM_STRUCTURE", domStructure);
      console.log(domStructure);
    }
  }, 100);
};

window.addEventListener("load", () => {
  handleError();
  initDomObserver();
});
