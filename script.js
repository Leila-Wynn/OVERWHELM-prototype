/* ==========================================
   OVERWHELM V3
   LOCAL FUNCTIONAL PROTOTYPE
========================================== */


/* ==========================
   APP STATE
========================== */

const state = {

  tasks: [],

  activeTasks: [],

  currentTask: null,

  currentStep: 0

};


/* ==========================
   ELEMENTS
========================== */

const stressInput =
  document.getElementById(
    "stressInput"
  );


const organizeButton =
  document.getElementById(
    "organizeButton"
  );


const dumpMessage =
  document.getElementById(
    "dumpMessage"
  );


const resultsSection =
  document.getElementById(
    "resultsSection"
  );


const homeTasks =
  document.getElementById(
    "homeTasks"
  );


const planTasks =
  document.getElementById(
    "planTasks"
  );


const capacityLabel =
  document.getElementById(
    "capacityLabel"
  );


const capacityHeading =
  document.getElementById(
    "capacityHeading"
  );


const intervention =
  document.getElementById(
    "intervention"
  );


const interventionText =
  document.getElementById(
    "interventionText"
  );


const focusTaskTitle =
  document.getElementById(
    "focusTaskTitle"
  );


const focusDeadline =
  document.getElementById(
    "focusDeadline"
  );


const focusPercent =
  document.getElementById(
    "focusPercent"
  );


const focusProgressRing =
  document.getElementById(
    "focusProgressRing"
  );


const stepList =
  document.getElementById(
    "stepList"
  );


const finishStepButton =
  document.getElementById(
    "finishStepButton"
  );


const viewPlanButton =
  document.getElementById(
    "viewPlanButton"
  );


/* ==========================
   DATE SETUP
========================== */

const today =
  new Date();


const months = [

  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"

];


const weekdays = [

  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"

];


document.getElementById(
  "todayNumber"
).textContent =

  String(
    today.getDate()
  ).padStart(2, "0");


document.getElementById(
  "todayMonth"
).textContent =

  months[
    today.getMonth()
  ];


document.getElementById(
  "todayWeekday"
).textContent =

  weekdays[
    today.getDay()
  ];


document.getElementById(
  "monthTitle"
).textContent =

  months[
    today.getMonth()
  ];



/* ==========================
   CALENDARS
========================== */

function drawCalendar(
  elementID
) {

  const calendar =
    document.getElementById(
      elementID
    );


  calendar.innerHTML = "";


  const year =
    today.getFullYear();


  const month =
    today.getMonth();


  const numberOfDays =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  for (
    let day = 1;
    day <= numberOfDays;
    day++
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "calendar-day";


    button.textContent =
      day;


    const matchingTasks =
      state.tasks.filter(
        task => {

          if (
            !task.deadline
          ) {
            return false;
          }


          return (

            task.deadline
              .getDate()
              === day

            &&

            task.deadline
              .getMonth()
              === month

          );

        }
      );


    if (
      matchingTasks.length > 0
    ) {

      const urgent =
        matchingTasks.some(
          task =>
            task.priorityLevel
            === "urgent"
        );


      button.classList.add(
        urgent
          ? "urgent"
          : "deadline"
      );


      button.setAttribute(

        "aria-label",

        `${months[month]} ${day}.
        ${matchingTasks.length}
        deadline${matchingTasks.length > 1 ? "s" : ""}.`

      );

    }

    else {

      button.setAttribute(

        "aria-label",

        `${months[month]} ${day}.
        No known deadline.`

      );

    }


    if (
      day === today.getDate()
    ) {

      button.classList.add(
        "selected"
      );

    }


    calendar.appendChild(
      button
    );

  }

}


drawCalendar(
  "homeCalendar"
);


drawCalendar(
  "planCalendar"
);



/* ==========================
   READ USER'S DUMP
========================== */

function extractTasks(
  text
) {

  /*
    This is a prototype parser.

    Eventually the real app could
    use an AI/NLP service.

    For now we make the prototype
    actually respond without
    needing a server.
  */


  const cleaned =
    text
      .replace(/\n+/g, ". ")
      .replace(/\s+/g, " ")
      .trim();


  /*
    Break the dump into likely
    responsibilities.
  */

  let pieces =
    cleaned.split(
      /[.!?;]+/
    );


  pieces =
    pieces
      .map(
        item =>
          item.trim()
      )
      .filter(
        item =>
          item.length > 3
      );


  /*
    If user used one giant
    run-on sentence, split some
    "and I..." phrases too.
  */

  let expanded = [];


  pieces.forEach(
    piece => {

      const smaller =
        piece.split(
          /\s+(?:and|also)\s+(?=I\s|my\s|the\s)/i
        );


      expanded.push(
        ...smaller
      );

    }
  );


  return expanded
    .map(
      sentence =>
        createTaskFromSentence(
          sentence
        )
    )
    .filter(Boolean);

}



/* ==========================
   CREATE TASK OBJECT
========================== */

function createTaskFromSentence(
  sentence
) {

  const lower =
    sentence.toLowerCase();


  /*
    Ignore sentences that don't
    look like responsibilities.
  */

  const taskWords = [

    "need",
    "have to",
    "must",
    "finish",
    "complete",
    "submit",
    "work on",
    "study",
    "write",
    "clean",
    "application",
    "assignment",
    "project",
    "homework",
    "module",
    "essay",
    "paper",
    "proposal"

  ];


  const looksLikeTask =
    taskWords.some(
      word =>
        lower.includes(
          word
        )
    );


  if (
    !looksLikeTask
  ) {

    return null;

  }


  const deadline =
    detectDeadline(
      sentence
    );


  const timeline =
    detectTimeline(
      sentence
    );


  const minutes =
    detectDuration(
      sentence
    );


  const title =
    cleanTaskTitle(
      sentence
    );


  return {

    id:
      crypto.randomUUID
        ? crypto.randomUUID()
        : String(
            Date.now()
            + Math.random()
          ),

    title,

    original:
      sentence,

    deadline,

    timeline,

    estimatedMinutes:
      minutes,

    completed:
      false,

    progress:
      0,

    steps:
      generateSteps(
        title
      )

  };

}



/* ==========================
   CLEAN TASK NAME
========================== */

function cleanTaskTitle(
  sentence
) {

  let result =
    sentence;


  result =
    result.replace(

      /^(i\s+(need|have|have to|must|should)\s+(to\s+)?)/i,

      ""

    );


  result =
    result.replace(

      /\b(due|by|before)\b.+$/i,

      ""

    );


  result =
    result.replace(

      /\b(today|tomorrow|this week|next week|soon|eventually)\b.*$/i,

      ""

    );


  result =
    result.replace(

      /\b(and\s+)?(it\s+)?(takes?|needs?)\s+(about\s+)?\d+.+$/i,

      ""

    );


  result =
    result.trim();


  if (
    !result
  ) {

    result =
      sentence.trim();

  }


  return (
    result.charAt(0)
      .toUpperCase()
    +
    result.slice(1)
  );

}



/* ==========================
   FIND DURATION
========================== */

function detectDuration(
  sentence
) {

  const hourMatch =
    sentence.match(

      /(\d+(?:\.\d+)?)\s*(hours?|hrs?|hr)\b/i

    );


  if (
    hourMatch
  ) {

    return Math.round(

      parseFloat(
        hourMatch[1]
      )
      * 60

    );

  }


  const minuteMatch =
    sentence.match(

      /(\d+)\s*(minutes?|mins?|min)\b/i

    );


  if (
    minuteMatch
  ) {

    return parseInt(
      minuteMatch[1]
    );

  }


  /*
    Prototype default.

    User can correct this later.
  */

  return 60;

}



/* ==========================
   TIMELINE
========================== */

function detectTimeline(
  sentence
) {

  const lower =
    sentence.toLowerCase();


  if (
    lower.includes(
      "today"
    )
  ) {

    return "Today";

  }


  if (
    lower.includes(
      "this week"
    )
  ) {

    return "This week";

  }


  if (
    lower.includes(
      "soon"
    )
  ) {

    return "Soon";

  }


  if (
    lower.includes(
      "eventually"
    )
  ) {

    return "Eventually";

  }


  return null;

}



/* ==========================
   FIND DEADLINE
========================== */

function detectDeadline(
  sentence
) {

  const lower =
    sentence.toLowerCase();


  /*
    Today
  */

  if (
    /\btoday\b/i.test(
      sentence
    )
  ) {

    return endOfDay(
      new Date()
    );

  }


  /*
    Tomorrow
  */

  if (
    /\btomorrow\b/i.test(
      sentence
    )
  ) {

    const tomorrow =
      new Date();


    tomorrow.setDate(
      tomorrow.getDate()
      + 1
    );


    return endOfDay(
      tomorrow
    );

  }


  /*
    Month name + date.

    Examples:

    September 6
    Sep 6
    Sep 6 at 11:59 PM
  */

  const monthPattern =

    /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i;


  const match =
    sentence.match(
      monthPattern
    );


  if (
    match
  ) {

    const monthLookup = {

      jan: 0,
      january: 0,

      feb: 1,
      february: 1,

      mar: 2,
      march: 2,

      apr: 3,
      april: 3,

      may: 4,

      jun: 5,
      june: 5,

      jul: 6,
      july: 6,

      aug: 7,
      august: 7,

      sep: 8,
      sept: 8,
      september: 8,

      oct: 9,
      october: 9,

      nov: 10,
      november: 10,

      dec: 11,
      december: 11

    };


    const monthIndex =
      monthLookup[
        match[1]
          .toLowerCase()
      ];


    const day =
      Number(
        match[2]
      );


    let hour =
      match[3]
        ? Number(
            match[3]
          )
        : 23;


    const minute =
      match[4]
        ? Number(
            match[4]
          )
        : 59;


    const ampm =
      match[5]
        ? match[5]
            .toLowerCase()
        : null;


    if (
      ampm === "pm"
      &&
      hour !== 12
    ) {

      hour += 12;

    }


    if (
      ampm === "am"
      &&
      hour === 12
    ) {

      hour = 0;

    }


    let year =
      today.getFullYear();


    const deadline =
      new Date(

        year,

        monthIndex,

        day,

        hour,

        minute

      );


    /*
      If date already passed,
      assume next year.
    */

    if (
      deadline < today
      &&
      monthIndex
      < today.getMonth()
    ) {

      deadline.setFullYear(
        year + 1
      );

    }


    return deadline;

  }


  return null;

}



/* ==========================
   END OF DAY
========================== */

function endOfDay(
  date
) {

  const result =
    new Date(
      date
    );


  result.setHours(
    23,
    59,
    0,
    0
  );


  return result;

}



/* ==========================
   PRIORITIZATION
========================== */

function calculatePriority(
  task
) {

  let score = 0;


  /*
    Exact deadlines have
    strongest influence.
  */

  if (
    task.deadline
  ) {

    const remainingMinutes =

      (
        task.deadline
        - new Date()
      )
      /
      60000;


    const slack =
      remainingMinutes
      -
      task.estimatedMinutes;


    /*
      Deadline is impossible /
      extremely tight.
    */

    if (
      slack <= 0
    ) {

      score += 1000;

      task.priorityLevel =
        "urgent";

    }


    else if (
      remainingMinutes
      <= 1440
    ) {

      score += 800;

      task.priorityLevel =
        "urgent";

    }


    else if (
      remainingMinutes
      <= 4320
    ) {

      score += 600;

      task.priorityLevel =
        "urgent";

    }


    else if (
      remainingMinutes
      <= 10080
    ) {

      score += 400;

      task.priorityLevel =
        "soon";

    }


    else {

      score += 200;

      task.priorityLevel =
        "later";

    }


    /*
      Less available slack =
      higher urgency.
    */

    score +=
      Math.max(
        0,
        300
        -
        (
          slack / 60
        )
      );

  }


  /*
    No exact deadline:
    use timeline.
  */

  else {

    const timelineScore = {

      "Today": 350,
      "This week": 230,
      "Soon": 140,
      "Eventually": 30

    };


    score +=
      timelineScore[
        task.timeline
      ]
      || 60;


    if (
      task.timeline ===
      "Today"
    ) {

      task.priorityLevel =
        "urgent";

    }

    else if (
      task.timeline ===
      "This week"
      ||
      task.timeline ===
      "Soon"
    ) {

      task.priorityLevel =
        "soon";

    }

    else {

      task.priorityLevel =
        "later";

    }

  }


  /*
    If priority is otherwise
    similar, shorter task wins.

    This reflects YOUR rule.
  */

  score +=
    Math.max(
      0,
      100
      -
      task.estimatedMinutes
    );


  task.priorityScore =
    score;


  return score;

}



/* ==========================
   ORGANIZE
========================== */

function organizeDump() {

  const text =
    stressInput.value.trim();


  if (
    !text
  ) {

    dumpMessage.textContent =
      "Tell me what's crowding your head first.";

    stressInput.focus();

    return;

  }


  const tasks =
    extractTasks(
      text
    );


  if (
    tasks.length === 0
  ) {

    dumpMessage.textContent =
      "I couldn't find a clear responsibility yet. Try mentioning what needs to get done.";

    return;

  }


  tasks.forEach(
    calculatePriority
  );


  tasks.sort(
    (
      first,
      second
    ) =>
      second.priorityScore
      -
      first.priorityScore
  );


  /*
    HARD CAPACITY RULE.

    Only 3 are active.
  */

  state.tasks =
    tasks;


  state.activeTasks =
    tasks.slice(
      0,
      3
    );


  state.currentTask =
    state.activeTasks[0]
    || null;


  state.currentStep =
    0;


  dumpMessage.textContent =
    `I found ${tasks.length} responsibility${tasks.length === 1 ? "" : "ies"}. I'm only showing what needs your attention.`;


  resultsSection
    .classList
    .remove(
      "hidden"
    );


  renderEverything();


  resultsSection
    .scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

}



/* ==========================
   TASK CARDS
========================== */

function createTaskCard(
  task,
  index,
  clickable = true
) {

  const card =
    document.createElement(
      "button"
    );


  card.type =
    "button";


  card.className =
    "task-card";


  if (
    index === 0
  ) {

    card.classList.add(
      "first"
    );

  }


  const deadlineText =
    getTaskDeadlineText(
      task
    );


  const durationText =
    formatDuration(
      task.estimatedMinutes
    );


  card.innerHTML = `

    <span class="priority-number">
      ${index + 1}
    </span>

    <span class="task-main">

      <strong>
        ${escapeHTML(task.title)}
      </strong>

      <p>
        ${deadlineText}
      </p>

      <small>
        About ${durationText}
        ${index === 0 ? " · Do this first" : ""}
      </small>

    </span>

    <span
      class="task-status
      ${task.priorityLevel}"
    >

      ${
        task.priorityLevel
          === "urgent"
        ? "! Urgent"
        :
        task.priorityLevel
          === "soon"
        ? "Soon"
        :
        "Later"
      }

    </span>

  `;


  if (
    clickable
  ) {

    card.addEventListener(
      "click",
      () => {

        state.currentTask =
          task;


        state.currentStep =
          Math.floor(

            (
              task.progress
              / 100
            )

            *

            task.steps.length

          );


        renderFocus();


        showScreen(
          "focusScreen"
        );

      }
    );

  }


  return card;

}



/* ==========================
   RENDER TASKS
========================== */

function renderTaskLists() {

  homeTasks.innerHTML =
    "";


  planTasks.innerHTML =
    "";


  state.activeTasks.forEach(
    (
      task,
      index
    ) => {

      homeTasks.appendChild(

        createTaskCard(
          task,
          index
        )

      );


      planTasks.appendChild(

        createTaskCard(
          task,
          index
        )

      );

    }
  );


  capacityLabel.textContent =
    `${state.activeTasks.length} / 3`;


  capacityHeading.textContent =
    `${state.activeTasks.length} of 3 tasks`;

}



/* ==========================
   DEADLINE INTERVENTION
========================== */

function renderIntervention() {

  const first =
    state.activeTasks[0];


  if (
    !first
  ) {

    intervention
      .classList
      .add(
        "hidden"
      );

    return;

  }


  if (
    first.priorityLevel
    === "urgent"
  ) {

    intervention
      .classList
      .remove(
        "hidden"
      );


    interventionText
      .textContent =

      `${first.title} needs attention first. I rearranged your active workload.`;

  }

  else {

    intervention
      .classList
      .add(
        "hidden"
      );

  }

}



/* ==========================
   PLAN PROGRESS
========================== */

function renderPlanProgress() {

  if (
    state.activeTasks.length
    === 0
  ) {

    return;

  }


  const totalProgress =

    state.activeTasks.reduce(

      (
        total,
        task
      ) =>
        total
        +
        task.progress,

      0

    );


  const percent =
    Math.round(

      totalProgress
      /
      state.activeTasks.length

    );


  document
    .getElementById(
      "planPercent"
    )
    .textContent =

    `${percent}%`;


  document
    .getElementById(
      "planProgress"
    )
    .style
    .setProperty(

      "--percent",

      percent

    );

}



/* ==========================
   FOCUS SCREEN
========================== */

function renderFocus() {

  const task =
    state.currentTask;


  const workspace =
    document.getElementById(
      "focusWorkspace"
    );


  const empty =
    document.getElementById(
      "emptyFocus"
    );


  if (
    !task
  ) {

    workspace
      .classList
      .add(
        "hidden"
      );


    empty
      .classList
      .remove(
        "hidden"
      );


    return;

  }


  workspace
    .classList
    .remove(
      "hidden"
    );


  empty
    .classList
    .add(
      "hidden"
    );


  focusTaskTitle
    .textContent =
    task.title;


  focusDeadline
    .textContent =
    getTaskDeadlineText(
      task
    );


  focusPercent
    .textContent =
    `${task.progress}%`;


  focusProgressRing
    .style
    .setProperty(

      "--percent",

      task.progress

    );


  renderSteps(
    task
  );

}



/* ==========================
   STEPS
========================== */

function generateSteps(
  title
) {

  const lower =
    title.toLowerCase();


  if (
    lower.includes(
      "essay"
    )
    ||
    lower.includes(
      "paper"
    )
    ||
    lower.includes(
      "proposal"
    )
  ) {

    return [

      "Understand the requirements",
      "Gather what you need",
      "Create the first draft",
      "Review and finish"

    ];

  }


  if (
    lower.includes(
      "application"
    )
  ) {

    return [

      "Open the application",
      "Gather required information",
      "Complete the main sections",
      "Review before submitting"

    ];

  }


  if (
    lower.includes(
      "clean"
    )
    ||
    lower.includes(
      "room"
    )
  ) {

    return [

      "Clear obvious trash",
      "Put loose items together",
      "Return items to their places",
      "Finish the remaining area"

    ];

  }


  return [

    "Open what you need",
    "Start the first part",
    "Finish the main work",
    "Check and complete"

  ];

}



function renderSteps(
  task
) {

  stepList.innerHTML =
    "";


  task.steps.forEach(
    (
      text,
      index
    ) => {

      const step =
        document.createElement(
          "div"
        );


      step.className =
        "step";


      if (
        index
        <
        state.currentStep
      ) {

        step.classList.add(
          "completed"
        );

      }


      if (
        index
        ===
        state.currentStep
      ) {

        step.classList.add(
          "current"
        );

      }


      step.innerHTML = `

        <span class="step-number">

          ${
            index
            <
            state.currentStep
              ? "✓"
              : index + 1
          }

        </span>

        ${escapeHTML(text)}

      `;


      stepList.appendChild(
        step
      );

    }
  );

}



/* ==========================
   COMPLETE STEP
========================== */

finishStepButton
  .addEventListener(
    "click",
    () => {

      const task =
        state.currentTask;


      if (
        !task
      ) {
        return;
      }


      if (
        state.currentStep
        <
        task.steps.length
      ) {

        state.currentStep++;

      }


      task.progress =
        Math.min(

          100,

          Math.round(

            (
              state.currentStep
              /
              task.steps.length
            )

            *

            100

          )

        );


      if (
        task.progress
        >= 100
      ) {

        task.completed =
          true;


        state.activeTasks =
          state.activeTasks.filter(

            item =>
              item.id
              !==
              task.id

          );


        /*
          Bring the next waiting
          responsibility into
          active capacity.
        */

        const nextWaiting =
          state.tasks.find(

            item =>
              !item.completed
              &&
              !state.activeTasks
                .some(
                  active =>
                    active.id
                    === item.id
                )

          );


        if (
          nextWaiting
          &&
          state.activeTasks.length
          < 3
        ) {

          state.activeTasks.push(
            nextWaiting
          );

        }


        state.currentTask =
          state.activeTasks[0]
          || null;


        state.currentStep =
          0;


        renderEverything();


        return;

      }


      renderEverything();

    }
  );



/* ==========================
   TEXT HELPERS
========================== */

function getTaskDeadlineText(
  task
) {

  if (
    task.deadline
  ) {

    return `Due ${
      task.deadline
        .toLocaleDateString(
          undefined,
          {
            month:
              "short",

            day:
              "numeric",

            hour:
              "numeric",

            minute:
              "2-digit"
          }
        )
    }`;

  }


  if (
    task.timeline
  ) {

    return `Timeline: ${task.timeline}`;

  }


  return "No exact deadline yet";

}



function formatDuration(
  minutes
) {

  if (
    minutes < 60
  ) {

    return `${minutes} min`;

  }


  const hours =
    minutes / 60;


  if (
    Number.isInteger(
      hours
    )
  ) {

    return `${hours} hr`;

  }


  return `${hours.toFixed(1)} hr`;

}



/* ==========================
   RENDER EVERYTHING
========================== */

function renderEverything() {

  drawCalendar(
    "homeCalendar"
  );


  drawCalendar(
    "planCalendar"
  );


  renderTaskLists();


  renderIntervention();


  renderPlanProgress();


  renderFocus();

}



/* ==========================
   NAVIGATION
========================== */

function showScreen(
  screenID
) {

  document
    .querySelectorAll(
      ".screen"
    )
    .forEach(
      screen => {

        screen.classList.remove(
          "active"
        );

      }
    );


  document
    .getElementById(
      screenID
    )
    .classList.add(
      "active"
    );


  document
    .querySelectorAll(
      ".nav-button"
    )
    .forEach(
      button => {

        button.classList.toggle(

          "active",

          button.dataset.target
          ===
          screenID

        );

      }
    );


  window.scrollTo(
    0,
    0
  );

}



document
  .querySelectorAll(
    "[data-target]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          showScreen(
            button.dataset.target
          );

        }
      );

    }
  );



/* ==========================
   QUICK DUMP
========================== */

document
  .getElementById(
    "quickDump"
  )
  .addEventListener(
    "click",
    () => {

      showScreen(
        "homeScreen"
      );


      setTimeout(
        () => {

          stressInput.focus();

        },
        100
      );

    }
  );



/* ==========================
   VIEW PLAN
========================== */

viewPlanButton
  .addEventListener(
    "click",
    () => {

      showScreen(
        "planScreen"
      );

    }
  );



/* ==========================
   ORGANIZE BUTTON
========================== */

organizeButton
  .addEventListener(
    "click",
    organizeDump
  );



/* ==========================
   SECURITY
========================== */

function escapeHTML(
  value
) {

  return value

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}