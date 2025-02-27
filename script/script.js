const { jsPDF } = window.jspdf;

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

function getFormData() {
    try {
        const formData = {};
        document.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.id) {
                formData[el.id] = el.type === 'select-multiple' 
                    ? Array.from(el.selectedOptions).map(opt => opt.value)
                    : el.value;
            }
        });
        return formData;
    } catch (error) {
        showNotification('Error collecting form data', 'error');
        throw error;
    }
}

function setFormValues(values) {
    try {
        Object.entries(values).forEach(([key, value]) => {
            const el = document.getElementById(key);
            if (el) {
                if (el.type === 'select-multiple') {
                    Array.from(el.options).forEach(opt => {
                        opt.selected = Array.isArray(value) && value.includes(opt.value);
                    });
                } else {
                    el.value = value;
                }
            }
        });
    } catch (error) {
        showNotification('Error setting form values', 'error');
        throw error;
    }
}

function formatDate(dateString) {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function saveForm() {
    try {
        const data = getFormData();
        localStorage.setItem('formValues', JSON.stringify(data));
        showNotification('Form saved successfully', 'success');
    } catch (error) {
        showNotification('Error saving form', 'error');
        console.error('Save error:', error);
    }
}

function loadForm() {
    try {
        const data = localStorage.getItem('formValues');
        if (!data) throw new Error('No saved data');
        setFormValues(JSON.parse(data));
        showNotification('Form loaded successfully', 'success');
    } catch (error) {
        showNotification('No saved data or error loading', 'error');
        console.error('Load error:', error);
    }
}

function exportForm() {
    try {
        const data = getFormData();
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'career_plan.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('JSON exported successfully', 'success');
    } catch (error) {
        showNotification('Error exporting JSON', 'error');
        console.error('Export error:', error);
    }
}

function exportToPDF() {
    try {
        const formData = getFormData();
        const doc = new jsPDF();
        let yPos = 20;

        function addText(text, x, y, options = {}) {
            const maxWidth = options.maxWidth || 170;
            const lineHeight = options.lineHeight || 7;
            const splitText = doc.splitTextToSize(text, maxWidth);
            splitText.forEach(line => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(line, x, yPos);
                yPos += lineHeight;
            });
            return yPos;
        }

        doc.setFontSize(20);
        doc.setTextColor('#1e3a8a');
        addText('AI Career Transition Plan', 105, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(16);
        addText('Personal Information', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        addText(`Name: ${formData.name || 'Not provided'}`, 20, yPos);
        addText(`Role: ${formData.role || 'Not provided'}`, 20, yPos);
        addText(`Industry: ${formData.industry || 'Not provided'}`, 20, yPos);
        addText(`Period: ${formatDate(formData['start-date'])} to ${formatDate(formData['end-date'])}`, 20, yPos);
        yPos += 15;

        doc.setFontSize(16);
        doc.setTextColor('#1e3a8a');
        addText('Career Goals', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        addText('Short-term (6-12 months):', 20, yPos);
        yPos = addText(formData['short-term'] || 'Not provided', 30, yPos);
        addText('Long-term (2-5 years):', 20, yPos);
        yPos = addText(formData['long-term'] || 'Not provided', 30, yPos);
        addText(`Core Values: ${formData['core-values'].join(', ') || 'None selected'}`, 20, yPos);
        addText('Elevator Pitch:', 20, yPos);
        yPos = addText(formData['elevator-pitch'] || 'Not provided', 30, yPos);
        addText('Stop Doing:', 20, yPos);
        yPos = addText(formData['stop-doing'] || 'Not provided', 30, yPos);
        yPos += 15;

        doc.setFontSize(16);
        doc.setTextColor('#1e3a8a');
        addText('Skills Assessment', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        document.querySelectorAll('#skills-table tbody tr').forEach((row, i) => {
            const current = row.cells[0].querySelector('input').value || 'Not specified';
            const prof = row.cells[1].querySelector('select').value || 'N/A';
            const develop = row.cells[2].querySelector('input').value || 'Not specified';
            const priority = row.cells[3].querySelector('select').value || 'N/A';
            addText(`${i+1}. ${current} (Prof: ${prof}) - To Develop: ${develop} (Priority: ${priority})`, 20, yPos);
        });
        yPos += 15;

        doc.setFontSize(16);
        doc.setTextColor('#1e3a8a');
        addText('Learning and Development Plan', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        document.querySelectorAll('#skills-container .skill-section').forEach((skill, i) => {
            const name = skill.querySelector('h3 input').value || 'Not specified';
            const activity = skill.querySelector('div:nth-child(2) input').value || 'Not specified';
            const resources = skill.querySelector('div:nth-child(3) input').value || 'Not specified';
            const time = skill.querySelector('div:nth-child(4) input').value || 'Not specified';
            const start = formatDate(skill.querySelector('div:nth-child(5) input').value);
            const end = formatDate(skill.querySelector('div:nth-child(6) input').value);
            const notes = skill.querySelector('div:nth-child(7) textarea').value || 'Not provided';
            const measures = Array.from(skill.querySelector('div:nth-child(8) select').selectedOptions)
                .map(opt => opt.value).join(', ') || 'None selected';

            addText(`Skill ${i+1}: ${name}`, 20, yPos);
            addText(`Activity: ${activity}`, 30, yPos);
            addText(`Resources: ${resources}`, 30, yPos);
            addText(`Estimated Time: ${time}`, 30, yPos);
            addText(`Start Date: ${start}`, 30, yPos);
            addText(`Completion Date: ${end}`, 30, yPos);
            addText(`Progress Notes: ${notes}`, 30, yPos);
            addText(`Success Measures: ${measures}`, 30, yPos);
            yPos += 5;
        });
        yPos += 15;

        doc.setFontSize(16);
        doc.setTextColor('#1e3a8a');
        addText('Resources and Support', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        addText('Potential Mentors/Networks:', 20, yPos);
        yPos = addText(formData.mentors || 'Not provided', 30, yPos);
        addText('Budget Allocation:', 20, yPos);
        yPos = addText(formData.budget || 'Not provided', 30, yPos);
        yPos += 15;

        doc.setFontSize(16);
        doc.setTextColor('#1e3a8a');
        addText('Progress Tracking', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        addText(`30-day Review: ${formatDate(formData['review-30'])}`, 20, yPos);
        addText(`90-day Review: ${formatDate(formData['review-90'])}`, 20, yPos);
        addText(`Mid-point Review: ${formatDate(formData['review-mid'])}`, 20, yPos);
        addText(`Final Review: ${formatDate(formData['review-final'])}`, 20, yPos);
        addText('Reflection Notes:', 20, yPos);
        yPos = addText(formData.reflection || 'Not provided', 30, yPos);
        yPos += 15;

        doc.setFontSize(16);
        doc.setTextColor('#1e3a8a');
        addText('Risk Assessment and Mitigation', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        addText('If no promotion:', 20, yPos);
        yPos = addText(formData['no-promotion'] || 'Not provided', 30, yPos);
        addText('If no mentor:', 20, yPos);
        yPos = addText(formData['no-mentor'] || 'Not provided', 30, yPos);
        addText('If job loss:', 20, yPos);
        yPos = addText(formData['job-loss'] || 'Not provided', 30, yPos);
        yPos += 15;

        doc.setFontSize(16);
        doc.setTextColor('#1e3a8a');
        addText('Additional Notes', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        addText('Challenges/Obstacles:', 20, yPos);
        yPos = addText(formData.challenges || 'Not provided', 30, yPos);
        addText('Motivation/Inspiration:', 20, yPos);
        yPos = addText(formData.motivation || 'Not provided', 30, yPos);

        doc.save('ai_career_transition_plan.pdf');
        showNotification('PDF exported successfully', 'success');
    } catch (error) {
        showNotification('Error exporting to PDF', 'error');
        console.error('PDF export error:', error);
    }
}

function generatePDF() {
    try {
        const formData = getFormData();
        let content = `
            <h1>AI Career Transition Plan</h1>
            <h2>Personal Information</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Role:</strong> ${formData.role}</p>
            <p><strong>Industry:</strong> ${formData.industry}</p>
            <p><strong>Period:</strong> ${formatDate(formData['start-date'])} to ${formatDate(formData['end-date'])}</p>
            
            <h2>Career Goals</h2>
            <p><strong>Short-term:</strong> ${formData['short-term']}</p>
            <p><strong>Long-term:</strong> ${formData['long-term']}</p>
            <p><strong>Core Values:</strong> ${formData['core-values'].join(', ')}</p>
            <p><strong>Elevator Pitch:</strong> ${formData['elevator-pitch']}</p>
            <p><strong>Stop Doing:</strong> ${formData['stop-doing']}</p>
        `;

        content += `<h2>Skills Assessment</h2><table><thead><tr><th>Current Skills</th><th>Proficiency</th><th>Skills to Develop</th><th>Priority</th></tr></thead><tbody>`;
        document.querySelectorAll('#skills-table tbody tr').forEach(row => {
            const cells = row.cells;
            content += `<tr><td>${cells[0].querySelector('input').value}</td><td>${cells[1].querySelector('select').value}</td><td>${cells[2].querySelector('input').value}</td><td>${cells[3].querySelector('select').value}</td></tr>`;
        });
        content += `</tbody></table>`;

        content += `<h2>Learning and Development Plan</h2>`;
        document.querySelectorAll('#skills-container .skill-section').forEach((skill, i) => {
            content += `
                <h3>Skill ${i+1}: ${skill.querySelector('h3 input').value}</h3>
                <p><strong>Activity:</strong> ${skill.querySelector('div:nth-child(2) input').value}</p>
                <p><strong>Resources:</strong> ${skill.querySelector('div:nth-child(3) input').value}</p>
                <p><strong>Time:</strong> ${skill.querySelector('div:nth-child(4) input').value}</p>
                <p><strong>Start:</strong> ${formatDate(skill.querySelector('div:nth-child(5) input').value)}</p>
                <p><strong>End:</strong> ${formatDate(skill.querySelector('div:nth-child(6) input').value)}</p>
                <p><strong>Notes:</strong> ${skill.querySelector('div:nth-child(7) textarea').value}</p>
                <p><strong>Measures:</strong> ${Array.from(skill.querySelector('div:nth-child(8) select').selectedOptions).map(opt => opt.value).join(', ')}</p>
            `;
        });

        content += `
            <h2>Resources and Support</h2>
            <p><strong>Mentors:</strong> ${formData.mentors}</p>
            <p><strong>Budget:</strong> ${formData.budget}</p>
            
            <h2>Progress Tracking</h2>
            <p><strong>30-day:</strong> ${formatDate(formData['review-30'])}</p>
            <p><strong>90-day:</strong> ${formatDate(formData['review-90'])}</p>
            <p><strong>Mid-point:</strong> ${formatDate(formData['review-mid'])}</p>
            <p><strong>Final:</strong> ${formatDate(formData['review-final'])}</p>
            <p><strong>Reflection:</strong> ${formData.reflection}</p>
            
            <h2>Risk Assessment</h2>
            <p><strong>No Promotion:</strong> ${formData['no-promotion']}</p>
            <p><strong>No Mentor:</strong> ${formData['no-mentor']}</p>
            <p><strong>Job Loss:</strong> ${formData['job-loss']}</p>
            
            <h2>Additional Notes</h2>
            <p><strong>Challenges:</strong> ${formData.challenges}</p>
            <p><strong>Motivation:</strong> ${formData.motivation}</p>
        `;

        const preview = document.getElementById('pdf-preview');
        preview.innerHTML = content;
        preview.style.display = 'block';
        setTimeout(() => {
            window.print();
            preview.style.display = 'none';
        }, 100);
    } catch (error) {
        showNotification('Error generating preview', 'error');
        console.error('Preview error:', error);
    }
}

function addSkillRow() {
    try {
        const table = document.querySelector('#skills-table tbody');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" placeholder="e.g., Project Management"></td>
            <td><select>
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Elementary</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
            </select></td>
            <td><input type="text" placeholder="e.g., AI for Project Managers"></td>
            <td><select>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
            </select></td>
            <td><button class="remove-button" onclick="this.parentNode.parentNode.remove()">Remove</button></td>
        `;
        table.appendChild(row);
    } catch (error) {
        showNotification('Error adding skill row', 'error');
        console.error('Add skill row error:', error);
    }
}

function addSkill() {
    try {
        const container = document.getElementById('skills-container');
        const count = container.children.length + 1;
        const div = document.createElement('div');
        div.className = 'skill-section';
        div.innerHTML = `
            <h3>Skill ${count}: <input type="text" placeholder="Enter skill name"></h3>
            <div><label>Learning Activity:</label><input type="text"></div>
            <div><label>Resources Needed:</label><input type="text"></div>
            <div><label>Estimated Time:</label><input type="text" placeholder="e.g., 10 hours"></div>
            <div><label>Start Date:</label><input type="date"></div>
            <div><label>Completion Date:</label><input type="date"></div>
            <div><label>Progress Notes:</label><textarea></textarea></div>
            <div><label>Success Measures:</label>
                <select multiple>
                    <option value="pass">Pass assessment</option>
                    <option value="Complete">Complete project</option>
                    <option value="Certification">Earn certification</option>
                    <option value="feedback">Positive feedback</option>
                </select>
            </div>
            <button class="remove-button" onclick="removeSkill(this)">Remove Skill</button>
        `;
        container.appendChild(div);
    } catch (error) {
        showNotification('Error adding skill', 'error');
        console.error('Add skill error:', error);
    }
}

function removeSkill(button) {
    try {
        const section = button.parentNode;
        section.parentNode.removeChild(section);
        const sections = document.querySelectorAll('.skill-section');
        sections.forEach((sec, i) => {
            sec.querySelector('h3').innerHTML = `Skill ${i+1}: <input type="text" placeholder="Enter skill name" value="${sec.querySelector('input').value}">`;
        });
    } catch (error) {
        showNotification('Error removing skill', 'error');
        console.error('Remove skill error:', error);
    }
}

document.getElementById('fileInput').addEventListener('change', (e) => {
    try {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                setFormValues(data);
                showNotification('Import successful', 'success');
            } catch (error) {
                showNotification('Invalid JSON file', 'error');
                console.error('Import parse error:', error);
            }
        };
        reader.onerror = () => showNotification('Error reading file', 'error');
        reader.readAsText(file);
    } catch (error) {
        showNotification('Error handling import', 'error');
        console.error('Import error:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    try {
        const today = new Date();
        const sixMonths = new Date(today.setMonth(today.getMonth() + 6));
        document.getElementById('start-date').valueAsDate = new Date();
        document.getElementById('end-date').valueAsDate = sixMonths;
        addSkillRow();
        loadForm();
    } catch (error) {
        showNotification('Error initializing form', 'error');
        console.error('Init error:', error);
    }
});