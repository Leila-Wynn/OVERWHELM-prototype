/* ==========================================
   OVERWHELM V4
   FULL FUNCTIONAL PROTOTYPE
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


const phone =
    document.querySelector(
        ".phone"
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


/* Update current date display */

document.getElementById(
    "todayNumber"
).textContent =

    String(
        today.getDate()
    ).padStart(
        2,
        "0"
    );


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
   CALENDAR
========================== */

function drawCalendar(
    elementID
) {

    const calendar =
        document.getElementById(
            elementID
        );


    calendar.innerHTML =
        "";


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


        /* Find tasks due on this day */

        const matchingTasks =
            state.tasks.filter(
                task => {

                    if (
                        !task.deadline
                    ) {

                        return false;

                    }


                    return (

                        task.deadline.getDate()
                        === day

                        &&

                        task.deadline.getMonth()
                        === month

                        &&

                        task.deadline.getFullYear()
                        === year

                    );

                }
            );


        /* Apply deadline states */

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

                `${months[month]} ${day}. ` +
                `${matchingTasks.length} deadline` +
                `${matchingTasks.length > 1 ? "s" : ""}.`

            );

        }

        else {

            button.setAttribute(

                "aria-label",

                `${months[month]} ${day}. No known deadline.`

            );

        }


        /* Highlight today */

        if (
            day === today.getDate()
        ) {

            button.classList.add(
                "selected"
            );

        }


        /* Allow selecting dates visually */

        button.addEventListener(
            "click",
            () => {

                calendar
                    .querySelectorAll(
                        ".calendar-day"
                    )
                    .forEach(
                        date => {

                            date.classList.remove(
                                "selected"
                            );

                        }
                    );


                button.classList.add(
                    "selected"
                );

            }
        );


        calendar.appendChild(
            button
        );

    }

}


/* Initial calendars */

drawCalendar(
    "homeCalendar"
);


drawCalendar(
    "planCalendar"
);



/* ==========================
   READ USER DUMP
========================== */

function extractTasks(
    text
) {

    /*
        This is a local prototype parser.

        It does NOT use a real AI backend yet.

        Its purpose is to simulate the
        Overwhelm UX so the prototype
        can actually respond to input.
    */


    const cleaned =
        text

            .replace(
                /\n+/g,
                ". "
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();


    /*
        Break paragraphs into
        likely responsibilities.
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
        Also split long run-on sentences
        when the user says things like:

        "and I need..."
        "also I have..."
    */

    let expanded =
        [];


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

        .filter(
            Boolean
        );

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
        Words that suggest the sentence
        contains an actual responsibility.
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
        "proposal",
        "presentation",
        "test",
        "quiz",
        "exam",
        "email",
        "call",
        "practice",
        "prepare",
        "read",
        "research"

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
            createID(),

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

        priorityLevel:
            "later",

        priorityScore:
            0,

        steps:
            generateSteps(
                title
            )

    };

}



/* ==========================
   CREATE UNIQUE ID
========================== */

function createID() {

    if (
        typeof crypto !== "undefined"
        &&
        typeof crypto.randomUUID === "function"
    ) {

        return crypto.randomUUID();

    }


    return (

        Date.now().toString()
        +
        "-"
        +
        Math.random()
            .toString(16)
            .slice(2)

    );

}



/* ==========================
   CLEAN TASK TITLE
========================== */

function cleanTaskTitle(
    sentence
) {

    let result =
        sentence.trim();


    result =
        result.replace(

            /^(i\s+(need|have|have to|must|should)\s+(to\s+)?)/i,

            ""

        );


    result =
        result.replace(

            /^(my\s+)/i,

            ""

        );


    /*
        Remove obvious deadline language
        from title.
    */

    result =
        result.replace(

            /\b(due|by|before)\b.+$/i,

            ""

        );


    /*
        Remove timeline wording.
    */

    result =
        result.replace(

            /\b(today|tomorrow|this week|next week|soon|eventually)\b.*$/i,

            ""

        );


    /*
        Remove duration wording.
    */

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


    /*
        Capitalize title.
    */

    return (

        result.charAt(0)
            .toUpperCase()

        +

        result.slice(1)

    );

}



/* ==========================
   DETECT DURATION
========================== */

function detectDuration(
    sentence
) {

    /*
        Hours
    */

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


    /*
        Minutes
    */

    const minuteMatch =
        sentence.match(

            /(\d+)\s*(minutes?|mins?|min)\b/i

        );


    if (
        minuteMatch
    ) {

        return parseInt(
            minuteMatch[1],
            10
        );

    }


    /*
        Prototype default if no duration
        was provided.
    */

    return 60;

}



/* ==========================
   DETECT TIMELINE
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
            "tomorrow"
        )
    ) {

        return "Tomorrow";

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
            "next week"
        )
    ) {

        return "Next week";

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
   DETECT DEADLINE
========================== */

function detectDeadline(
    sentence
) {

    /*
        TODAY
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
        TOMORROW
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
        MONTH + DAY

        Examples:

        September 6
        Sep 6
        September 6 at 11:59 PM
        Sep 6 at 3 PM
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


        /*
            Convert 12-hour clock
            to 24-hour clock.
        */

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


        const year =
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
            If user mentions a month
            that has already passed,
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
   PRIORITY CALCULATION
========================== */

function calculatePriority(
    task
) {

    let score =
        0;


    /*
        Exact deadline exists.
    */

    if (
        task.deadline
    ) {

        const remainingMinutes =

            (
                task.deadline
                -
                new Date()
            )

            /

            60000;


        /*
            How much time remains after
            accounting for required work?
        */

        const slack =

            remainingMinutes
            -
            task.estimatedMinutes;


        /*
            Deadline is already impossible
            or dangerously tight.
        */

        if (
            slack <= 0
        ) {

            score +=
                1000;


            task.priorityLevel =
                "urgent";

        }


        /*
            Due within 24 hours.
        */

        else if (
            remainingMinutes
            <= 1440
        ) {

            score +=
                800;


            task.priorityLevel =
                "urgent";

        }


        /*
            Due within 3 days.
        */

        else if (
            remainingMinutes
            <= 4320
        ) {

            score +=
                600;


            task.priorityLevel =
                "urgent";

        }


        /*
            Due within a week.
        */

        else if (
            remainingMinutes
            <= 10080
        ) {

            score +=
                400;


            task.priorityLevel =
                "soon";

        }


        /*
            Exact deadline but farther away.
        */

        else {

            score +=
                200;


            task.priorityLevel =
                "later";

        }


        /*
            Lower slack = more urgent.

            This is important because
            a 10-hour task due in two days
            should outrank a 15-minute task
            due in two days.
        */

        score +=
            Math.max(

                0,

                300
                -
                (
                    slack
                    / 60
                )

            );

    }


    /*
        No exact deadline:
        use broad timeline.
    */

    else {

        const timelineScore = {

            "Today":
                350,

            "Tomorrow":
                300,

            "This week":
                230,

            "Next week":
                170,

            "Soon":
                140,

            "Eventually":
                30

        };


        score +=

            timelineScore[
                task.timeline
            ]

            ||

            60;


        if (
            task.timeline
            === "Today"
            ||
            task.timeline
            === "Tomorrow"
        ) {

            task.priorityLevel =
                "urgent";

        }

        else if (
            task.timeline
            === "This week"

            ||

            task.timeline
            === "Next week"

            ||

            task.timeline
            === "Soon"
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
        YOUR tie-break rule:

        When tasks are otherwise similar,
        the shorter task goes first.

        This reduces the pile faster.
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
   ORGANIZE USER DUMP
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


    /*
        Calculate priority for every task.
    */

    tasks.forEach(
        calculatePriority
    );


    /*
        Highest priority first.
    */

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
        Save all tasks.
    */

    state.tasks =
        tasks;


    /*
        HARD CAPACITY LIMIT:

        Only 3 responsibilities
        are allowed into active view.
    */

    state.activeTasks =
        tasks.slice(
            0,
            3
        );


    /*
        First active task becomes
        the focus task.
    */

    state.currentTask =
        state.activeTasks[0]
        || null;


    state.currentStep =
        0;


    /*
        Feedback to user.
    */

    dumpMessage.textContent =

        `I found ${tasks.length} `

        +

        `responsibilit${tasks.length === 1 ? "y" : "ies"}. `

        +

        `I'm only showing what needs your attention.`;


    /*
        Reveal organized results.
    */

    resultsSection
        .classList
        .remove(
            "hidden"
        );


    renderEverything();


    /*
        Move user's attention to
        the reduced workload.
    */

    resultsSection
        .scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

}



/* ==========================
   TASK CARD
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


    /*
        First priority gets stronger
        visual treatment.
    */

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
                ${escapeHTML(deadlineText)}
            </p>

            <small>

                About
                ${escapeHTML(durationText)}

                ${
                    index === 0
                        ? " · Do this first"
                        : ""
                }

            </small>

        </span>

        <span
            class="
                task-status
                ${task.priorityLevel}
            "
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


    /*
        Clicking a task opens Focus.
    */

    if (
        clickable
    ) {

        card.addEventListener(
            "click",
            () => {

                state.currentTask =
                    task;


                /*
                    Determine which step
                    matches current progress.
                */

                state.currentStep =
                    Math.min(

                        task.steps.length,

                        Math.floor(

                            (
                                task.progress
                                / 100
                            )

                            *

                            task.steps.length

                        )

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
   RENDER TASK LISTS
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


    /*
        Nothing active.
    */

    if (
        !first
    ) {

        intervention
            .classList
            .add(
                "hidden"
            );


        phone
            .classList
            .remove(
                "deadline-mode"
            );


        return;

    }


    /*
        Deadline intervention begins
        when first priority is urgent.
    */

    if (
        first.priorityLevel
        === "urgent"
    ) {

        intervention
            .classList
            .remove(
                "hidden"
            );


        /*
            Change the visual atmosphere
            of the whole app.
        */

        phone
            .classList
            .add(
                "deadline-mode"
            );


        interventionText
            .textContent =

            `${first.title} needs attention first. `

            +

            `I rearranged your active workload.`;

    }


    /*
        Calm state.
    */

    else {

        intervention
            .classList
            .add(
                "hidden"
            );


        phone
            .classList
            .remove(
                "deadline-mode"
            );

    }

}



/* ==========================
   PLAN PROGRESS
========================== */

function renderPlanProgress() {

    /*
        No active tasks.
    */

    if (
        state.activeTasks.length
        === 0
    ) {

        document.getElementById(
            "planPercent"
        ).textContent =
            "0%";


        document.getElementById(
            "planProgress"
        ).style.setProperty(
            "--percent",
            0
        );


        capacityHeading.textContent =
            "0 of 3 tasks";


        return;

    }


    /*
        Average progress across
        CURRENT active workload only.

        Not the giant backlog.
    */

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


    document.getElementById(
        "planPercent"
    ).textContent =

        `${percent}%`;


    document.getElementById(
        "planProgress"
    ).style.setProperty(

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


    /*
        No work means quiet end state.
    */

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


    /*
        Current task.
    */

    focusTaskTitle.textContent =
        task.title;


    focusDeadline.textContent =
        getTaskDeadlineText(
            task
        );


    /*
        Task completion.
    */

    focusPercent.textContent =
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
   STEP GENERATION
========================== */

function generateSteps(
    title
) {

    const lower =
        title.toLowerCase();


    /*
        Writing / school project
    */

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

        ||

        lower.includes(
            "research"
        )
    ) {

        return [

            "Understand the requirements",

            "Gather what you need",

            "Create the first draft",

            "Review and finish"

        ];

    }


    /*
        Applications
    */

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


    /*
        Cleaning
    */

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


    /*
        Studying
    */

    if (
        lower.includes(
            "study"
        )

        ||

        lower.includes(
            "test"
        )

        ||

        lower.includes(
            "quiz"
        )

        ||

        lower.includes(
            "exam"
        )
    ) {

        return [

            "Gather study materials",

            "Review the main topics",

            "Practice what is difficult",

            "Do a final review"

        ];

    }


    /*
        Generic task
    */

    return [

        "Open what you need",

        "Start the first part",

        "Finish the main work",

        "Check and complete"

    ];

}



/* ==========================
   RENDER STEPS
========================== */

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


            /*
                Completed steps.
            */

            if (
                index
                <
                state.currentStep
            ) {

                step.classList.add(
                    "completed"
                );

            }


            /*
                Current step.
            */

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

                        :

                        index + 1
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
   FINISH CURRENT STEP
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


            /*
                Advance one step.
            */

            if (
                state.currentStep
                <
                task.steps.length
            ) {

                state.currentStep++;

            }


            /*
                Convert step completion
                into task percentage.
            */

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


            /*
                TASK FINISHED
            */

            if (
                task.progress
                >= 100
            ) {

                task.completed =
                    true;


                /*
                    Remove completed task
                    from active workload.
                */

                state.activeTasks =
                    state.activeTasks.filter(

                        item =>
                            item.id
                            !==
                            task.id

                    );


                /*
                    Find next task that is waiting
                    outside active capacity.
                */

                const nextWaiting =
                    state.tasks.find(

                        item =>

                            !item.completed

                            &&

                            !state.activeTasks.some(

                                active =>
                                    active.id
                                    === item.id

                            )

                    );


                /*
                    Allow one waiting task
                    into the active workload.
                */

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


                /*
                    Recalculate active priorities.
                */

                state.activeTasks.forEach(
                    calculatePriority
                );


                state.activeTasks.sort(

                    (
                        first,
                        second
                    ) =>

                        second.priorityScore
                        -
                        first.priorityScore

                );


                /*
                    Focus moves to new first task.
                */

                state.currentTask =
                    state.activeTasks[0]
                    || null;


                state.currentStep =
                    0;


                renderEverything();


                return;

            }


            /*
                Task still in progress.
            */

            renderEverything();

        }
    );



/* ==========================
   DEADLINE TEXT
========================== */

function getTaskDeadlineText(
    task
) {

    if (
        task.deadline
    ) {

        return (

            "Due "

            +

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

        );

    }


    if (
        task.timeline
    ) {

        return (
            `Timeline: ${task.timeline}`
        );

    }


    return (
        "No exact deadline yet"
    );

}



/* ==========================
   DURATION TEXT
========================== */

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
   SCREEN NAVIGATION
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


    /*
        Highlight matching nav item.
    */

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


    /*
        Start each screen at the top.
    */

    window.scrollTo(
        0,
        0
    );

}



/* ==========================
   NAV BUTTONS
========================== */

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
   VIEW PLAN BUTTON
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
   HTML SAFETY
========================== */

function escapeHTML(
    value
) {

    return String(
        value
    )

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


/* ==========================
   INITIAL RENDER
========================== */

renderEverything();