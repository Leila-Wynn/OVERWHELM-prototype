/* =========================================================
   OVERWHELM
   REAL APP PHASE 1 — PERSISTENT DATA

   01 Home / Dump
   02 Plan
   03 Focus
   04 Profile

   Bottom nav:
   Home · Plan · Quick Dump · Focus · More
========================================================= */


/* =========================================================
   STATE
========================================================= */


const state = {

    tasks: [],

    activeTasks: [],

    completedTasks: [],

    currentTask: null,

    currentStep: 0

};


/* =========================================================
   STORAGE
========================================================= */


const STORAGE_KEY =
    "overwhelm-app-state";


/* =========================================================
   DOM
========================================================= */


const phone =
    document.querySelector(".phone");


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


const planProgress =
    document.getElementById(
        "planProgress"
    );


const planProgressRing =
    document.getElementById(
        "planProgressRing"
    );


const focusActiveState =
    document.getElementById(
        "focusActiveState"
    );


const emptyFocus =
    document.getElementById(
        "emptyFocus"
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


/* PROFILE */


const profilePercent =
    document.getElementById(
        "profilePercent"
    );


const profileActive =
    document.getElementById(
        "profileActive"
    );


const profileWaiting =
    document.getElementById(
        "profileWaiting"
    );


const profileFinished =
    document.getElementById(
        "profileFinished"
    );


/* DATE */


const todayNumber =
    document.getElementById(
        "todayNumber"
    );


const todayMonth =
    document.getElementById(
        "todayMonth"
    );


const todayWeekday =
    document.getElementById(
        "todayWeekday"
    );


const monthTitle =
    document.getElementById(
        "monthTitle"
    );


/* =========================================================
   SAVE APP
========================================================= */


function saveState() {

    const data = {

        tasks:
            state.tasks,

        activeTaskIDs:
            state.activeTasks.map(
                task => task.id
            ),

        completedTaskIDs:
            state.completedTasks.map(
                task => task.id
            ),

        currentTaskID:
            state.currentTask
                ? state.currentTask.id
                : null,

        currentStep:
            state.currentStep,

        stressDump:
            stressInput
                ? stressInput.value
                : ""

    };


    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    }

    catch (error) {

        console.error(
            "Overwhelm could not save:",
            error
        );

    }

}


/* =========================================================
   RESTORE TASK
========================================================= */


function restoreTask(task) {

    return {

        ...task,

        deadline:
            task.deadline
                ? new Date(
                    task.deadline
                )
                : null,

        completedSteps:
            task.completedSteps || 0,

        steps:
            Array.isArray(
                task.steps
            )
                ? task.steps
                : []

    };

}


/* =========================================================
   LOAD SAVED APP
========================================================= */


function loadState() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!saved) {

        return false;

    }


    try {

        const data =
            JSON.parse(
                saved
            );


        state.tasks =
            (
                Array.isArray(
                    data.tasks
                )
                    ? data.tasks
                    : []
            )
                .map(
                    restoreTask
                );


        /* Recalculate priority when
           the app opens again because
           deadlines may now be closer. */


        state.tasks.forEach(
            task => {

                const priority =
                    calculatePriority(
                        task
                    );


                task.priorityScore =
                    priority.score;


                task.priorityLevel =
                    priority.level;


                if (
                    task.steps.length === 0
                ) {

                    task.steps =
                        generateSteps(
                            task
                        );

                }

            }
        );


        const taskMap =
            new Map(
                state.tasks.map(
                    task => [

                        task.id,
                        task

                    ]
                )
            );


        state.activeTasks =
            (
                Array.isArray(
                    data.activeTaskIDs
                )
                    ? data.activeTaskIDs
                    : []
            )
                .map(
                    id =>
                        taskMap.get(
                            id
                        )
                )
                .filter(
                    Boolean
                );


        state.completedTasks =
            (
                Array.isArray(
                    data.completedTaskIDs
                )
                    ? data.completedTaskIDs
                    : []
            )
                .map(
                    id =>
                        taskMap.get(
                            id
                        )
                )
                .filter(
                    Boolean
                );


        /* Keep active tasks ordered
           according to current urgency. */


        state.activeTasks.sort(
            (
                a,
                b
            ) =>
                b.priorityScore -
                a.priorityScore
        );


        state.currentTask =
            data.currentTaskID
                ? taskMap.get(
                    data.currentTaskID
                ) || null
                : state.activeTasks[0] ||
                  null;


        /* If saved current task is no
           longer active, use first task. */


        if (
            state.currentTask &&
            !state.activeTasks.some(
                task =>
                    task.id ===
                    state.currentTask.id
            )
        ) {

            state.currentTask =
                state.activeTasks[0] ||
                null;

        }


        state.currentStep =
            Number(
                data.currentStep
            ) || 0;


        if (
            stressInput &&
            typeof data.stressDump ===
                "string"
        ) {

            stressInput.value =
                data.stressDump;

        }


        return true;

    }

    catch (error) {

        console.error(
            "Overwhelm could not restore saved data:",
            error
        );


        return false;

    }

}


/* =========================================================
   CURRENT DATE
========================================================= */


const now =
    new Date();


todayNumber.textContent =
    String(
        now.getDate()
    ).padStart(
        2,
        "0"
    );


todayMonth.textContent =
    now
        .toLocaleDateString(
            "en-US",
            {
                month:
                    "long"
            }
        )
        .toUpperCase();


todayWeekday.textContent =
    now
        .toLocaleDateString(
            "en-US",
            {
                weekday:
                    "long"
            }
        )
        .toUpperCase();


monthTitle.textContent =
    now.toLocaleDateString(
        "en-US",
        {
            month:
                "long"
        }
    );


/* =========================================================
   CALENDAR
========================================================= */


function drawCalendar(
    containerID
) {

    const container =
        document.getElementById(
            containerID
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const currentDate =
        new Date();


    const year =
        currentDate.getFullYear();


    const month =
        currentDate.getMonth();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayButton =
            document.createElement(
                "button"
            );


        dayButton.type =
            "button";


        dayButton.className =
            "calendar-day";


        dayButton.textContent =
            day;


        dayButton.setAttribute(
            "aria-label",

            `${currentDate.toLocaleDateString(
                "en-US",
                {
                    month:
                        "long"
                }
            )} ${day}`
        );


        if (
            day ===
            currentDate.getDate()
        ) {

            dayButton
                .classList
                .add(
                    "selected"
                );

        }


        const matchingTask =
            state.tasks.find(
                task =>

                    task.deadline &&

                    task.deadline
                        .getFullYear() ===
                        year &&

                    task.deadline
                        .getMonth() ===
                        month &&

                    task.deadline
                        .getDate() ===
                        day
            );


        if (
            matchingTask
        ) {

            if (
                matchingTask
                    .priorityLevel ===
                "urgent"
            ) {

                dayButton
                    .classList
                    .add(
                        "urgent"
                    );

            }

            else {

                dayButton
                    .classList
                    .add(
                        "deadline"
                    );

            }

        }


        container.appendChild(
            dayButton
        );

    }

}


/* =========================================================
   TASK EXTRACTION
========================================================= */


function extractTasks(
    text
) {

    const normalized =
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


    if (
        !normalized
    ) {

        return [];

    }


    let pieces =
        normalized
            .split(
                /[.!?;]+|\b(?:and also|also)\b/gi
            )
            .map(
                item =>
                    item.trim()
            )
            .filter(
                Boolean
            );


    if (
        pieces.length === 1
    ) {

        pieces =
            normalized
                .split(
                    /\band\b/gi
                )
                .map(
                    item =>
                        item.trim()
                )
                .filter(
                    Boolean
                );

    }


    const taskWords = [

        "due",
        "need",
        "have to",
        "must",
        "finish",
        "complete",
        "submit",
        "write",
        "essay",
        "paper",
        "project",
        "quiz",
        "test",
        "exam",
        "application",
        "clean",
        "study",
        "research",
        "proposal",
        "homework",
        "assignment",
        "work",
        "email",
        "call",
        "appointment"

    ];


    let taskPieces =
        pieces.filter(
            sentence =>

                taskWords.some(
                    word =>

                        sentence
                            .toLowerCase()
                            .includes(
                                word
                            )
                )
        );


    if (
        taskPieces.length === 0
    ) {

        taskPieces =
            pieces.slice(
                0,
                8
            );

    }


    return taskPieces

        .slice(
            0,
            12
        )

        .map(
            createTaskFromSentence
        );

}


/* =========================================================
   CREATE TASK
========================================================= */


function createTaskFromSentence(
    sentence
) {

    const task = {

        id:
            createID(),

        original:
            sentence,

        title:
            cleanTaskTitle(
                sentence
            ),

        estimatedMinutes:
            detectDuration(
                sentence
            ),

        deadline:
            detectDeadline(
                sentence
            ),

        timeline:
            detectTimeline(
                sentence
            ),

        priorityScore:
            0,

        priorityLevel:
            "later",

        completedSteps:
            0,

        steps:
            []

    };


    const priority =
        calculatePriority(
            task
        );


    task.priorityScore =
        priority.score;


    task.priorityLevel =
        priority.level;


    return task;

}


/* =========================================================
   ID
========================================================= */


function createID() {

    return (

        Date.now()
            .toString(
                36
            )

        +

        Math.random()
            .toString(
                36
            )
            .slice(
                2
            )

    );

}


/* =========================================================
   CLEAN TITLE
========================================================= */


function cleanTaskTitle(
    sentence
) {

    let title =
        sentence
            .replace(
                /^(i\s+)?(need to|have to|must|should|gotta)\s+/i,
                ""
            )
            .trim();


    if (
        !title
    ) {

        title =
            sentence.trim();

    }


    return (

        title
            .charAt(
                0
            )
            .toUpperCase()

        +

        title.slice(
            1
        )

    );

}


/* =========================================================
   DURATION
========================================================= */


function detectDuration(
    text
) {

    const lower =
        text.toLowerCase();


    const hourMatch =
        lower.match(
            /(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs)\b/
        );


    if (
        hourMatch
    ) {

        return Math.max(
            5,

            Math.round(
                Number(
                    hourMatch[1]
                ) * 60
            )
        );

    }


    const minuteMatch =
        lower.match(
            /(\d+)\s*(?:minute|minutes|min|mins)\b/
        );


    if (
        minuteMatch
    ) {

        return Math.max(
            5,

            Number(
                minuteMatch[1]
            )
        );

    }


    return 60;

}


/* =========================================================
   TIMELINE
========================================================= */


function detectTimeline(
    text
) {

    const lower =
        text.toLowerCase();


    if (
        lower.includes(
            "today"
        ) ||
        lower.includes(
            "tonight"
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
            "next week"
        )
    ) {

        return "Next week";

    }


    if (
        lower.includes(
            "this week"
        ) ||

        lower.includes(
            "monday"
        ) ||

        lower.includes(
            "tuesday"
        ) ||

        lower.includes(
            "wednesday"
        ) ||

        lower.includes(
            "thursday"
        ) ||

        lower.includes(
            "friday"
        ) ||

        lower.includes(
            "saturday"
        ) ||

        lower.includes(
            "sunday"
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


    return "Eventually";

}


/* =========================================================
   DEADLINE
========================================================= */


function detectDeadline(
    text
) {

    const lower =
        text.toLowerCase();


    const current =
        new Date();


    if (
        lower.includes(
            "today"
        ) ||
        lower.includes(
            "tonight"
        )
    ) {

        const date =
            new Date(
                current
            );


        date.setHours(
            23,
            59,
            0,
            0
        );


        return date;

    }


    if (
        lower.includes(
            "tomorrow"
        )
    ) {

        const date =
            new Date(
                current
            );


        date.setDate(
            date.getDate() + 1
        );


        date.setHours(
            23,
            59,
            0,
            0
        );


        return date;

    }


    const weekdays = [

        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"

    ];


    for (
        let index = 0;
        index <
            weekdays.length;
        index++
    ) {

        if (
            lower.includes(
                weekdays[index]
            )
        ) {

            const date =
                new Date(
                    current
                );


            let difference =
                index -
                current.getDay();


            if (
                difference <= 0
            ) {

                difference += 7;

            }


            date.setDate(

                current.getDate()
                +
                difference

            );


            date.setHours(
                23,
                59,
                0,
                0
            );


            return date;

        }

    }


    const months = {

        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11

    };


    for (
        const [
            monthName,
            monthIndex
        ]

        of Object.entries(
            months
        )
    ) {

        const regex =
            new RegExp(
                `${monthName}\\s+(\\d{1,2})`,
                "i"
            );


        const match =
            text.match(
                regex
            );


        if (
            match
        ) {

            const date =
                new Date(

                    current.getFullYear(),

                    monthIndex,

                    Number(
                        match[1]
                    ),

                    23,
                    59,
                    0,
                    0
                );


            if (
                date < current
            ) {

                date.setFullYear(
                    current.getFullYear()
                    + 1
                );

            }


            return date;

        }

    }


    return null;

}


/* =========================================================
   PRIORITY
========================================================= */


function calculatePriority(
    task
) {

    let score =
        0;


    let level =
        "later";


    if (
        task.deadline
    ) {

        const remainingMinutes =
            (
                task.deadline
                    .getTime()
                -
                Date.now()
            )
            /
            60000;


        const slack =
            remainingMinutes
            -
            task.estimatedMinutes;


        if (
            slack <= 0
        ) {

            score += 1000;

            level =
                "urgent";

        }

        else if (
            remainingMinutes <=
            24 * 60
        ) {

            score += 800;

            level =
                "urgent";

        }

        else if (
            remainingMinutes <=
            3 * 24 * 60
        ) {

            score += 600;

            level =
                "soon";

        }

        else if (
            remainingMinutes <=
            7 * 24 * 60
        ) {

            score += 400;

            level =
                "soon";

        }

        else {

            score += 250;

        }


        score +=
            Math.max(
                0,

                200 -
                remainingMinutes
                /
                60
            );

    }

    else {

        const timelineScores = {

            Today:
                500,

            Tomorrow:
                430,

            "This week":
                330,

            "Next week":
                200,

            Soon:
                180,

            Eventually:
                80

        };


        score +=
            timelineScores[
                task.timeline
            ] || 50;


        if (
            task.timeline ===
            "Today"
        ) {

            level =
                "urgent";

        }

        else if (
            task.timeline ===
            "Tomorrow" ||

            task.timeline ===
            "This week"
        ) {

            level =
                "soon";

        }

    }


    /* Same urgency?
       Shorter task comes first. */


    score +=
        Math.max(
            0,

            100 -
            task.estimatedMinutes
        );


    return {

        score,
        level

    };

}


/* =========================================================
   ORGANIZE DUMP
========================================================= */


function organizeDump() {

    const text =
        stressInput
            .value
            .trim();


    if (
        !text
    ) {

        dumpMessage.textContent =
            "Tell me what's overwhelming you first.";


        dumpMessage
            .classList
            .remove(
                "hidden"
            );


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
            "I couldn't find a task yet. Try mentioning what needs to get done.";


        dumpMessage
            .classList
            .remove(
                "hidden"
            );


        return;

    }


    dumpMessage
        .classList
        .add(
            "hidden"
        );


    tasks.sort(
        (
            a,
            b
        ) =>
            b.priorityScore -
            a.priorityScore
    );


    state.tasks =
        tasks;


    state.activeTasks =
        tasks.slice(
            0,
            3
        );


    state.completedTasks =
        [];


    state.currentTask =
        state.activeTasks[0] ||
        null;


    state.currentStep =
        0;


    state.tasks.forEach(
        task => {

            if (
                task.steps.length === 0
            ) {

                task.steps =
                    generateSteps(
                        task
                    );

            }

        }
    );


    resultsSection
        .classList
        .remove(
            "hidden"
        );


    saveState();


    renderEverything();


    resultsSection
        .scrollIntoView(
            {

                behavior:
                    "smooth",

                block:
                    "start"

            }
        );

}


/* =========================================================
   TASK CARD
========================================================= */


function createTaskCard(
    task,
    index
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

        card
            .classList
            .add(
                "first"
            );

    }


    const statusText =
        task.priorityLevel ===
        "urgent"

            ? "Urgent"

            : task.priorityLevel ===
              "soon"

                ? "Soon"

                : "Later";


    card.innerHTML = `

        <span class="priority-number">
            ${index + 1}
        </span>

        <span class="task-main">

            <strong>
                ${escapeHTML(
                    task.title
                )}
            </strong>

            <p>
                ${escapeHTML(
                    getTaskDeadlineText(
                        task
                    )
                )}
            </p>

            <small>
                About
                ${escapeHTML(
                    formatDuration(
                        task.estimatedMinutes
                    )
                )}
            </small>

        </span>

        <span
            class="
                task-status
                ${task.priorityLevel}
            "
        >
            ${statusText}
        </span>

    `;


    card.addEventListener(
        "click",
        () => {

            if (
                index !== 0
            ) {

                return;

            }


            state.currentTask =
                task;


            state.currentStep =
                task.completedSteps;


            saveState();


            renderFocus();


            showScreen(
                "focusScreen"
            );

        }
    );


    return card;

}


/* =========================================================
   RENDER TASKS
========================================================= */


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
        state.activeTasks.length > 0

            ? "Here's what matters."

            : "Nothing needs your attention.";

}


/* =========================================================
   INTERVENTION
========================================================= */


function renderIntervention() {

    const firstTask =
        state.activeTasks[0];


    if (
        firstTask &&
        firstTask.priorityLevel ===
        "urgent"
    ) {

        intervention
            .classList
            .remove(
                "hidden"
            );


        interventionText.textContent =
            `${firstTask.title} needs your attention. I've moved it to the front.`;


        phone
            .classList
            .add(
                "deadline-mode"
            );

    }

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


/* =========================================================
   PLAN PROGRESS
========================================================= */


function renderPlanProgress() {

    const total =
        state.tasks.length;


    const finished =
        state.completedTasks.length;


    const percent =
        total > 0

            ? Math.round(
                finished
                /
                total
                *
                100
            )

            : 0;


    planProgress.textContent =
        `${percent}%`;


    planProgressRing
        .style
        .setProperty(
            "--percent",
            percent
        );

}


/* =========================================================
   FOCUS
========================================================= */


function renderFocus() {

    const task =
        state.currentTask;


    if (
        !task
    ) {

        focusActiveState
            .classList
            .add(
                "hidden"
            );


        emptyFocus
            .classList
            .remove(
                "hidden"
            );


        return;

    }


    focusActiveState
        .classList
        .remove(
            "hidden"
        );


    emptyFocus
        .classList
        .add(
            "hidden"
        );


    focusTaskTitle.textContent =
        task.title;


    focusDeadline.textContent =
        getTaskDeadlineText(
            task
        );


    const progress =
        task.steps.length > 0

            ? Math.round(
                task.completedSteps
                /
                task.steps.length
                *
                100
            )

            : 0;


    focusPercent.textContent =
        `${progress}%`;


    focusProgressRing
        .style
        .setProperty(
            "--percent",
            progress
        );


    renderSteps();

}


/* =========================================================
   STEPS
========================================================= */


function generateSteps(
    task
) {

    const title =
        task.title.toLowerCase();


    if (
        title.includes(
            "essay"
        ) ||

        title.includes(
            "paper"
        ) ||

        title.includes(
            "proposal"
        ) ||

        title.includes(
            "research"
        )
    ) {

        return [

            "Open the assignment and requirements.",

            "Gather the information you need.",

            "Make a simple outline.",

            "Write the first section.",

            "Finish the draft.",

            "Review and submit."

        ];

    }


    if (
        title.includes(
            "application"
        )
    ) {

        return [

            "Open the application.",

            "Check what information is required.",

            "Complete the easiest sections first.",

            "Finish the remaining questions.",

            "Review everything.",

            "Submit."

        ];

    }


    if (
        title.includes(
            "clean"
        ) ||

        title.includes(
            "room"
        )
    ) {

        return [

            "Pick up obvious trash.",

            "Put clothes together.",

            "Clear one surface.",

            "Put misplaced items away.",

            "Finish the floor.",

            "Stop when the room is functional."

        ];

    }


    if (
        title.includes(
            "study"
        ) ||

        title.includes(
            "test"
        ) ||

        title.includes(
            "quiz"
        ) ||

        title.includes(
            "exam"
        )
    ) {

        return [

            "Find what will be tested.",

            "Identify the weakest topic.",

            "Review that topic first.",

            "Practice a few questions.",

            "Check what you missed.",

            "Do one final review."

        ];

    }


    return [

        "Open what you need.",

        "Start the smallest useful part.",

        "Keep going until that part is done.",

        "Check what remains.",

        "Finish the task.",

        "Mark it complete."

    ];

}


/* =========================================================
   RENDER STEPS
========================================================= */


function renderSteps() {

    stepList.innerHTML =
        "";


    const task =
        state.currentTask;


    if (
        !task
    ) {

        return;

    }


    task.steps.forEach(
        (
            stepText,
            index
        ) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "step";


            if (
                index <
                task.completedSteps
            ) {

                row
                    .classList
                    .add(
                        "completed"
                    );

            }


            if (
                index ===
                task.completedSteps
            ) {

                row
                    .classList
                    .add(
                        "current"
                    );

            }


            row.innerHTML = `

                <span class="step-number">
                    ${index + 1}
                </span>

                <span>
                    ${escapeHTML(
                        stepText
                    )}
                </span>

            `;


            stepList.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   FINISH STEP
========================================================= */


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
                task.completedSteps <
                task.steps.length
            ) {

                task.completedSteps +=
                    1;

            }


            if (
                task.completedSteps >=
                task.steps.length
            ) {

                finishCurrentTask();

            }

            else {

                state.currentStep =
                    task.completedSteps;


                saveState();


                renderEverything();

            }

        }
    );


/* =========================================================
   FINISH TASK
========================================================= */


function finishCurrentTask() {

    const finishedTask =
        state.currentTask;


    if (
        !finishedTask
    ) {

        return;

    }


    if (
        !state.completedTasks.some(
            task =>
                task.id ===
                finishedTask.id
        )
    ) {

        state.completedTasks.push(
            finishedTask
        );

    }


    state.activeTasks =
        state.activeTasks.filter(
            task =>
                task.id !==
                finishedTask.id
        );


    const activeIDs =
        new Set(
            state.activeTasks.map(
                task =>
                    task.id
            )
        );


    const finishedIDs =
        new Set(
            state.completedTasks.map(
                task =>
                    task.id
            )
        );


    const nextWaiting =
        state.tasks.find(
            task =>

                !activeIDs.has(
                    task.id
                )

                &&

                !finishedIDs.has(
                    task.id
                )
        );


    if (
        nextWaiting &&
        state.activeTasks.length < 3
    ) {

        state.activeTasks.push(
            nextWaiting
        );

    }


    state.activeTasks.sort(
        (
            a,
            b
        ) =>
            b.priorityScore -
            a.priorityScore
    );


    state.currentTask =
        state.activeTasks[0] ||
        null;


    state.currentStep =
        state.currentTask

            ? state.currentTask
                .completedSteps

            : 0;


    saveState();


    renderEverything();

}


/* =========================================================
   TASK DEADLINE TEXT
========================================================= */


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
                    "en-US",
                    {

                        weekday:
                            "short",

                        month:
                            "short",

                        day:
                            "numeric"

                    }
                )

        );

    }


    return task.timeline;

}


/* =========================================================
   DURATION FORMAT
========================================================= */


function formatDuration(
    minutes
) {

    if (
        minutes < 60
    ) {

        return `${minutes} min`;

    }


    if (
        minutes % 60 === 0
    ) {

        const hours =
            minutes / 60;


        return hours === 1

            ? "1 hour"

            : `${hours} hours`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const remainingMinutes =
        minutes % 60;


    return (
        `${hours}h ${remainingMinutes}m`
    );

}


/* =========================================================
   PROFILE
========================================================= */


function renderProfile() {

    const total =
        state.tasks.length;


    const finished =
        state.completedTasks.length;


    const active =
        state.activeTasks.length;


    const waiting =
        Math.max(
            0,

            total -
            finished -
            active
        );


    const percent =
        total > 0

            ? Math.round(
                finished
                /
                total
                *
                100
            )

            : 0;


    profilePercent.textContent =
        `${percent}%`;


    profileActive.textContent =
        active;


    profileWaiting.textContent =
        waiting;


    profileFinished.textContent =
        finished;

}


/* =========================================================
   RENDER EVERYTHING
========================================================= */


function renderEverything() {

    renderTaskLists();


    renderIntervention();


    renderPlanProgress();


    renderFocus();


    renderProfile();


    drawCalendar(
        "homeCalendar"
    );


    drawCalendar(
        "planCalendar"
    );

}


/* =========================================================
   SCREEN NAVIGATION
========================================================= */


function showScreen(
    screenID
) {

    document
        .querySelectorAll(
            ".screen"
        )
        .forEach(
            screen => {

                screen.classList.toggle(
                    "active",

                    screen.id ===
                    screenID
                );

            }
        );


    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",

                    button.dataset.target ===
                    screenID
                );

            }
        );


    document
        .querySelectorAll(
            ".menu-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",

                    screenID ===
                    "profileScreen"
                );

            }
        );


    if (
        screenID ===
        "profileScreen"
    ) {

        renderProfile();

    }


    if (
        screenID ===
        "focusScreen"
    ) {

        renderFocus();

    }


    window.scrollTo(
        {

            top:
                0,

            behavior:
                "smooth"

        }
    );

}


/* =========================================================
   NAV BUTTONS
========================================================= */


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


/* =========================================================
   QUICK DUMP
========================================================= */


document
    .querySelectorAll(
        "[data-quick-dump]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showScreen(
                        "homeScreen"
                    );


                    setTimeout(
                        () => {

                            stressInput.focus();


                            stressInput
                                .scrollIntoView(
                                    {

                                        behavior:
                                            "smooth",

                                        block:
                                            "center"

                                    }
                                );

                        },

                        120
                    );

                }
            );

        }
    );


/* =========================================================
   ORGANIZE
========================================================= */


organizeButton
    .addEventListener(
        "click",
        organizeDump
    );


/* =========================================================
   SAVE DUMP WHILE TYPING
========================================================= */


stressInput
    .addEventListener(
        "input",
        () => {

            saveState();

        }
    );


/* =========================================================
   ESCAPE HTML
========================================================= */


function escapeHTML(
    value
) {

    return String(
        value
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   RESTORE SAVED APP
========================================================= */


const restored =
    loadState();


if (
    restored &&
    state.tasks.length > 0
) {

    resultsSection
        .classList
        .remove(
            "hidden"
        );

}


/* =========================================================
   INITIAL LOAD
========================================================= */


renderEverything();