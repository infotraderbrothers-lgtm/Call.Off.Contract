// Initialize signature pad
let canvas, ctx, isDrawing = false, signatureData = null;

document.addEventListener('DOMContentLoaded', function() {
  // Set today's date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('clientDate').value = today;
  
  // Initialize canvas
  canvas = document.getElementById('clientSignaturePad');
  ctx = canvas.getContext('2d');
  
  // Set canvas size
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Mouse events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  // Touch events
  canvas.addEventListener('touchstart', handleTouch);
  canvas.addEventListener('touchmove', handleTouch);
  canvas.addEventListener('touchend', stopDrawing);
});

function startDrawing(e) {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
}

function stopDrawing() {
  if (isDrawing) {
    isDrawing = false;
    signatureData = canvas.toDataURL();
  }
}

function handleTouch(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

function clearClientSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  signatureData = null;
}

function toggleNameEdit() {
  const input = document.getElementById('clientName');
  const checkbox = document.getElementById('nameCheckbox');
  input.readOnly = checkbox.checked;
}

function togglePositionEdit() {
  const input = document.getElementById('clientPosition');
  const checkbox = document.getElementById('positionCheckbox');
  input.readOnly = checkbox.checked;
}

function submitContract() {
  // Validate all required fields
  const requiredFields = [
    { id: 'projectTitle', label: 'Project Title' },
    { id: 'projectAddress', label: 'Project Address' },
    { id: 'quotationReference', label: 'Quotation Reference' },
    { id: 'quotationDate', label: 'Quotation Date' },
    { id: 'scopeOfWorks', label: 'Scope of Works' },
    { id: 'materialsResponsibility', label: 'Materials Responsibility' },
    { id: 'drawingsReference', label: 'Drawings/Specifications' },
    { id: 'startDate', label: 'Anticipated Start Date' },
    { id: 'completionDate', label: 'Anticipated Completion Date' },
    { id: 'estimatedDuration', label: 'Estimated Duration' },
    { id: 'programmeNotes', label: 'Programme Notes / Milestones' },
    { id: 'contractPrice', label: 'Contract Price' },
    { id: 'pricingBasis', label: 'Pricing Basis' },
    { id: 'paymentTerms', label: 'Payment Terms' },
    { id: 'retentionTerms', label: 'Retention' },
    { id: 'specialRequirements', label: 'Special Requirements' }
  ];
  
  const emptyFields = [];
  
  for (const field of requiredFields) {
    const element = document.getElementById(field.id);
    if (!element.value.trim()) {
      emptyFields.push(field.label);
    }
  }
  
  // Check client signature fields
  const name = document.getElementById('clientName').value.trim();
  const position = document.getElementById('clientPosition').value.trim();
  const date = document.getElementById('clientDate').value;
  
  if (!name) emptyFields.push('Client Name');
  if (!position) emptyFields.push('Client Position');
  if (!signatureData) emptyFields.push('Client Signature');
  
  const nameConfirmed = document.getElementById('nameCheckbox').checked;
  const positionConfirmed = document.getElementById('positionCheckbox').checked;
  
  if (name && !nameConfirmed) emptyFields.push('Name Confirmation (checkbox)');
  if (position && !positionConfirmed) emptyFields.push('Position Confirmation (checkbox)');
  
  // If there are empty fields, show alert and stop
  if (emptyFields.length > 0) {
    const fieldList = emptyFields.join('\n• ');
    alert(`Please fill in the following required fields:\n\n• ${fieldList}`);
    return;
  }
  
  // All fields are filled, proceed with submission
  fillPlaceholders();
  
  // Hide sign section, show signed section
  document.getElementById('client-sign-section').style.display = 'none';
  
  const signedSection = document.getElementById('client-signed-section');
  signedSection.style.display = 'block';
  signedSection.innerHTML = `
    <div class="digital-sig-box" style="max-width: 100%;">
      <div class="sig-info-label">Name</div>
      <div class="sig-info-name">${name}</div>
      <div class="sig-info-position">${position}</div>
      <div class="sig-info-label" style="margin-top: 15px;">Signature</div>
      <div class="sig-image-box">
        <img src="${signatureData}" alt="${name} Signature" style="max-height: 60px;">
      </div>
      <div class="sig-info-label" style="margin-top: 15px;">Date</div>
      <div class="sig-info-name">${formatDate(date)}</div>
    </div>
  `;
  
  document.getElementById('contract-actions').style.display = 'block';
  
  // Hide all input fields and show completed contract
  hideInputFields();
  
  // Show success popup
  showSuccessPopup();
}

function fillPlaceholders() {
  // This function is no longer needed as we're hiding inputs and showing values
  // Keeping it for potential future use
}

function hideInputFields() {
  // Hide all input fields and show their values in the document
  const inputs = document.querySelectorAll('.editable-input, .editable-textarea');
  
  inputs.forEach(input => {
    const value = input.value.trim() || '[Not provided]';
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'filled-value';
    valueDisplay.textContent = value;
    valueDisplay.style.fontWeight = 'normal';
    
    // For textareas, preserve line breaks
    if (input.tagName === 'TEXTAREA') {
      valueDisplay.style.whiteSpace = 'pre-wrap';
    }
    
    input.style.display = 'none';
    input.parentNode.insertBefore(valueDisplay, input.nextSibling);
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  
  const suffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${day}${suffix(day)} ${month} ${year}`;
}

function showSuccessPopup() {
  const popup = document.createElement('div');
  popup.className = 'popup-overlay';
  popup.style.display = 'flex';
  popup.innerHTML = `
    <div class="popup-content">
      <div class="popup-checkmark">✓</div>
      <h2>Contract Signed!</h2>
      <p class="popup-text">Your signature has been successfully added to the Call-Off Contract.</p>
      <p class="popup-delivery">The signed contract is ready for delivery.</p>
      <button onclick="closePopup()" class="btn-primary">Continue</button>
    </div>
  `;
  document.body.appendChild(popup);
  
  popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
  });
}

function closePopup() {
  const popup = document.querySelector('.popup-overlay');
  if (popup) popup.remove();
}

function viewContract() {
  window.print();
}

function sendToWebhook() {
  const btn = document.getElementById('sendWebhookBtn');
  btn.disabled = true;
  btn.textContent = 'Sending...';
  
  // Collect all form data in the formatted string format
  const formattedData = `Project Title: ${document.getElementById('projectTitle').value}
Project Address: ${document.getElementById('projectAddress').value}
Quotation Reference: ${document.getElementById('quotationReference').value}
Quotation Date: ${document.getElementById('quotationDate').value}

SCOPE OF WORKS
Scope of Works: ${document.getElementById('scopeOfWorks').value}
Materials Responsibility: ${document.getElementById('materialsResponsibility').value}
Drawings/Specifications: ${document.getElementById('drawingsReference').value}

PROGRAMME
Anticipated Start Date: ${document.getElementById('startDate').value}
Anticipated Completion Date: ${document.getElementById('completionDate').value}
Estimated Duration: ${document.getElementById('estimatedDuration').value}
Programme Notes / Milestones: ${document.getElementById('programmeNotes').value}

COMMERCIAL TERMS
Contract Price (ex. VAT): ${document.getElementById('contractPrice').value}
Pricing Basis: ${document.getElementById('pricingBasis').value}
Payment Terms: ${document.getElementById('paymentTerms').value}
Retention: ${document.getElementById('retentionTerms').value}

SPECIAL REQUIREMENTS
Special Requirements: ${document.getElementById('specialRequirements').value}

CLIENT SIGNATURE
Client Name: ${document.getElementById('clientName').value}
Client Position: ${document.getElementById('clientPosition').value}
Client Date: ${document.getElementById('clientDate').value}
Timestamp: ${new Date().toISOString()}`;

  const contractData = {
    formattedContract: formattedData
  };
  
  // Replace this URL with your actual Make.com webhook URL
  const webhookUrl = 'YOUR_MAKE_COM_WEBHOOK_URL_HERE';
  
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contractData)
  })
  .then(response => {
    if (response.ok) {
      // Show thank you popup
      showThankYouPopup();
      btn.textContent = 'Sent ✓';
      btn.style.background = '#4caf50';
    } else {
      throw new Error('Failed to send');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Failed to send contract. Please try again or contact support.');
    btn.disabled = false;
    btn.textContent = 'Send Contract';
  });
}

function showThankYouPopup() {
  const popup = document.createElement('div');
  popup.className = 'popup-overlay';
  popup.style.display = 'flex';
  popup.innerHTML = `
    <div class="popup-content">
      <div class="popup-checkmark">✓</div>
      <h2>Thank You!</h2>
      <p class="popup-text">The Call-Off Contract has been successfully sent to the contractors.</p>
      <p class="popup-delivery">A copy will arrive in your inbox within the next 5 minutes.</p>
      <button onclick="closePopup()" class="btn-primary">Close</button>
    </div>
  `;
  document.body.appendChild(popup);
  
  popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
  });
}
