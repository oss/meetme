import { TimeBlock } from "./meeting-grid";

export type UserTimes = {
    times: TimeBlock[];
    _id: string;
}

/**
 * This function sorts and merges all the timeblocks in `times` into `timeline`.
 * Example of merging: [{1,5}, {3, 4}, {0,2}, {9,10}] --> [{0,5}, {9,10}]
 *
 * @param timeline
 * @param times
 * @returns
 */
export function getSortedMergedTimeblocks(
    timeline: TimeBlock[],
    times: TimeBlock[]
): TimeBlock[] {
    timeline = [...timeline, ...times];
    timeline = timeline.sort((a, b) => {
        if (a.start == b.start) {
            return b.end - a.end;
        }
        return a.start - b.start;
    });
    let merged: TimeBlock[] = [timeline[0]];
    for (let i = 0; i < timeline.length; i++) {
        let last = merged[merged.length - 1];
        if (
            timeline[i].start == last.start ||
            (timeline[i].start >= last.start && timeline[i].end <= last.end)
        ) {
            continue;
        } else if (
            last.end > timeline[i].start &&
            timeline[i].end >= last.end
        ) {
            merged[merged.length - 1] = {
                start: last.start,
                end: timeline[i].end,
            };
        } else {
            merged.push(timeline[i]);
        }
    }
    return merged;
}

/**
 * Splits the timeblocks in the original timeline at the starts and ends of `time` and returns it
 * Note: it can split it at most 2 places, either the start of `time` or the end or both
 *
 * Timeline:
 * |-------------------|     |-------------|           |------------------|
 *
 * time:
 *                |------------------------------------------|
 *
 * Result:
 * |--------------|----|     |-------------|           |-----|------------|
 *
 * ^ please go to the actual code to see the above visual properly
 * @param timeline
 * @param time
 * @returns the timeline after splitting the timeblocks at the start and end of `time`
 */
function breakTimeline(timeline: TimeBlock[], time: TimeBlock) {
    let result1: TimeBlock[] = [];
    for (let i = 0; i < timeline.length; i++) {
        if (time.start > timeline[i].start && time.start < timeline[i].end) {
            result1.push({ start: timeline[i].start, end: time.start });
            result1.push({ start: time.start, end: timeline[i].end });
        } else {
            result1.push(timeline[i]);
        }
    }
    let result2: TimeBlock[] = [];
    for (let i = 0; i < result1.length; i++) {
        if (time.end > result1[i].start && time.end < result1[i].end) {
            result2.push({ start: result1[i].start, end: time.end });
            result2.push({ start: time.end, end: result1[i].end });
        } else {
            result2.push(result1[i]);
        }
    }

    return result2;
}
/**
 * This function returns the updated timeline after removing the times in toBeRemoved.
 *
 * @param timeline
 * @param toBeRemoved
 * @returns updated timeline with the removed times
 */
export function getRemovedTimeline(
    timeline: TimeBlock[],
    toBeRemoved: TimeBlock[]
): TimeBlock[] {
    if (toBeRemoved.length == 0) {
        return timeline;
    }

    let brokenTimeline: TimeBlock[] = breakTimeline(timeline, toBeRemoved[0]);
    for (let i = 1; i < toBeRemoved.length; i++) {
        brokenTimeline = breakTimeline(brokenTimeline, toBeRemoved[i]);
    }
    brokenTimeline.sort((a, b) => {
        if (a.start == b.start) {
            return b.end - a.end;
        }
        return a.start - b.start;
    });

    let result: TimeBlock[] = [];
    for (let i = 0; i < brokenTimeline.length; i++) {
        let isRemoved = false;
        for (let j = 0; j < toBeRemoved.length; j++) {
            if (
                brokenTimeline[i].start >= toBeRemoved[j].start &&
                brokenTimeline[i].end <= toBeRemoved[j].end
            ) {
                isRemoved = true;
                break;
            }
        }
        if (!isRemoved) {
            result.push(brokenTimeline[i]);
        }
    }
    result.sort((a, b) => {
        return a.start - b.start;
    });
    if (result.length == 0) {
        return [];
    }
    let mergedResult: TimeBlock[] = [result[0]];
    for (let i = 1; i < result.length; i++) {
        while (
            i < result.length &&
            mergedResult[mergedResult.length - 1].end == result[i].start
        ) {
            mergedResult[mergedResult.length - 1].end = result[i].end;
            i++;
        }
        if (i < result.length) {
            mergedResult.push(result[i]);
        }
    }
    return mergedResult;
}

/**
 * This function returns a 2D array of booleans representing the grid.
 * Each element in the array represents a block in the grid.
 * True indicates that the block is selected.
 *
 * @param timeLine
 * @param meetingArray
 * @returns a 2D array of booleans representing the grid
 */
export function getGridFromBlocks(
    timeLine: TimeBlock[],
    meetingArray: TimeBlock[][]
) {
    let preloadedGrid: boolean[][] = Array.from(
        { length: meetingArray[0].length },
        () => Array.from({ length: meetingArray.length }, () => false)
    );

    timeLine.forEach((timeblock) => {
        for (let day = 0; day < meetingArray.length; day++) {
            for (let block = 0; block < meetingArray[day].length; block++) {
                let meeting = meetingArray[day][block];
                if (
                    meeting.start != null &&
                    meeting.start >= timeblock.start &&
                    meeting.end <= timeblock.end
                ) {
                    preloadedGrid[block][day] = true;
                }
            }
        }
    });

    return preloadedGrid;
}

/**
 * This function returns the time at which daylight savings time starts on the given date. Eg, it returns 3 AM if 2 - 3AM is skipped that day.
 * If the time is not skipped that day, then it returns -1.
 *
 * @param date
 * @returns the time at which daylight savings time starts on the given date in minutes from 12 AM.
 */
function getStartOfDaylightSavingsTime(date: Date): number {
    // check in 30 minute intervals
    let day = new Date(date);
    day.setHours(0, 0, 0, 0);
    if (day.getHours() != 0 || day.getMinutes() != 0) {
        return day.getHours() * 60 + day.getMinutes();
    }
    for (let i = 0; i < 48; i += 1) {
        let nextInterval = new Date(day.getTime() + i * 30 * 60 * 1000);
        if (nextInterval.getTimezoneOffset() < day.getTimezoneOffset()) {
            return nextInterval.getHours() * 60 + nextInterval.getMinutes();
        }
    }
    return -1;
}

/**
 * This function returns the time interval at which daylight savings time ends on the given date in minutes from the beginning of the day.
 * Eg. it returns {3 * 60, 4* 60} if 3 - 4AM is repeated that day.
 * If no intervals are repeated that day, then it returns {null, null}
 * @param date The date to check whether time interval is repeated
 * @returns The time interval that is repeated that day in minutes from 12AM
 */
function getDaylightSavingsRepeatedInterval(date: Date): TimeBlock {
    // check in 30 minute intervals
    let day = new Date(date);
    day.setHours(0, 0, 0, 0);
    for (let i = 0; i < 48; i += 1) {
        let nextInterval = new Date(day.getTime() + i * 30 * 60 * 1000);
        if (nextInterval.getTimezoneOffset() > day.getTimezoneOffset()) {
            return {
                start: nextInterval.getHours() * 60 + nextInterval.getMinutes(),
                end:
                    nextInterval.getHours() * 60 +
                    nextInterval.getMinutes() +
                    nextInterval.getTimezoneOffset() -
                    day.getTimezoneOffset(),
            };
        }
    }
    return { start: null, end: null };
}
/**
 *
 * This function creates a 2d grid of TimeBlocks, where each TimeBlock represents a potential meeting time. Each ROW in the grid is a day and each column is a time block.
 * The grid is NOT stored as shown in the UI, but instead, it is transposed.
 *
 * @param blocksPerDay
 * @param numDays
 * @param potentialMeetings
 * @param startHour
 * @param timeIntervals
 * @returns
 */
export function createMeetingArray(
    blocksPerDay: number,
    numDays: number,
    potentialMeetings: Date[],
    startHour: Date,
    timeIntervals: number
): TimeBlock[][] {
    let dayArray: TimeBlock[][] = new Array(numDays);
    for (let i = 0; i < numDays; i++) {
        dayArray[i] = new Array(blocksPerDay);
    }

    // this code is to handle when times are skipped due to daylight savings time
    for (let day = 0; day < dayArray.length; day++) {
        potentialMeetings[day].setHours(startHour.getHours());
        potentialMeetings[day].setMinutes(startHour.getMinutes());

        let startOfDay = potentialMeetings[day];
        let minutesFrom0AM = getStartOfDaylightSavingsTime(startOfDay);
        for (let block = 0; block < dayArray[day].length; block++) {
            let interval = {
                start: new Date(
                    startOfDay.getTime() + timeIntervals * block * 60 * 1000
                ),
                end: new Date(
                    startOfDay.getTime() +
                    timeIntervals * (block + 1) * 60 * 1000
                ),
            };

            if (
                startHour.getHours() * 60 + startHour.getMinutes() <
                startOfDay.getHours() * 60 + startOfDay.getMinutes()
            ) {
                // this is when a day starts in the time that is skipped. For example, calendar = Mar 11, 12, 13 and start hour is 2:30 AM.
                // Problem is, 2 - 3AM is skipped on Mar 12, so 2:30 --> 3:00 need to be null on March 12.
                let intervalsSkipped =
                    (minutesFrom0AM -
                        (startHour.getHours() * 60 + startHour.getMinutes())) /
                    timeIntervals;
                if (intervalsSkipped > 0) {
                    for (let i = 0; i < intervalsSkipped; i++) {
                        dayArray[day][i] = {
                            start: null,
                            end: null,
                        };
                    }
                    for (
                        let i = intervalsSkipped;
                        i < dayArray[day].length;
                        i++
                    ) {
                        dayArray[day][i] = {
                            start: new Date(
                                startOfDay.getTime() +
                                (i - intervalsSkipped) *
                                60 *
                                1000 *
                                timeIntervals -
                                timeIntervals * intervalsSkipped * 60 * 1000
                            ).getTime(),
                            end: new Date(
                                startOfDay.getTime() +
                                (i - intervalsSkipped + 1) *
                                60 *
                                1000 *
                                timeIntervals -
                                timeIntervals * intervalsSkipped * 60 * 1000
                            ).getTime(),
                        };
                    }
                    break;
                }
            }
            if (
                startOfDay.getTimezoneOffset() >
                interval.start.getTimezoneOffset()
            ) {
                // time was skipped
                let intervalsSkipped =
                    (startOfDay.getTimezoneOffset() -
                        interval.start.getTimezoneOffset()) /
                    timeIntervals;
                // leave the skipped time blank
                for (let i = block; i < block + intervalsSkipped; i++) {
                    dayArray[day][i] = {
                        start: null,
                        end: null,
                    };
                }
                // fill in the rest of the time after the skipped time
                for (
                    let i = block + intervalsSkipped;
                    i < dayArray[day].length;
                    i++
                ) {
                    dayArray[day][i] = {
                        start: new Date(
                            startOfDay.getTime() +
                            (i - intervalsSkipped) *
                            60 *
                            1000 *
                            timeIntervals
                        ).getTime(),
                        end: new Date(
                            startOfDay.getTime() +
                            (i - intervalsSkipped + 1) *
                            60 *
                            1000 *
                            timeIntervals
                        ).getTime(),
                    };
                }
                break;
            } else {
                dayArray[day][block] = {
                    start: interval.start.getTime(),
                    end: interval.end.getTime(),
                };
            }
        }
    }

    // at this point, skipped times are taken into account. From here on, the code will take repeated times into account.

    let repeatedInterval: TimeBlock = { start: null, end: null };
    let daylightEndDay = -1;
    for (let day = 0; day < dayArray.length; day++) {
        let minutes = getDaylightSavingsRepeatedInterval(
            potentialMeetings[day]
        );
        if (minutes.start != null) {
            repeatedInterval = minutes;
            daylightEndDay = day;
            break;
        }
    }
    // getting the second repeated interval here. Eg. if 1-2AM is repeated twice, then this will update repeated interval to be the second 1-2AM
    const intervalLength = repeatedInterval.end - repeatedInterval.start;
    repeatedInterval.start += intervalLength;
    repeatedInterval.end += intervalLength;

    if (repeatedInterval.start != null) {
        // this inserts extra columns for everyday except for the day of the end of daylight savings time and makes all the start and end times null
        // for those values
        for (let day = 0; day < dayArray.length; day++) {
            let numExtraBlocks =
                (repeatedInterval.end - repeatedInterval.start) / timeIntervals;

            let currentDayStart = new Date(dayArray[day][0].start);
            let currentDayStartMinute =
                currentDayStart.getMinutes() + currentDayStart.getHours() * 60;
            if (currentDayStartMinute >= repeatedInterval.start) {
                numExtraBlocks = 0;
            }
            if (day == daylightEndDay) {
                let lastTime =
                    dayArray[day].length > 0
                        ? dayArray[day][dayArray[day].length - 1].end
                        : 0;
                for (let i = 0; i < numExtraBlocks; i++) {
                    dayArray[day].push({
                        start: lastTime + i * 60 * 1000 * timeIntervals,
                        end: lastTime + (i + 1) * 60 * 1000 * timeIntervals,
                    });
                }
            } else {
                let insertIndex =
                    (repeatedInterval.start - currentDayStartMinute) /
                    timeIntervals;
                for (let i = 0; i < numExtraBlocks; i++) {
                    dayArray[day].splice(insertIndex, 0, {
                        start: null,
                        end: null,
                    });
                }
            }
        }
    }
    return dayArray;
}
