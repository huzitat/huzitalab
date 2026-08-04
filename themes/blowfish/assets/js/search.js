var fuse;
var showButton = document.getElementById("search-button");
var showButtonMobile = document.getElementById("search-button-mobile");
var hideButton = document.getElementById("close-search-button");
var wrapper = document.getElementById("search-wrapper");
var modal = document.getElementById("search-modal");
var input = document.getElementById("search-query");
var output = document.getElementById("search-results");
var first = output.firstChild;
var last = output.lastChild;
var searchVisible = false;
var indexed = false;
var hasResults = false;

// Listen for events
showButton ? showButton.addEventListener("click", displaySearch) : null;
showButtonMobile ? showButtonMobile.addEventListener("click", displaySearch) : null;
hideButton.addEventListener("click", hideSearch);
wrapper.addEventListener("click", hideSearch);
modal.addEventListener("click", function (event) {
  event.stopPropagation();
  event.stopImmediatePropagation();
  return false;
});
document.addEventListener("keydown", function (event) {
  // Forward slash to open search wrapper
  if (event.key == "/") {
    const active = document.activeElement;
    const tag = active.tagName;
    const isInputField = tag === "INPUT" || tag === "TEXTAREA" || active.isContentEditable;

    if (!searchVisible && !isInputField) {
      event.preventDefault();
      displaySearch();
    }
  }

  // Esc to close search wrapper
  if (event.key == "Escape") {
    hideSearch();
  }

  // Down arrow to move down results list
  if (event.key == "ArrowDown") {
    if (searchVisible && hasResults) {
      event.preventDefault();
      if (document.activeElement == input) {
        first.focus();
      } else if (document.activeElement == last) {
        last.focus();
      } else {
        document.activeElement.parentElement.nextSibling.firstElementChild.focus();
      }
    }
  }

  // Up arrow to move up results list
  if (event.key == "ArrowUp") {
    if (searchVisible && hasResults) {
      event.preventDefault();
      if (document.activeElement == input) {
        input.focus();
      } else if (document.activeElement == first) {
        input.focus();
      } else {
        document.activeElement.parentElement.previousSibling.firstElementChild.focus();
      }
    }
  }

  // Enter to get to results
  if (event.key == "Enter") {
    if (searchVisible && hasResults) {
      event.preventDefault();
      if (document.activeElement == input) {
        first.focus();
      } else {
        document.activeElement.click();
      }
    }
  }
});

// Update search on each keypress
input.onkeyup = function (event) {
  executeQuery(this.value);
};

function displaySearch() {
  if (!indexed) {
    buildIndex();
  }
  if (!searchVisible) {
    document.body.style.overflow = "hidden";
    wrapper.style.visibility = "visible";
    input.focus();
    searchVisible = true;
  }
}

function hideSearch() {
  if (searchVisible) {
    document.body.style.overflow = "visible";
    wrapper.style.visibility = "hidden";
    input.value = "";
    output.innerHTML = "";
    document.activeElement.blur();
    searchVisible = false;
  }
}

function fetchJSON(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}

function buildIndex() {
  var baseURL = wrapper.getAttribute("data-url");
  baseURL = baseURL.replace(/\/?$/, "/");
  fetchJSON(baseURL + "index.json", function (data) {
    var options = {
      shouldSort: true,
      ignoreLocation: true,
      threshold: 0.0,
      includeMatches: true,
      keys: [
        { name: "title", weight: 0.8 },
        { name: "section", weight: 0.2 },
        { name: "summary", weight: 0.6 },
        { name: "content", weight: 0.4 },
      ],
    };
    /*var finalIndex = [];
    for (var i in data) {
      if(data[i].type != "users" && data[i].type != "tags" && data[i].type != "categories"){
        finalIndex.push(data[i]);
      }
    }*/
    fuse = new Fuse(data, options);
    indexed = true;
  });
}

function executeQuery(term) {
  if (!indexed) {
    buildIndex();
  }
  if (!fuse) {
    return;
  }
  let results = fuse.search(term);

  output.textContent = "";

  if (results.length > 0) {
    var fragment = document.createDocumentFragment();
    results.forEach(function (value, key) {
      var html = value.item.summary;
      var div = document.createElement("div");
      div.innerHTML = html;
      var summaryText = div.textContent || div.innerText || "";

      var li = document.createElement("li");
      li.className = "mb-2";

      var a = document.createElement("a");
      a.className =
        "flex items-center px-3 py-2 rounded-md appearance-none bg-neutral-100 dark:bg-neutral-700 focus:bg-primary-100 hover:bg-primary-100 dark:hover:bg-primary-900 dark:focus:bg-primary-900 focus:outline-dotted focus:outline-transparent focus:outline-2";
      a.setAttribute("tabindex", "0");
      if (value.item.externalUrl) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
        a.href = value.item.externalUrl;
      } else {
        a.href = value.item.permalink;
      }

      var grow = document.createElement("div");
      grow.className = "grow";

      var titleDiv = document.createElement("div");
      titleDiv.className = "-mb-1 text-lg font-bold";
      titleDiv.textContent = value.item.title;
      if (value.item.externalUrl) {
        var externalSpan = document.createElement("span");
        externalSpan.className =
          "text-xs ml-2 align-center cursor-default text-neutral-400 dark:text-neutral-500";
        externalSpan.textContent = value.item.externalUrl;
        titleDiv.appendChild(externalSpan);
      }

      var metaDiv = document.createElement("div");
      metaDiv.className = "text-sm text-neutral-500 dark:text-neutral-400";
      metaDiv.appendChild(document.createTextNode(value.item.section));
      var dotSpan = document.createElement("span");
      dotSpan.className = "px-2 text-primary-500";
      dotSpan.innerHTML = "&middot;";
      metaDiv.appendChild(dotSpan);
      metaDiv.appendChild(document.createTextNode(value.item.date ? value.item.date : ""));

      var summaryDiv = document.createElement("div");
      summaryDiv.className = "text-sm italic";
      summaryDiv.textContent = summaryText;

      grow.appendChild(titleDiv);
      grow.appendChild(metaDiv);
      grow.appendChild(summaryDiv);

      var rightArrow = document.createElement("div");
      rightArrow.className = "ml-2 ltr:block rtl:hidden text-neutral-500";
      rightArrow.innerHTML = "&rarr;";

      var leftArrow = document.createElement("div");
      leftArrow.className = "mr-2 ltr:hidden rtl:block text-neutral-500";
      leftArrow.innerHTML = "&larr;";

      a.appendChild(grow);
      a.appendChild(rightArrow);
      a.appendChild(leftArrow);
      li.appendChild(a);
      fragment.appendChild(li);
    });
    output.appendChild(fragment);
    hasResults = true;
  } else {
    hasResults = false;
  }

  if (results.length > 0 && output.firstChild) {
    first = output.firstChild.firstElementChild;
    last = output.lastChild.firstElementChild;
  }
}
