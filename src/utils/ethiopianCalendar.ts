// utils/ethiopianCalendar.ts

interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  monthNameAm: string;
  monthNameEn: string;
  dayNameAm: string;
  dayNameEn: string;
}

// Ethiopian month names in Amharic and English
const ETHIOPIAN_MONTHS_AM = [
  "መስከረም",
  "ጥቅምት",
  "ህዳር",
  "ታህሳስ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዚያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜ"
];

const ETHIOPIAN_MONTHS_EN = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miyazya",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehasse",
  "Pagume"
];

// Ethiopian day names
const ETHIOPIAN_DAYS_AM = [
  "ሰኞ",
  "ማክሰኞ",
  "ረቡዕ",
  "ሐሙስ",
  "ዓርብ",
  "ቅዳሜ",
  "እሑድ"
];

const ETHIOPIAN_DAYS_EN = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

// Convert Gregorian date to Ethiopian date
export function convertToEthiopian(gregorianDate: Date): EthiopianDate {
  const gregorianYear = gregorianDate.getFullYear();
  const gregorianMonth = gregorianDate.getMonth(); // 0-indexed
  const gregorianDay = gregorianDate.getDate();

  // Calculate Ethiopian date
  // Ethiopian New Year starts on September 11/12
  let ethiopianYear = gregorianYear - 8;
  let ethiopianMonth, ethiopianDay;
  
  if (gregorianMonth >= 8) { // September or later
    if (gregorianMonth === 8 && gregorianDay < 11) { // Before September 11
      ethiopianYear--;
      ethiopianMonth = 13; // Pagume
      // Calculate day in Pagume
      if (gregorianYear % 4 === 3) { // Ethiopian leap year
        ethiopianDay = gregorianDay + 20; // 6 days in Pagume
      } else {
        ethiopianDay = gregorianDay + 21; // 5 days in Pagume
      }
    } else {
      // Calculate month and day
      const daysSinceSeptember = Math.floor((gregorianDate.getTime() - new Date(gregorianYear, 8, 11).getTime()) / (1000 * 60 * 60 * 24));
      ethiopianMonth = Math.floor(daysSinceSeptember / 30) + 1;
      ethiopianDay = (daysSinceSeptember % 30) + 1;
    }
  } else { // January to August
    const previousYear = gregorianYear - 1;
    const daysSinceSeptember = Math.floor((gregorianDate.getTime() - new Date(previousYear, 8, 11).getTime()) / (1000 * 60 * 60 * 24));
    ethiopianMonth = Math.floor(daysSinceSeptember / 30) + 1;
    ethiopianDay = (daysSinceSeptember % 30) + 1;
  }

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = gregorianDate.getDay();
  const ethiopianDayIndex = (dayOfWeek + 6) % 7; // Convert to Ethiopian week (Monday = 0)

  return {
    year: ethiopianYear,
    month: ethiopianMonth,
    day: ethiopianDay,
    monthNameAm: ETHIOPIAN_MONTHS_AM[ethiopianMonth - 1],
    monthNameEn: ETHIOPIAN_MONTHS_EN[ethiopianMonth - 1],
    dayNameAm: ETHIOPIAN_DAYS_AM[ethiopianDayIndex],
    dayNameEn: ETHIOPIAN_DAYS_EN[ethiopianDayIndex]
  };
}

// Format Ethiopian date for display
export function formatEthiopianDate(ethDate: EthiopianDate, language: string): string {
  if (language === 'am') {
    return `${ethDate.day} ${ethDate.monthNameAm} ${ethDate.year} ዓ.ም, ${ethDate.dayNameAm}`;
  } else {
    return `${ethDate.day} ${ethDate.monthNameEn} ${ethDate.year} EC, ${ethDate.dayNameEn}`;
  }
}

// Get current Ethiopian date
export function getCurrentEthiopianDate(): EthiopianDate {
  return convertToEthiopian(new Date());
}

// Convert Ethiopian date to Gregorian date
export function convertToGregorian(ethDate: EthiopianDate): Date {
  const ethYear = ethDate.year;
  const ethMonth = ethDate.month;
  const ethDay = ethDate.day;
  
  // Calculate Gregorian year
  const gregorianYear = ethYear + 8;
  
  // Calculate days since Ethiopian New Year
  let daysSinceNewYear;
  if (ethMonth === 13) { // Pagume
    daysSinceNewYear = 360 + ethDay;
  } else {
    daysSinceNewYear = (ethMonth - 1) * 30 + ethDay;
  }
  
  // Calculate Gregorian date (Ethiopian New Year is September 11)
  const newYearDate = new Date(gregorianYear, 8, 11); // September 11
  const gregorianDate = new Date(newYearDate.getTime() + daysSinceNewYear * 24 * 60 * 60 * 1000);
  
  return gregorianDate;
}