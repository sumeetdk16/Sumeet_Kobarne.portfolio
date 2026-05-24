// Footer live time display
(function() {
  function formatTime() {
    const now = new Date();
    
    // Format time as HH:MM:SS AM/PM
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    // Get day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[now.getDay()];
    
    // Get date
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    return `${displayHours}:${minutes}:${seconds} ${ampm}\n${dayName}, ${monthName} ${date}, ${year} (GMT +05:30)`;
  }

  function updateTime() {
    const timeString = formatTime();
    const timeElements = document.querySelectorAll('[id^="footer-time"]');
    
    timeElements.forEach(el => {
      if (el) {
        el.textContent = timeString;
      }
    });
  }

  function init() {
    // Update immediately on load
    updateTime();
    
    // Update every second
    setInterval(updateTime, 1000);
  }

  // Initialize as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM is already ready
    init();
  }
})();
