const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAYS = {
  'Monday': 'Mon',
  'Tuesday': 'Tue',
  'Wednesday': 'Wed',
  'Thursday': 'Thu',
  'Friday': 'Fri',
  'Saturday': 'Sat',
  'Sunday': 'Sun'
};

export const formatSchedule = (schedule) => {
  if (!schedule || typeof schedule !== 'object' || Object.keys(schedule).length === 0) {
    return { text: 'Schedule not set', days: [], timeRange: null };
  }

  // Get days with slots and sort them according to DAYS_ORDER
  const daysWithSlots = Object.entries(schedule)
    .filter(([_, slots]) => slots && slots.length > 0)
    .map(([day]) => day)
    .sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));

  if (daysWithSlots.length === 0) {
    return { text: 'No available slots', days: [], timeRange: null };
  }

  // Get earliest and latest times from all days
  let earliestTime = '23:59';
  let latestTime = '00:00';

  Object.values(schedule).forEach(slots => {
    if (slots && slots.length > 0) {
      slots.forEach(time => {
        if (time < earliestTime) earliestTime = time;
        if (time > latestTime) latestTime = time;
      });
    }
  });

  // Format the days with ranges
  const formattedRanges = [];
  let currentRange = [];

  for (let i = 0; i < daysWithSlots.length; i++) {
    const currentDay = daysWithSlots[i];
    const nextDay = daysWithSlots[i + 1];
    const currentDayIndex = DAYS_ORDER.indexOf(currentDay);
    const nextDayIndex = nextDay ? DAYS_ORDER.indexOf(nextDay) : -1;

    currentRange.push(currentDay);

    if (nextDayIndex - currentDayIndex !== 1 || i === daysWithSlots.length - 1) {
      // End of a range
      if (currentRange.length > 2) {
        // Range of 3 or more days: format as 'First-Last'
        formattedRanges.push(`${SHORT_DAYS[currentRange[0]]}-${SHORT_DAYS[currentRange[currentRange.length - 1]]}`);
      } else {
        // Individual days or just two days: format as comma-separated
        formattedRanges.push(currentRange.map(day => SHORT_DAYS[day]).join(','));
      }
      currentRange = [];
    }
  }

  // Format the time range
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const timeRange = {
    start: formatTime(earliestTime),
    end: formatTime(latestTime)
  };

  return {
    text: `Available: ${formattedRanges.join(', ')}, ${timeRange.start} - ${timeRange.end}`,
    days: daysWithSlots,
    timeRange,
    shortDays: formattedRanges.join(', ')
  };
};

export const getDaySchedule = (schedule, day) => {
  if (!schedule || !schedule[day] || !Array.isArray(schedule[day])) {
    return [];
  }
  return schedule[day].sort();
};

export const FULL_TO_SHORT_DAYS = SHORT_DAYS;