document.addEventListener('DOMContentLoaded', () => {
    let timerInterval; //store interval ID for  timer
 
    //start timer
function startTimer() {
    let seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        //hours, minutes, and seconds format with zeros
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(secs).padStart(2, '0');

        //update the timer display with the formatted time
        document.getElementById('timer-display').textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }, 1000); // update every second (1000 milliseconds)
}

    //stop timer
    function stopTimer() {
        clearInterval(timerInterval); 
    }

    //start timer button
    document.getElementById('start-timer-btn').addEventListener('click', startTimer);

    //stop timer button
    document.getElementById('stop-timer-btn').addEventListener('click', stopTimer);
});