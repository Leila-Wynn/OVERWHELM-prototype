const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll("[data-screen]");
const normalNavButtons = document.querySelectorAll(".nav-button");

function showScreen(screenName) {

  screens.forEach((screen) => {
    screen.classList.remove("active");
  });

  document
    .getElementById(screenName)
    .classList.add("active");


  normalNavButtons.forEach((button) => {

    if (button.dataset.screen === screenName) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }

  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* NAVIGATION */

navButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const target =
      button.dataset.screen;

    showScreen(target);

  });

});


/* CLICK TASK → FOCUS */

document
  .querySelectorAll(".focus-link")
  .forEach((task) => {

    task.addEventListener("click", () => {

      showScreen("focus");

    });

  });


/* CALENDAR */

function createCalendar(id) {

  const calendar =
    document.getElementById(id);

  for (let day = 1; day <= 30; day++) {

    const button =
      document.createElement("button");

    button.classList.add("calendar-day");

    button.textContent = day;

    /* Example deadline days */

    if (day === 6) {
      button.classList.add("urgent");
    }

    if (
      day === 11 ||
      day === 18
    ) {
      button.classList.add("deadline");
    }

    if (day === 3) {
      button.classList.add("selected");
    }


    button.addEventListener(
      "click",
      () => {

        calendar
          .querySelectorAll(
            ".calendar-day"
          )
          .forEach((date) => {

            date.classList.remove(
              "selected"
            );

          });

        button.classList.add(
          "selected"
        );

      }
    );


    calendar.appendChild(button);

  }
}


createCalendar("homeCalendar");
createCalendar("planCalendar");


/* DUMP */

const organizeButton =
  document.getElementById(
    "organizeButton"
  );

const dumpInput =
  document.getElementById(
    "dumpInput"
  );

const dumpMessage =
  document.getElementById(
    "dumpMessage"
  );


organizeButton.addEventListener(
  "click",
  () => {

    const text =
      dumpInput.value.trim();

    if (!text) {

      dumpMessage.textContent =
        "Dump everything first.";

      dumpInput.focus();

      return;
    }


    dumpMessage.textContent =
      "Got it. I'm reducing what you need to deal with.";

    setTimeout(() => {

      showScreen("plan");

    }, 600);

  }
);