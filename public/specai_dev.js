const style = document.createElement("style");
style.innerText = "specai-tag-start, specai-tag-end {display: none;}";
document.body.appendChild(style);

const sendMessageToParent = (type, data) => {
  if (window.parent) {
    window.parent.postMessage({ type, data }, "*");
  }
};

// Get all parent dora-ids
const getAllDoraIds = (element) => {
  const allDoraIds = [];
  let prevSibling = element.previousElementSibling;

  while (prevSibling) {
    if (prevSibling.tagName.toLowerCase() === "specai-tag-start") {
      const doraId = prevSibling.getAttribute("data-spec-id");
      if (doraId) {
        allDoraIds.unshift(doraId);
      }
    } else {
      break;
    }
    prevSibling = prevSibling.previousElementSibling;
  }

  const doraId = element.getAttribute("data-spec-id");
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

  const children = Array.from(element.children)
    .filter((node) => {
      const tagName = node.tagName.toLowerCase();
      return tagName !== "specai-tag-start" && tagName !== "specai-tag-end";
    })
    .map((node) => getDomInfo(node));

  const ids = getAllDoraIds(element);

  const res = {
    nodeType: "element",
    tagName: element.tagName.toLowerCase(),
    componentName: element.tagName,
    id: ids[0] || "",
    allIds: ids,
    position,
    size,
    children,
  };

  if (element.hasAttribute("data-component-container")) {
    res["componentContainerWidth"] = element.scrollWidth + 160;
  }

  return res;
};

const sendDomStructure = () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const domStructure = getDomInfo(rootElement);

    if (!domStructure.size.width && !domStructure.size.height) {
      return;
    }

    const viewportSize = {
      width: Math.max(
        document.documentElement.clientWidth,
        document.documentElement.scrollWidth,
        document.documentElement.offsetWidth
      ),
      height: Math.max(
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        1280
      ),
    };

    sendMessageToParent("DOM_STRUCTURE", {
      structure: domStructure,
      viewport: viewportSize,
    });

    return domStructure;
  }
};

// Handle viewport commands
window.addEventListener("message", (event) => {
  if (event.data.type === "REQUEST_DOM_STRUCTURE") {
    const struct = sendDomStructure();
  }
});

// Initialize
function onLoad(ms) {
  setTimeout(() => {
    const struct = sendDomStructure();

    if (!struct || !struct.children.length) {
      onLoad(2000);
    }
  }, ms);
}

onLoad(500);
