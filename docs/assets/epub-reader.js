const status = document.getElementById("status");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const chapterSelect = document.getElementById("chapter-select");
const viewer = document.getElementById("viewer");
const turnSheet = document.getElementById("turn-sheet");

async function openEpub() {
  try {
    const spreadQuery = window.matchMedia("(min-width: 760px)");
    const book = ePub("./Introduction-to-Statistics-Praticum.epub");
    const rendition = book.renderTo("viewer", {
      width: "100%",
      height: "100%",
      flow: "paginated",
      spread: spreadQuery.matches ? "always" : "none",
    });

    const updateSpread = () => {
      viewer.classList.toggle("is-spread", spreadQuery.matches);
      viewer.classList.toggle("is-single", !spreadQuery.matches);
      rendition.spread(spreadQuery.matches ? "always" : "none");
    };
    updateSpread();
    spreadQuery.addEventListener("change", updateSpread);

    await rendition.display();

    const navigation = await book.loaded.navigation;
    chapterSelect.replaceChildren();
    const coverOption = document.createElement("option");
    coverOption.value = "";
    coverOption.textContent = "Sampul";
    chapterSelect.append(coverOption);
    navigation.toc.forEach((chapter) => {
      const option = document.createElement("option");
      option.value = chapter.href;
      option.textContent = chapter.label.trim();
      chapterSelect.append(option);
    });
    chapterSelect.disabled = false;
    previous.disabled = false;
    next.disabled = false;
    status.textContent = "";

    const turnPage = async (direction) => {
      viewer.classList.remove("turn-next", "turn-prev");
      void turnSheet.offsetWidth;
      viewer.classList.add(direction === "next" ? "turn-next" : "turn-prev");

      try {
        if (direction === "next") {
          await rendition.next();
        } else {
          await rendition.prev();
        }
      } finally {
        window.setTimeout(() => {
          viewer.classList.remove("turn-next", "turn-prev");
        }, 500);
      }
    };

    previous.addEventListener("click", () => turnPage("prev"));
    next.addEventListener("click", () => turnPage("next"));
    chapterSelect.addEventListener("change", () => {
      if (chapterSelect.value) {
        rendition.display(chapterSelect.value);
      }
    });
    const updateLocation = (location) => {
      if (!location) {
        return;
      }
      const currentHref = location.start.href.split("#")[0];
      const chapter = navigation.toc.find(
        (item) => item.href.split("#")[0] === currentHref,
      );
      if (chapter) {
        chapterSelect.value = chapter.href;
      }
      const page = location.start.displayed;
      status.textContent = page
        ? `Halaman ${page.page} dari ${page.total} pada bagian ini`
        : "";
    };
    rendition.on("relocated", updateLocation);
    updateLocation(rendition.currentLocation());
  } catch (error) {
    console.error("Gagal memuat pratinjau EPUB.", error);
    status.textContent =
      "Pratinjau EPUB gagal dimuat. Anda masih dapat mengunduh file EPUB.";
    previous.disabled = true;
    next.disabled = true;
  }
}

openEpub();
