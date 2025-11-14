export function getStudentTerm(studentId, currentSemester = null) {
  if (!studentId || typeof studentId !== "string") {
    throw new Error("Student ID must be a valid string");
  }

  const parts = studentId.split("-");
  if (parts.length !== 3) {
    throw new Error('Invalid student ID. Expected: "221-15-5148"');
  }

  const firstPart = parts[0];
  if (firstPart.length !== 3 || isNaN(firstPart)) {
    throw new Error("Invalid student ID format. First part must be 3 digits");
  }

  // Extract admission info
  const yearCode = parseInt(firstPart.substring(0, 2)); // e.g. 25 -> 2025
  const season = parseInt(firstPart.substring(2)); // 1,2,3
  const admissionYear = 2000 + yearCode;

  const seasons = {
    1: "Spring",
    2: "Summer",
    3: "Fall",
  };

  const termMap = {
    Spring: 1,
    Summer: 2,
    Fall: 3,
  };

  const admissionTerm = termMap[seasons[season]];

  // Determine current semester
  let current;
  if (!currentSemester) {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    if (month >= 1 && month <= 4) current = { semester: "Spring", year };
    else if (month >= 5 && month <= 8) current = { semester: "Summer", year };
    else current = { semester: "Fall", year };
  } else {
    current = currentSemester;
  }

  const currentTerm = termMap[current.semester];
  const currentYear = current.year;

  // 🔥 Calculate total semesters passed since admission
  const termDifference =
    (currentYear - admissionYear) * 3 + (currentTerm - admissionTerm);

  let level, term;

  if (termDifference <= 0) {
    // The student is in their first semester (admission semester)
    level = 1;
    term = 1;
  } else {
    // Example: 0 → T1, 1 → T2, 2 → T3, 3 → next level T1...
    level = Math.floor(termDifference / 3) + 1;
    term = (termDifference % 3) + 1;
  }

  return `L${level}T${term}`;
}