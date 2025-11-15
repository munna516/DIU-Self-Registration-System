export function getPreviousSemester() {
    // Get today's date
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const currentYear = today.getFullYear();

    // Determine current semester based on month
    // Jan (1) to April (4) = Spring
    // May (5) to August (8) = Summer
    // September (9) to December (12) = Fall
    let currentSemester, currentSemesterYear;
    if (currentMonth >= 1 && currentMonth <= 4) {
        currentSemester = "spring";
        currentSemesterYear = currentYear;
    } else if (currentMonth >= 5 && currentMonth <= 8) {
        currentSemester = "summer";
        currentSemesterYear = currentYear;
    } else {
        currentSemester = "fall";
        currentSemesterYear = currentYear;
    }

    // Determine previous semester
    let previousSemester, previousSemesterYear;
    if (currentSemester === "spring") {
        // Previous of Spring is Fall of previous year
        previousSemester = "fall";
        previousSemesterYear = currentSemesterYear - 1;
    } else if (currentSemester === "summer") {
        // Previous of Summer is Spring of same year
        previousSemester = "spring";
        previousSemesterYear = currentSemesterYear;
    } else {
        // Previous of Fall is Summer of same year
        previousSemester = "summer";
        previousSemesterYear = currentSemesterYear;
    }
    return `${previousSemester} ${previousSemesterYear}`;
}