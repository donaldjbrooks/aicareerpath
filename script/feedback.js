document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedback-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const feedback = {
                name: document.getElementById('feedback-name').value || 'Anonymous',
                email: document.getElementById('feedback-email').value || 'Not provided',
                type: document.getElementById('feedback-type').value,
                comments: document.getElementById('feedback-comments').value,
                timestamp: new Date().toISOString()
            };

            // Store feedback locally (for demo purposes)
            let storedFeedback = JSON.parse(localStorage.getItem('feedback')) || [];
            storedFeedback.push(feedback);
            localStorage.setItem('feedback', JSON.stringify(storedFeedback));

            showNotification('Feedback submitted successfully! Thank you for your input.', 'success');
            form.reset();
        } catch (error) {
            showNotification('Error submitting feedback. Please try again.', 'error');
            console.error('Feedback submission error:', error);
        }
    });
});

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}