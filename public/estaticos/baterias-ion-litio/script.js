(function () {
  "use strict";

  const root = document.getElementById("cbattery");
  if (!root) return;

  const accordion = root.querySelector(".cbattery_accordion");
  const items = Array.from(root.querySelectorAll(".cbattery_item"));
  const dd = root.querySelector("#cbatteryDd");
  const ddToggle = root.querySelector("#cbatteryDdToggle");
  const ddCurrent = root.querySelector("#cbatteryDdCurrent");
  const ddList = root.querySelector("#cbatteryDdList");
  const ddItems = Array.from(root.querySelectorAll(".cbattery_dd_item"));
  const image = root.querySelector("#cbatteryImage");
  const mobileContent = root.querySelector("#cbatteryMobileContent");
  const mobileTitle = mobileContent.querySelector(".cbattery_mobile_content_title");
  const mobileBody = mobileContent.querySelector(".cbattery_mobile_content_body");
  const defaultImage = "images/bateria.png";
  const isEn = document.documentElement.lang === "en";
  const defaultAlt = isEn
    ? "Illustration of a lithium-ion battery"
    : "Ilustración de una batería de ion de litio";
  // El layout de escritorio entra en 700px (ver styles.css)
  const mobileQuery = window.matchMedia("(max-width: 699px)");
  let activeKey = "";
  // Marca si el consejo activo lo puso el propio módulo (default en móvil) en
  // lugar del usuario, para poder deshacerlo al pasar a escritorio.
  let autoSelected = false;

  const itemByKey = new Map(items.map(function (item) {
    return [item.dataset.key, item];
  }));

  items.forEach(function (item) {
    const preload = new Image();
    preload.src = item.dataset.image;
  });

  function titleOf(item) {
    return item.querySelector(".cbattery_item_button span").textContent;
  }

  function updateImage(item) {
    image.src = item ? item.dataset.image : defaultImage;
    image.alt = item
      ? (isEn ? "Animation for the tip about " : "Animación sobre el consejo de ") + titleOf(item).toLowerCase()
      : defaultAlt;

    if (typeof image.animate === "function") {
      image.animate(
        [{ opacity: 0.35 }, { opacity: 1 }],
        { duration: 220, easing: "ease-out" }
      );
    }
  }

  function updateMobileContent(item) {
    if (!item) {
      mobileContent.hidden = true;
      mobileTitle.textContent = "";
      mobileBody.innerHTML = "";
      return;
    }

    mobileTitle.textContent = titleOf(item);
    mobileBody.innerHTML = item.querySelector(".cbattery_item_body").innerHTML;
    mobileContent.hidden = false;
  }

  // La caja cerrada del desplegable muestra siempre el consejo seleccionado;
  // si no hay ninguno, se cae al primero de la lista.
  function updateDropdown(item) {
    const current = item || items[0];
    ddCurrent.textContent = titleOf(current);
    ddItems.forEach(function (option) {
      option.setAttribute("aria-selected", String(option.dataset.key === current.dataset.key));
    });
  }

  function setDropdownOpen(open) {
    dd.dataset.open = String(open);
    ddToggle.setAttribute("aria-expanded", String(open));
    ddList.hidden = !open;
  }

  function setActive(nextKey, allowToggle) {
    const shouldClose = allowToggle && activeKey === nextKey;
    activeKey = shouldClose ? "" : nextKey;
    const activeItem = activeKey ? itemByKey.get(activeKey) : null;

    accordion.classList.toggle("has-active", Boolean(activeItem));

    items.forEach(function (item) {
      const isActive = item === activeItem;
      const button = item.querySelector(".cbattery_item_button");
      const body = item.querySelector(".cbattery_item_body");

      item.classList.toggle("is-active", isActive);
      button.setAttribute("aria-expanded", String(isActive));
      body.hidden = !isActive;
    });

    updateDropdown(activeItem);
    updateImage(activeItem);
    updateMobileContent(activeItem);
  }

  items.forEach(function (item) {
    item.querySelector(".cbattery_item_button").addEventListener("click", function () {
      autoSelected = false;
      setActive(item.dataset.key, true);
    });
  });

  ddToggle.addEventListener("click", function () {
    setDropdownOpen(dd.dataset.open !== "true");
  });

  ddItems.forEach(function (option) {
    option.addEventListener("click", function () {
      autoSelected = false;
      setActive(option.dataset.key, false);
      setDropdownOpen(false);
      ddToggle.focus();
    });
  });

  document.addEventListener("click", function (event) {
    if (!dd.contains(event.target)) setDropdownOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && dd.dataset.open === "true") {
      setDropdownOpen(false);
      ddToggle.focus();
    }
  });

  // En móvil arranca con el primer consejo seleccionado; en escritorio se
  // mantiene la vista con los cuatro sin desplegar.
  function syncToViewport() {
    if (mobileQuery.matches) {
      if (!activeKey) {
        autoSelected = true;
        setActive(items[0].dataset.key, false);
      }
    } else if (autoSelected) {
      autoSelected = false;
      setActive("", false);
    }
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncToViewport);
  } else {
    mobileQuery.addListener(syncToViewport);
  }

  updateDropdown(null);
  syncToViewport();
})();
