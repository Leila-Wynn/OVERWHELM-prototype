/* =========================================================
   OVERWHELM
   REAL APP PHASE 2 — TASK MANAGEMENT

   01 Home / Dump
   02 Plan
   03 Focus
   04 Profile

   Phase 2:
   - Persistent storage
   - Add tasks
   - Edit tasks
   - Change deadlines
   - Change timelines
   - Change estimated time
   - Mark tasks complete
   - Delete tasks
   - Automatic reprioritization
   - 3-task active capacity
========================================================= */

/* =========================================================
   STATE
========================================================= */

const state = {
    tasks: [],
    activeTasks: [],
    completedTasks: [],
    currentTask: null,
    currentStep: 0,
    editingTaskID: null
};


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "overwhelm-app-state";


/* =========================================================
   DOM
========================================================= */

const phone =
    document.querySelector(".phone");

const stressInput =
    document.getElementById("stressInput");

const organizeButton =
    document.getElementById("organizeButton");

const dumpMessage =
    document.getElementById("dumpMessage");

const resultsSection =
    document.getElementById("resultsSection");

const homeTasks =
    document.getElementById("homeTasks");

const planTasks =
    document.getElementById("planTasks");

const capacityLabel =
    document.getElementById("capacityLabel");

const capacityHeading =
    document.getElementById("capacityHeading");

const intervention =
    document.getElementById("intervention");

const interventionText =
    document.getElementById("interventionText");

const planProgress =
    document.getElementById("planProgress");

const planProgressRing =
    document.getElementById("planProgressRing");

const focusActiveState =
    document.getElementById("focusActiveState");

const emptyFocus =
    document.getElementById("emptyFocus");

const focusTaskTitle =
    document.getElementById("focusTaskTitle");

const focusDeadline =
    document.getElementById("focusDeadline");

const focusPercent =
    document.getElementById("focusPercent");

const focusProgressRing =
    document.getElementById("focusProgressRing");

const stepList =
    document.getElementById("stepList");

const finishStepButton =
    document.getElementById("finishStepButton");


/* =========================================================
   PROFILE DOM
========================================================= */

const profilePercent =
    document.getElementById("profilePercent");

const profileActive =
    document.getElementById("profileActive");

const profileWaiting =
    document.getElementById("profileWaiting");

const profileFinished =
    document.getElementById("profileFinished");


/* =========================================================
   DATE DOM
========================================================= */

const todayNumber =
    document.getElementById("todayNumber");

const todayMonth =
    document.getElementById("todayMonth");

const todayWeekday =
    document.getElementById("todayWeekday");

const monthTitle =
    document.getElementById("monthTitle");


/* =========================================================
   SAVE APP
========================================================= */

function saveState() {
    const data = {
        tasks: state.tasks,

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
                ? new Date(task.deadline)
                : null,

        estimatedMinutes:
            Number(task.estimatedMinutes) || 60,

        completedSteps:
            Number(task.completedSteps) || 0,

        steps:
            Array.isArray(task.steps)
                ? task.steps
                : [],

        timeline:
            task.timeline || "Eventually",

        priorityScore:
            Number(task.priorityScore) || 0,

        priorityLevel:
            task.priorityLevel || "later"
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
            JSON.parse(saved);

        state.tasks =
            (
                Array.isArray(data.tasks)
                    ? data.tasks
                    : []
            ).map(restoreTask);

        state.tasks.forEach(
            task => {
                updateTaskPriority(task);

                if (
                    !Array.isArray(task.steps) ||
                    task.steps.length === 0
                ) {
                    task.steps =
                        generateSteps(task);
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
                        taskMap.get(id)
                )
                .filter(Boolean);

        rebuildActiveTasks();

        if (
            data.currentTaskID &&
            taskMap.has(
                data.currentTaskID
            )
        ) {
            const savedCurrent =
                taskMap.get(
                    data.currentTaskID
                );

            if (
                state.activeTasks.some(
                    task =>
                        task.id ===
                        savedCurrent.id
                )
            ) {
                state.currentTask =
                    savedCurrent;
            }
        }

        if (
            !state.currentTask
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

if (todayNumber) {
    todayNumber.textContent =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );
}

if (todayMonth) {
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
}

if (todayWeekday) {
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
}

if (monthTitle) {
    monthTitle.textContent =
        now.toLocaleDateString(
            "en-US",
            {
                month:
                    "long"
            }
        );
}


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

    container.innerHTML = "";

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

        const matchingTasks =
            state.tasks.filter(
                task =>
                    !isTaskCompleted(
                        task.id
                    ) &&
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
            matchingTasks.length > 0
        ) {
            const urgent =
                matchingTasks.some(
                    task =>
                        task.priorityLevel ===
                        "urgent"
                );

            dayButton
                .classList
                .add(
                    urgent
                        ? "urgent"
                        : "deadline"
                );
        }

        container.appendChild(
            dayButton
        );
    }
}


/* =========================================================
   TASK EXTRACTION
========================================================= */

function extractTasks(text) {
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

    if (!normalized) {
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
            .filter(Boolean);

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
                .filter(Boolean);
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
   CREATE TASK FROM SENTENCE
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

    updateTaskPriority(task);

    task.steps =
        generateSteps(task);

    return task;
}


/* =========================================================
   CREATE MANUAL TASK
========================================================= */

function createManualTask({
    title,
    deadline,
    timeline,
    estimatedMinutes
}) {
    const task = {
        id:
            createID(),

        original:
            title,

        title:
            title.trim(),

        estimatedMinutes:
            Math.max(
                5,
                Number(
                    estimatedMinutes
                ) || 60
            ),

        deadline:
            deadline || null,

        timeline:
            deadline
                ? timeline || "Eventually"
                : timeline || "Eventually",

        priorityScore:
            0,

        priorityLevel:
            "later",

        completedSteps:
            0,

        steps:
            []
    };

    updateTaskPriority(task);

    task.steps =
        generateSteps(task);

    return task;
}


/* =========================================================
   ID
========================================================= */

function createID() {
    return (
        Date.now()
            .toString(36)
        +
        Math.random()
            .toString(36)
            .slice(2)
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

    if (!title) {
        title =
            sentence.trim();
    }

    return (
        title
            .charAt(0)
            .toUpperCase()
        +
        title.slice(1)
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

    if (hourMatch) {
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

    if (minuteMatch) {
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
        lower.includes("today") ||
        lower.includes("tonight")
    ) {
        return "Today";
    }

    if (
        lower.includes("tomorrow")
    ) {
        return "Tomorrow";
    }

    if (
        lower.includes("next week")
    ) {
        return "Next week";
    }

    if (
        lower.includes("this week") ||
        lower.includes("monday") ||
        lower.includes("tuesday") ||
        lower.includes("wednesday") ||
        lower.includes("thursday") ||
        lower.includes("friday") ||
        lower.includes("saturday") ||
        lower.includes("sunday")
    ) {
        return "This week";
    }

    if (
        lower.includes("soon")
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
        lower.includes("today") ||
        lower.includes("tonight")
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
                current.getDate() +
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

        if (match) {
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
                    current.getFullYear() +
                    1
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
    let score = 0;

    let level =
        "later";

    if (task.deadline) {
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
            remainingMinutes -
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
                remainingMinutes /
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

    /*
       Same urgency?
       Shorter task comes first.
    */

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
   UPDATE TASK PRIORITY
========================================================= */

function updateTaskPriority(
    task
) {
    const priority =
        calculatePriority(
            task
        );

    task.priorityScore =
        priority.score;

    task.priorityLevel =
        priority.level;
}


/* =========================================================
   COMPLETED CHECK
========================================================= */

function isTaskCompleted(
    taskID
) {
    return (
        state.completedTasks.some(
            task =>
                task.id ===
                taskID
        )
    );
}


/* =========================================================
   SORT TASKS
========================================================= */

function sortTasks(
    tasks
) {
    tasks.sort(
        (
            a,
            b
        ) => {
            const scoreDifference =
                b.priorityScore -
                a.priorityScore;

            if (
                scoreDifference !== 0
            ) {
                return scoreDifference;
            }

            return (
                a.estimatedMinutes -
                b.estimatedMinutes
            );
        }
    );
}


/* =========================================================
   REBUILD ACTIVE TASKS
========================================================= */

function rebuildActiveTasks() {
    state.tasks.forEach(
        task => {
            updateTaskPriority(
                task
            );
        }
    );

    const unfinished =
        state.tasks.filter(
            task =>
                !isTaskCompleted(
                    task.id
                )
        );

    sortTasks(
        unfinished
    );

    state.activeTasks =
        unfinished.slice(
            0,
            3
        );

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

        state.currentStep =
            state.currentTask
                ? state.currentTask
                    .completedSteps
                : 0;
    }

    if (
        !state.currentTask &&
        state.activeTasks.length > 0
    ) {
        state.currentTask =
            state.activeTasks[0];

        state.currentStep =
            state.currentTask
                .completedSteps;
    }
}


/* =========================================================
   WAITING TASKS
========================================================= */

function getWaitingTasks() {
    const activeIDs =
        new Set(
            state.activeTasks.map(
                task => task.id
            )
        );

    return state.tasks
        .filter(
            task =>
                !activeIDs.has(
                    task.id
                ) &&
                !isTaskCompleted(
                    task.id
                )
        )
        .sort(
            (
                a,
                b
            ) =>
                b.priorityScore -
                a.priorityScore
        );
}


/* =========================================================
   ORGANIZE DUMP
========================================================= */

function organizeDump() {
    const text =
        stressInput
            .value
            .trim();

    if (!text) {
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
        extractTasks(text);

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

    sortTasks(tasks);

    state.tasks =
        tasks;

    state.completedTasks =
        [];

    state.currentTask =
        null;

    state.currentStep =
        0;

    rebuildActiveTasks();

    if (
        resultsSection
    ) {
        resultsSection
            .classList
            .remove(
                "hidden"
            );
    }

    saveState();

    renderEverything();

    if (
        resultsSection
    ) {
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
   RENDER TASK LISTS
========================================================= */

function renderTaskLists() {
    if (homeTasks) {
        homeTasks.innerHTML =
            "";
    }

    if (planTasks) {
        planTasks.innerHTML =
            "";
    }

    state.activeTasks.forEach(
        (
            task,
            index
        ) => {
            if (homeTasks) {
                homeTasks.appendChild(
                    createTaskCard(
                        task,
                        index
                    )
                );
            }

            if (planTasks) {
                planTasks.appendChild(
                    createTaskCard(
                        task,
                        index
                    )
                );
            }
        }
    );

    if (capacityLabel) {
        capacityLabel.textContent =
            `${state.activeTasks.length} / 3`;
    }

    if (capacityHeading) {
        capacityHeading.textContent =
            state.activeTasks.length > 0
                ? "Here's what matters."
                : "Nothing needs your attention.";
    }
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
            ?.classList
            .remove(
                "hidden"
            );

        if (
            interventionText
        ) {
            interventionText.textContent =
                `${firstTask.title} needs your attention. I've moved it to the front.`;
        }

        phone
            ?.classList
            .add(
                "deadline-mode"
            );
    }
    else {
        intervention
            ?.classList
            .add(
                "hidden"
            );

        phone
            ?.classList
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
                finished /
                total *
                100
            )
            : 0;

    if (planProgress) {
        planProgress.textContent =
            `${percent}%`;
    }

    planProgressRing
        ?.style
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

    if (!task) {
        focusActiveState
            ?.classList
            .add(
                "hidden"
            );

        emptyFocus
            ?.classList
            .remove(
                "hidden"
            );

        return;
    }

    focusActiveState
        ?.classList
        .remove(
            "hidden"
        );

    emptyFocus
        ?.classList
        .add(
            "hidden"
        );

    if (
        focusTaskTitle
    ) {
        focusTaskTitle.textContent =
            task.title;
    }

    if (
        focusDeadline
    ) {
        focusDeadline.textContent =
            getTaskDeadlineText(
                task
            );
    }

    const progress =
        task.steps.length > 0
            ? Math.round(
                task.completedSteps /
                task.steps.length *
                100
            )
            : 0;

    if (
        focusPercent
    ) {
        focusPercent.textContent =
            `${progress}%`;
    }

    focusProgressRing
        ?.style
        .setProperty(
            "--percent",
            progress
        );

    renderSteps();
}


/* =========================================================
   GENERATE STEPS
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
    if (!stepList) {
        return;
    }

    stepList.innerHTML =
        "";

    const task =
        state.currentTask;

    if (!task) {
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
    ?.addEventListener(
        "click",
        () => {
            const task =
                state.currentTask;

            if (!task) {
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
                completeTask(
                    task.id
                );
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
   COMPLETE TASK
========================================================= */

function completeTask(
    taskID
) {
    const task =
        state.tasks.find(
            item =>
                item.id ===
                taskID
        );

    if (!task) {
        return;
    }

    if (
        !isTaskCompleted(
            task.id
        )
    ) {
        task.completedSteps =
            task.steps.length;

        state.completedTasks.push(
            task
        );
    }

    if (
        state.currentTask &&
        state.currentTask.id ===
        task.id
    ) {
        state.currentTask =
            null;

        state.currentStep =
            0;
    }

    rebuildActiveTasks();

    saveState();

    closeTaskForm();

    renderEverything();
}


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(
    taskID
) {
    state.tasks =
        state.tasks.filter(
            task =>
                task.id !==
                taskID
        );

    state.completedTasks =
        state.completedTasks.filter(
            task =>
                task.id !==
                taskID
        );

    state.activeTasks =
        state.activeTasks.filter(
            task =>
                task.id !==
                taskID
        );

    if (
        state.currentTask &&
        state.currentTask.id ===
        taskID
    ) {
        state.currentTask =
            null;

        state.currentStep =
            0;
    }

    rebuildActiveTasks();

    saveState();

    closeTaskForm();

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
            "Due " +
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
    const safeMinutes =
        Math.max(
            0,
            Number(minutes) || 0
        );

    if (
        safeMinutes < 60
    ) {
        return `${safeMinutes} min`;
    }

    if (
        safeMinutes % 60 === 0
    ) {
        const hours =
            safeMinutes / 60;

        return hours === 1
            ? "1 hour"
            : `${hours} hours`;
    }

    const hours =
        Math.floor(
            safeMinutes / 60
        );

    const remainingMinutes =
        safeMinutes % 60;

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
        getWaitingTasks()
            .length;

    const percent =
        total > 0
            ? Math.round(
                finished /
                total *
                100
            )
            : 0;

    if (
        profilePercent
    ) {
        profilePercent.textContent =
            `${percent}%`;
    }

    if (
        profileActive
    ) {
        profileActive.textContent =
            active;
    }

    if (
        profileWaiting
    ) {
        profileWaiting.textContent =
            waiting;
    }

    if (
        profileFinished
    ) {
        profileFinished.textContent =
            finished;
    }
}


/* =========================================================
   CREATE PHASE 2 MANAGEMENT UI
========================================================= */

function createTaskManagementUI() {
    const planScreen =
        document.getElementById(
            "planScreen"
        );

    if (!planScreen) {
        return;
    }

    if (
        document.getElementById(
            "taskManagementSection"
        )
    ) {
        return;
    }

    const planContent =
        planScreen.querySelector(
            ".content"
        );

    if (!planContent) {
        return;
    }

    const managementSection =
        document.createElement(
            "section"
        );

    managementSection.id =
        "taskManagementSection";

    managementSection.className =
        "task-management-section";

    managementSection.innerHTML = `
        <div class="section-heading">
            <div>
                <p class="section-kicker">
                    MANAGE
                </p>

                <h2>
                    All tasks.
                </h2>
            </div>
        </div>

        <div class="management-card">
            <div class="management-header">
                <div class="management-header-copy">
                    <h3 class="management-title">
                        Your workload.
                    </h3>

                    <p class="management-description">
                        Add or correct a task without rebuilding your whole dump.
                    </p>
                </div>

                <button
                    class="add-task-button"
                    id="addTaskButton"
                    type="button"
                    aria-label="Add task"
                >
                    +
                </button>
            </div>

            <div
                class="management-list"
                id="managementTaskList"
            ></div>
        </div>

        <section
            class="waiting-section hidden"
            id="waitingSection"
        >
            <div class="section-heading">
                <div>
                    <p class="section-kicker">
                        WAITING
                    </p>

                    <h2>
                        Out of the way.
                    </h2>
                </div>
            </div>

            <div
                class="waiting-task-list"
                id="waitingTaskList"
            ></div>
        </section>
    `;

    const taskSections =
        planContent.querySelectorAll(
            "section"
        );

    const lastSection =
        taskSections[
            taskSections.length - 1
        ];

    if (lastSection) {
        lastSection.insertAdjacentElement(
            "afterend",
            managementSection
        );
    }
    else {
        planContent.appendChild(
            managementSection
        );
    }

    const addTaskButton =
        document.getElementById(
            "addTaskButton"
        );

    addTaskButton
        ?.addEventListener(
            "click",
            () => {
                openTaskForm();
            }
        );

    createTaskForm();
}


/* =========================================================
   CREATE TASK FORM
========================================================= */

function createTaskForm() {
    if (
        document.getElementById(
            "taskFormOverlay"
        )
    ) {
        return;
    }

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "taskFormOverlay";

    overlay.className =
        "task-form-overlay hidden";

    overlay.innerHTML = `
        <div
            class="task-form-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="taskFormTitle"
        >
            <div class="task-form-header">
                <div>
                    <h2
                        class="task-form-title"
                        id="taskFormTitle"
                    >
                        Add task.
                    </h2>

                    <p>
                        Give Overwhelm enough information
                        to place it correctly.
                    </p>
                </div>

                <button
                    class="close-task-form"
                    id="closeTaskFormButton"
                    type="button"
                    aria-label="Close task editor"
                >
                    ×
                </button>
            </div>

            <form
                class="task-form"
                id="taskForm"
            >
                <div class="form-field">
                    <label for="taskTitleInput">
                        Task
                    </label>

                    <input
                        id="taskTitleInput"
                        type="text"
                        placeholder="Finish college application"
                        autocomplete="off"
                        required
                    >
                </div>

                <div class="form-field">
                    <label for="taskDeadlineInput">
                        Exact deadline
                    </label>

                    <input
                        id="taskDeadlineInput"
                        type="datetime-local"
                    >

                    <p class="form-helper">
                        Leave this blank if you only know
                        a rough timeline.
                    </p>
                </div>

                <div class="form-field">
                    <label for="taskTimelineInput">
                        Timeline
                    </label>

                    <select
                        id="taskTimelineInput"
                    >
                        <option value="Today">
                            Today
                        </option>

                        <option value="Tomorrow">
                            Tomorrow
                        </option>

                        <option value="This week">
                            This week
                        </option>

                        <option value="Next week">
                            Next week
                        </option>

                        <option value="Soon">
                            Soon
                        </option>

                        <option
                            value="Eventually"
                            selected
                        >
                            Eventually
                        </option>
                    </select>
                </div>

                <div class="form-field">
                    <label for="taskDurationInput">
                        Estimated minutes
                    </label>

                    <input
                        id="taskDurationInput"
                        type="number"
                        min="5"
                        step="5"
                        value="60"
                        inputmode="numeric"
                        required
                    >
                </div>

                <p
                    class="task-form-message hidden"
                    id="taskFormMessage"
                    aria-live="polite"
                ></p>

                <div class="form-actions">
                    <button
                        class="secondary-button"
                        id="completeTaskButton"
                        type="button"
                    >
                        Mark complete
                    </button>

                    <button
                        class="save-task-button"
                        type="submit"
                    >
                        Save task
                    </button>
                </div>

                <div
                    class="task-form-danger-zone"
                    id="taskDangerZone"
                >
                    <button
                        class="danger-button"
                        id="deleteTaskButton"
                        type="button"
                    >
                        Delete task
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(
        overlay
    );

    const closeButton =
        document.getElementById(
            "closeTaskFormButton"
        );

    const taskForm =
        document.getElementById(
            "taskForm"
        );

    const completeButton =
        document.getElementById(
            "completeTaskButton"
        );

    const deleteButton =
        document.getElementById(
            "deleteTaskButton"
        );

    closeButton
        ?.addEventListener(
            "click",
            closeTaskForm
        );

    overlay.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                overlay
            ) {
                closeTaskForm();
            }
        }
    );

    taskForm
        ?.addEventListener(
            "submit",
            handleTaskFormSubmit
        );

    completeButton
        ?.addEventListener(
            "click",
            () => {
                if (
                    !state.editingTaskID
                ) {
                    return;
                }

                completeTask(
                    state.editingTaskID
                );
            }
        );

    deleteButton
        ?.addEventListener(
            "click",
            () => {
                if (
                    !state.editingTaskID
                ) {
                    return;
                }

                deleteTask(
                    state.editingTaskID
                );
            }
        );

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key ===
                "Escape" &&
                !overlay.classList.contains(
                    "hidden"
                )
            ) {
                closeTaskForm();
            }
        }
    );
}


/* =========================================================
   OPEN TASK FORM
========================================================= */

function openTaskForm(
    taskID = null
) {
    const overlay =
        document.getElementById(
            "taskFormOverlay"
        );

    const titleInput =
        document.getElementById(
            "taskTitleInput"
        );

    const deadlineInput =
        document.getElementById(
            "taskDeadlineInput"
        );

    const timelineInput =
        document.getElementById(
            "taskTimelineInput"
        );

    const durationInput =
        document.getElementById(
            "taskDurationInput"
        );

    const formTitle =
        document.getElementById(
            "taskFormTitle"
        );

    const completeButton =
        document.getElementById(
            "completeTaskButton"
        );

    const dangerZone =
        document.getElementById(
            "taskDangerZone"
        );

    const message =
        document.getElementById(
            "taskFormMessage"
        );

    if (!overlay) {
        return;
    }

    state.editingTaskID =
        taskID;

    if (message) {
        message.textContent =
            "";

        message
            .classList
            .add(
                "hidden"
            );
    }

    if (!taskID) {
        if (formTitle) {
            formTitle.textContent =
                "Add task.";
        }

        if (titleInput) {
            titleInput.value =
                "";
        }

        if (deadlineInput) {
            deadlineInput.value =
                "";
        }

        if (timelineInput) {
            timelineInput.value =
                "Eventually";
        }

        if (durationInput) {
            durationInput.value =
                "60";
        }

        completeButton
            ?.classList
            .add(
                "hidden"
            );

        dangerZone
            ?.classList
            .add(
                "hidden"
            );
    }
    else {
        const task =
            state.tasks.find(
                item =>
                    item.id ===
                    taskID
            );

        if (!task) {
            return;
        }

        if (formTitle) {
            formTitle.textContent =
                "Edit task.";
        }

        if (titleInput) {
            titleInput.value =
                task.title;
        }

        if (deadlineInput) {
            deadlineInput.value =
                task.deadline
                    ? formatDateForInput(
                        task.deadline
                    )
                    : "";
        }

        if (timelineInput) {
            timelineInput.value =
                task.timeline ||
                "Eventually";
        }

        if (durationInput) {
            durationInput.value =
                task.estimatedMinutes;
        }

        if (
            isTaskCompleted(
                taskID
            )
        ) {
            completeButton
                ?.classList
                .add(
                    "hidden"
                );
        }
        else {
            completeButton
                ?.classList
                .remove(
                    "hidden"
                );
        }

        dangerZone
            ?.classList
            .remove(
                "hidden"
            );
    }

    overlay
        .classList
        .remove(
            "hidden"
        );

    window.setTimeout(
        () => {
            titleInput
                ?.focus();
        },
        50
    );
}


/* =========================================================
   CLOSE TASK FORM
========================================================= */

function closeTaskForm() {
    const overlay =
        document.getElementById(
            "taskFormOverlay"
        );

    overlay
        ?.classList
        .add(
            "hidden"
        );

    state.editingTaskID =
        null;
}


/* =========================================================
   HANDLE TASK FORM
========================================================= */

function handleTaskFormSubmit(
    event
) {
    event.preventDefault();

    const titleInput =
        document.getElementById(
            "taskTitleInput"
        );

    const deadlineInput =
        document.getElementById(
            "taskDeadlineInput"
        );

    const timelineInput =
        document.getElementById(
            "taskTimelineInput"
        );

    const durationInput =
        document.getElementById(
            "taskDurationInput"
        );

    const message =
        document.getElementById(
            "taskFormMessage"
        );

    const title =
        titleInput
            ?.value
            .trim() || "";

    const estimatedMinutes =
        Number(
            durationInput
                ?.value
        );

    if (!title) {
        showTaskFormMessage(
            "Give the task a name."
        );

        return;
    }

    if (
        !estimatedMinutes ||
        estimatedMinutes < 5
    ) {
        showTaskFormMessage(
            "Estimated time must be at least 5 minutes."
        );

        return;
    }

    let deadline =
        null;

    if (
        deadlineInput
            ?.value
    ) {
        deadline =
            new Date(
                deadlineInput.value
            );

        if (
            Number.isNaN(
                deadline.getTime()
            )
        ) {
            showTaskFormMessage(
                "That deadline isn't valid."
            );

            return;
        }
    }

    const timeline =
        timelineInput
            ?.value ||
        "Eventually";

    if (
        state.editingTaskID
    ) {
        const task =
            state.tasks.find(
                item =>
                    item.id ===
                    state.editingTaskID
            );

        if (!task) {
            return;
        }

        const titleChanged =
            task.title !==
            title;

        task.title =
            title;

        task.original =
            title;

        task.deadline =
            deadline;

        task.timeline =
            timeline;

        task.estimatedMinutes =
            estimatedMinutes;

        updateTaskPriority(
            task
        );

        if (
            titleChanged
        ) {
            task.steps =
                generateSteps(
                    task
                );

            task.completedSteps =
                Math.min(
                    task.completedSteps,
                    task.steps.length
                );
        }
    }
    else {
        const newTask =
            createManualTask({
                title,
                deadline,
                timeline,
                estimatedMinutes
            });

        state.tasks.push(
            newTask
        );
    }

    rebuildActiveTasks();

    if (
        state.tasks.length > 0
    ) {
        resultsSection
            ?.classList
            .remove(
                "hidden"
            );
    }

    saveState();

    closeTaskForm();

    renderEverything();
}


/* =========================================================
   TASK FORM MESSAGE
========================================================= */

function showTaskFormMessage(
    text
) {
    const message =
        document.getElementById(
            "taskFormMessage"
        );

    if (!message) {
        return;
    }

    message.textContent =
        text;

    message
        .classList
        .remove(
            "hidden"
        );
}


/* =========================================================
   FORMAT DATE FOR INPUT
========================================================= */

function formatDateForInput(
    date
) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    const hours =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutes =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );

    return (
        `${year}-${month}-${day}T${hours}:${minutes}`
    );
}


/* =========================================================
   RENDER TASK MANAGEMENT
========================================================= */

function renderTaskManagement() {
    const list =
        document.getElementById(
            "managementTaskList"
        );

    if (!list) {
        return;
    }

    list.innerHTML =
        "";

    if (
        state.tasks.length === 0
    ) {
        list.innerHTML = `
            <div class="empty-management">
                <strong>
                    Nothing here yet.
                </strong>

                <p>
                    Add a task or use the dump
                    to build your workload.
                </p>
            </div>
        `;

        renderWaitingTasks();

        return;
    }

    const sortedTasks =
        [...state.tasks];

    sortedTasks.sort(
        (
            a,
            b
        ) => {
            const aFinished =
                isTaskCompleted(
                    a.id
                );

            const bFinished =
                isTaskCompleted(
                    b.id
                );

            if (
                aFinished !==
                bFinished
            ) {
                return aFinished
                    ? 1
                    : -1;
            }

            return (
                b.priorityScore -
                a.priorityScore
            );
        }
    );

    sortedTasks.forEach(
        task => {
            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "management-task";

            const active =
                state.activeTasks.some(
                    activeTask =>
                        activeTask.id ===
                        task.id
                );

            const finished =
                isTaskCompleted(
                    task.id
                );

            let stateLabel =
                "Waiting";

            let stateClass =
                "waiting";

            if (finished) {
                stateLabel =
                    "Finished";

                stateClass =
                    "finished";
            }
            else if (active) {
                stateLabel =
                    "Active";

                stateClass =
                    "active";
            }

            item.innerHTML = `
                <div class="management-task-main">
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
                        ·
                        ${escapeHTML(
                            formatDuration(
                                task.estimatedMinutes
                            )
                        )}
                    </p>

                    <div class="management-task-meta">
                        <span
                            class="
                                management-chip
                                ${stateClass}
                            "
                        >
                            ${stateLabel}
                        </span>

                        <span class="management-chip">
                            ${
                                task.priorityLevel ===
                                "urgent"
                                    ? "Urgent"
                                    : task.priorityLevel ===
                                      "soon"
                                        ? "Soon"
                                        : "Later"
                            }
                        </span>
                    </div>
                </div>

                <button
                    class="edit-task-button"
                    type="button"
                    aria-label="Edit ${escapeHTML(
                        task.title
                    )}"
                >
                    Edit
                </button>
            `;

            const editButton =
                item.querySelector(
                    ".edit-task-button"
                );

            editButton
                ?.addEventListener(
                    "click",
                    () => {
                        openTaskForm(
                            task.id
                        );
                    }
                );

            list.appendChild(
                item
            );
        }
    );

    renderWaitingTasks();
}


/* =========================================================
   RENDER WAITING TASKS
========================================================= */

function renderWaitingTasks() {
    const section =
        document.getElementById(
            "waitingSection"
        );

    const list =
        document.getElementById(
            "waitingTaskList"
        );

    if (
        !section ||
        !list
    ) {
        return;
    }

    const waiting =
        getWaitingTasks();

    list.innerHTML =
        "";

    if (
        waiting.length === 0
    ) {
        section
            .classList
            .add(
                "hidden"
            );

        return;
    }

    section
        .classList
        .remove(
            "hidden"
        );

    waiting.forEach(
        task => {
            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "waiting-task-card";

            card.innerHTML = `
                <div>
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
                        ·
                        ${escapeHTML(
                            formatDuration(
                                task.estimatedMinutes
                            )
                        )}
                    </p>
                </div>

                <button
                    class="edit-task-button"
                    type="button"
                    aria-label="Edit ${escapeHTML(
                        task.title
                    )}"
                >
                    Edit
                </button>
            `;

            card
                .querySelector(
                    ".edit-task-button"
                )
                ?.addEventListener(
                    "click",
                    () => {
                        openTaskForm(
                            task.id
                        );
                    }
                );

            list.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderEverything() {
    rebuildActiveTasks();

    renderTaskLists();

    renderIntervention();

    renderPlanProgress();

    renderFocus();

    renderProfile();

    renderTaskManagement();

    drawCalendar(
        "homeCalendar"
    );

    drawCalendar(
        "planCalendar"
    );

    if (
        state.tasks.length > 0
    ) {
        resultsSection
            ?.classList
            .remove(
                "hidden"
            );
    }
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

    if (
        screenID ===
        "planScreen"
    ) {
        renderTaskManagement();
    }

    window.scrollTo(
        {
            top: 0,

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
                            stressInput
                                ?.focus();

                            stressInput
                                ?.scrollIntoView(
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
    ?.addEventListener(
        "click",
        organizeDump
    );


/* =========================================================
   SAVE DUMP WHILE TYPING
========================================================= */

stressInput
    ?.addEventListener(
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
   INITIALIZE PHASE 2 UI
========================================================= */

createTaskManagementUI();


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
        ?.classList
        .remove(
            "hidden"
        );
}


/* =========================================================
   INITIAL LOAD
========================================================= */

renderEverything();