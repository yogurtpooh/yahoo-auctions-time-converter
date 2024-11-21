console.log("Content script loaded");

function convertTime(japanTimeStr, format) {
    let timeMatch;

    //clean the string by removing jp text and ensuring space between date and time
    japanTimeStr = japanTimeStr.replace(/\(\S\)/, '').trim(); //remove day of the week parentheses
    japanTimeStr = japanTimeStr.replace(/[^0-9:.\/\-\s]/g, '').trim(); //remove non-date characters

    // Ensure there's a space between date and time
    japanTimeStr = japanTimeStr.replace(/(\d{2})(?=\d{2}:\d{2})/, '$1 ');

    //formatting for different time types
    if (format === 'Count__endDate') {
        //matches MM/DD HH:MM (after cleaning)
        timeMatch = japanTimeStr.match(/(\d+\/\d+)\s+(\d+:\d+)/);
    } else if (format === 'Section__tableData') {
        //matches YYYY.MM.DD HH:MM (after cleaning)
        timeMatch = japanTimeStr.match(/(\d{4}\.\d{2}\.\d{2})\s+(\d+:\d+)/);
    }

    if (!timeMatch) {
        console.log(`No match found for ${japanTimeStr}`);
        return japanTimeStr;
    }

    let japanDatePart, japanTimePart;

    if (format === 'Count__endDate') {
        japanDatePart = timeMatch[1]; // MM/DD
        japanTimePart = timeMatch[2]; // HH:MM

        const currentYear = new Date().getFullYear();
        japanDatePart = `${currentYear}-${japanDatePart.replace("/", "-")}`;
    } else if (format === 'Section__tableData') {
        japanDatePart = timeMatch[1].replace(/\./g, "-"); //YYYY.MM.DD to YYYY-MM-DD
        japanTimePart = timeMatch[2]; //HH:MM
    }

    //split date and time
    const [year, month, day] = japanDatePart.split('-');
    const [hours, minutes] = japanTimePart.split(':');

    //date object for jst
    const japanTime = new Date(Date.UTC(year, month - 1, day, hours - 9, minutes)); //UTC+9 offset

    if (isNaN(japanTime.getTime())) {
        console.log(`Failed to parse Japan time: ${japanTimePart}`);
        return japanTimeStr;
    }

    const localTime = japanTime; //convert to your system's local time
    console.log(`Converted time: ${localTime.toLocaleString()}`);

    return localTime.toLocaleString(); 
}

window.addEventListener('load', () => {
    console.log("Page fully loaded. Running time conversion...");

    //elements with the class "Count__endDate"
    document.querySelectorAll(".Count__endDate").forEach(element => {
        console.log("Found .Count__endDate element: ", element);
        const japanTime = element.innerText.trim();
        const localTime = convertTime(japanTime, 'Count__endDate');
        element.innerText = localTime;
    });

    //elements with the class "Section__tableData"
    document.querySelectorAll(".Section__tableData").forEach(element => {
        console.log("Found .Section__tableData element: ", element);
        const japanTime = element.innerText.trim();
        if (/\d{4}\.\d{2}\.\d{2}/.test(japanTime)) {
            const localTime = convertTime(japanTime, 'Section__tableData');
            element.innerText = localTime;
        }
    });
});